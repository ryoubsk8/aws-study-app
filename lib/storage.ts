import type { StudyHistory, TopicProgress } from "@/types";

const STORAGE_KEY = "aws_study_history";

export function getHistory(): StudyHistory {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: TopicProgress): void {
  const history = getHistory();
  history[progress.topicId] = progress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
