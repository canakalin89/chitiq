
export interface EvaluationScores {
  rapport: number;
  organisation: number;
  delivery: number;
  languageUse: number;
  creativity: number;
}

export interface EvaluationFeedback {
  rapport: string;
  organisation: string;
  delivery: string;
  languageUse: string;
  creativity: string;
  pronunciation: string;
  summary: string;
  transcription: string;
}

export interface EvaluationResultData {
  topic: string;
  scores: EvaluationScores;
  overallScore: number;
  feedback: EvaluationFeedback;
}

export interface Evaluation extends EvaluationResultData {
  id: string;
  date: string; // ISO 8601 format
}

export interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  students: Student[];
}

export interface StudentInfo {
  firstName: string;
  lastName: string;
  studentClass: string;
  studentNumber?: string;
  classId?: string;
}

export interface ExamSession extends Evaluation {
  studentInfo: StudentInfo;
  isExam: boolean;
}
