"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import questionsData from "@/data/questions.json";
import { getHistory, clearHistory } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import type { Topic, StudyHistory } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  コンピューティング: "bg-blue-100 text-blue-700",
  ストレージ: "bg-green-100 text-green-700",
  ネットワーク: "bg-purple-100 text-purple-700",
  データベース: "bg-orange-100 text-orange-700",
  セキュリティ: "bg-red-100 text-red-700",
  "アプリケーション統合": "bg-yellow-100 text-yellow-700",
  "管理・ガバナンス": "bg-gray-100 text-gray-700",
  "監視・管理": "bg-teal-100 text-teal-700",
};

const CATEGORIES = [
  "コンピューティング",
  "ストレージ",
  "ネットワーク",
  "データベース",
  "セキュリティ",
  "アプリケーション統合",
  "管理・ガバナンス",
  "監視・管理",
];

export default function ProgressPage() {
  const topics: Topic[] = questionsData.topics as Topic[];
  const [history, setHistory] = useState<StudyHistory>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setMounted(true);
  }, []);

  const learnedCount = Object.keys(history).length;
  const totalCount = topics.length;
  const progressPct = Math.round((learnedCount / totalCount) * 100);

  function handleClear() {
    if (confirm("学習履歴をすべてリセットしますか？")) {
      clearHistory();
      setHistory({});
    }
  }

  const categorized = CATEGORIES.map((cat) => ({
    name: cat,
    topics: topics.filter((t) => t.category === cat),
  })).filter((c) => c.topics.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-semibold text-slate-700 text-lg">進捗・振り返り</span>
          {mounted && learnedCount > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              リセット
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Overall progress */}
        {mounted && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">全体の進捗</span>
              <span className="text-sm font-bold text-blue-600">
                {learnedCount} / {totalCount} トピック
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-400">{progressPct}% 完了</span>
              <span className="text-xs text-slate-400">残り {totalCount - learnedCount} トピック</span>
            </div>
          </div>
        )}

        {/* Topics by category */}
        {categorized.map((cat) => {
          const catColor = CATEGORY_COLORS[cat.name] ?? "bg-gray-100 text-gray-700";
          const catLearned = cat.topics.filter((t) => !!history[t.id]).length;

          return (
            <section key={cat.name}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${catColor}`}>
                    {cat.name}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {catLearned} / {cat.topics.length}
                </span>
              </div>
              <div className="space-y-2">
                {cat.topics.map((topic) => {
                  const prog = history[topic.id];
                  const isLearned = !!prog;
                  const pct = isLearned ? Math.round((prog.score / prog.total) * 100) : null;
                  const date = isLearned
                    ? new Date(prog.completedAt).toLocaleDateString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                      })
                    : null;

                  return (
                    <Link
                      key={topic.id}
                      href={`/study/${topic.id}`}
                      className="flex items-center justify-between bg-white rounded-xl border border-slate-100 px-4 py-3 hover:shadow-sm hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            isLearned ? "bg-green-400" : "bg-slate-200"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                            {topic.name}
                          </p>
                          {isLearned && (
                            <p className="text-xs text-slate-400">
                              {date} · 正答率 {pct}%
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLearned ? (
                          <span className="text-xs bg-green-100 text-green-600 font-medium px-2 py-0.5 rounded-full">
                            学習済み
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            未学習
                          </span>
                        )}
                        <span className="text-slate-300 group-hover:text-blue-400 transition-colors">→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
      <BottomNav />
    </div>
  );
}
