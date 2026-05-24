"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import questionsData from "@/data/questions.json";
import { getHistory } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import type { Topic, StudyHistory } from "@/types";

const COUNT_KEY = "aws_topic_count";
const DEFAULT_COUNT = 5;
const MIN_COUNT = 1;
const MAX_COUNT = 10;

function getTopics(topics: Topic[], history: StudyHistory, count: number, seed: number): Topic[] {
  const unlearned = topics.filter((t) => !history[t.id]);
  if (unlearned.length <= count) return unlearned;

  let s = seed;
  const shuffled = [...unlearned];
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function dateSeed(): number {
  const today = new Date().toISOString().slice(0, 10);
  return today.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

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

export default function Home() {
  const topics: Topic[] = questionsData.topics as Topic[];
  const [history, setHistory] = useState<StudyHistory>({});
  const [topicCount, setTopicCount] = useState(DEFAULT_COUNT);
  const [seed, setSeed] = useState(dateSeed());
  const [spinning, setSpinning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    const saved = localStorage.getItem(COUNT_KEY);
    if (saved) setTopicCount(Math.min(MAX_COUNT, Math.max(MIN_COUNT, Number(saved))));
    setMounted(true);
  }, []);

  function changeCount(delta: number) {
    setTopicCount((prev) => {
      const next = Math.min(MAX_COUNT, Math.max(MIN_COUNT, prev + delta));
      localStorage.setItem(COUNT_KEY, String(next));
      return next;
    });
  }

  function shuffle() {
    setSpinning(true);
    setSeed(Math.floor(Math.random() * 0x7fffffff));
    setTimeout(() => setSpinning(false), 500);
  }

  const todaysTopics = getTopics(topics, history, topicCount, seed);
  const learnedCount = Object.keys(history).length;
  const totalCount = topics.length;
  const progressPct = Math.round((learnedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800">AWS SAA 学習アプリ</h1>
          <p className="text-xs text-slate-500">Solutions Architect Associate</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 進捗バー */}
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
            <p className="text-xs text-slate-400 mt-2 text-right">{progressPct}% 完了</p>
          </div>
        )}

        {/* 今日のトピック ヘッダー */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-800">今日のトピック</span>
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {todaysTopics.length}
              </span>
            </div>

            {/* コントロール：件数 + シャッフル */}
            <div className="flex items-center gap-3">
              {/* 件数ステッパー */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-1 py-1">
                <button
                  onClick={() => changeCount(-1)}
                  disabled={topicCount <= MIN_COUNT}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg leading-none"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-700">{topicCount}</span>
                <button
                  onClick={() => changeCount(1)}
                  disabled={topicCount >= MAX_COUNT}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg leading-none"
                >
                  ＋
                </button>
              </div>

              {/* シャッフルボタン */}
              <button
                onClick={shuffle}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-all active:scale-90"
                title="シャッフル"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-5 h-5 transition-transform duration-500 ${spinning ? "rotate-180" : ""}`}
                >
                  <path d="M16 3h5v5" />
                  <path d="M4 20L21 3" />
                  <path d="M21 16v5h-5" />
                  <path d="M15 15l5.1 5.1" />
                  <path d="M4 4l5 5" />
                </svg>
              </button>
            </div>
          </div>

          {/* トピックリスト */}
          {todaysTopics.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-bold text-slate-700 text-lg">すべてのトピックを学習しました！</p>
              <p className="text-slate-500 text-sm mt-1">振り返りで復習してみましょう</p>
              <Link
                href="/progress"
                className="inline-block mt-4 bg-blue-500 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                振り返りへ
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysTopics.map((topic) => {
                const prog = history[topic.id];
                const isLearned = !!prog;
                const categoryColor = CATEGORY_COLORS[topic.category] ?? "bg-gray-100 text-gray-700";

                return (
                  <Link
                    key={topic.id}
                    href={`/study/${topic.id}`}
                    className="block bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor}`}>
                            {topic.category}
                          </span>
                          {isLearned && (
                            <span className="text-xs text-green-600 font-medium">✓ 学習済み</span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                          {topic.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {topic.questions.length}問
                          {isLearned && ` · 正答率 ${Math.round((prog.score / prog.total) * 100)}%`}
                        </p>
                      </div>
                      <div className="ml-3 text-slate-300 group-hover:text-blue-400 transition-colors text-xl">
                        →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
