export type Question = {
  id: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
};

export type Topic = {
  id: string;
  name: string;
  category: string;
  questions: Question[];
};

export type TopicProgress = {
  topicId: string;
  completedAt: string;
  score: number;
  total: number;
};

export type StudyHistory = {
  [topicId: string]: TopicProgress;
};
