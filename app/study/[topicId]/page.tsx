"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import questionsData from "@/data/questions.json";
import { saveProgress } from "@/lib/storage";
import type { Topic, Question } from "@/types";

type Phase = "question" | "explanation" | "result";

export default function StudyPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const router = useRouter();

  const topic = (questionsData.topics as Topic[]).find((t) => t.id === topicId);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("question");
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!topic) router.replace("/");
  }, [topic, router]);

  if (!topic) return null;

  const questions: Question[] = topic.questions;
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const isCorrect = selected === q.answer;

  function handleSelect(idx: number) {
    if (phase !== "question") return;
    setSelected(idx);
    setPhase("explanation");
    if (idx === q.answer) setScore((s) => s + 1);
  }

  function handleNext() {
    if (isLast) {
      // score は handleSelect で加算済み（React state の非同期更新があるため setScore のコールバックを経由して保存）
      setScore((s) => {
        saveProgress({
          topicId: topic!.id,
          completedAt: new Date().toISOString(),
          score: s,
          total: questions.length,
        });
        return s;
      });
      setPhase("result");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setPhase("question");
    }
  }

  if (phase === "result") {
    const finalScore = score;
    const pct = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
              ← ホーム
            </Link>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-700">{topic.name}</span>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">{pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "📚"}</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">学習完了！</h2>
            <p className="text-slate-500 mb-6">{topic.name}</p>
            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <p className="text-4xl font-bold text-blue-600 mb-1">{pct}%</p>
              <p className="text-slate-500 text-sm">
                {finalScore} / {questions.length} 問正解
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="bg-blue-500 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                ホームに戻る
              </Link>
              <button
                onClick={() => {
                  setCurrent(0);
                  setSelected(null);
                  setPhase("question");
                  setScore(0);
                }}
                className="border border-slate-200 text-slate-600 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                もう一度挑戦
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
              ← ホーム
            </Link>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-700 truncate max-w-[180px]">{topic.name}</span>
          </div>
          <span className="text-sm text-slate-500">
            {current + 1} / {questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-blue-500 h-1 transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Q{current + 1}
            </span>
            <span className="text-xs text-slate-400">{topic.category}</span>
          </div>
          <p className="text-slate-800 font-medium leading-relaxed text-[15px]">{q.question}</p>
        </div>

        {/* Choices */}
        <div className="space-y-2.5">
          {q.choices.map((choice, idx) => {
            let style = "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50";
            if (phase === "explanation") {
              if (idx === q.answer) {
                style = "border-green-400 bg-green-50";
              } else if (idx === selected && idx !== q.answer) {
                style = "border-red-300 bg-red-50";
              } else {
                style = "border-slate-100 bg-white opacity-60";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={phase !== "question"}
                className={`w-full text-left rounded-xl border p-4 transition-all flex items-start gap-3 ${style}`}
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                    phase === "explanation" && idx === q.answer
                      ? "bg-green-500 text-white"
                      : phase === "explanation" && idx === selected && idx !== q.answer
                      ? "bg-red-400 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-slate-700 text-sm leading-relaxed">{choice}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {phase === "explanation" && (
          <div
            className={`rounded-2xl border p-5 ${
              isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{isCorrect ? "✅" : "❌"}</span>
              <span className={`font-bold text-sm ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                {isCorrect ? "正解！" : `不正解 — 正解は ${String.fromCharCode(65 + q.answer)}`}
              </span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{q.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {phase === "explanation" && (
          <button
            onClick={handleNext}
            className="w-full bg-blue-500 text-white font-semibold py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
          >
            {isLast ? "結果を見る" : "次の問題へ →"}
          </button>
        )}
      </main>
    </div>
  );
}
