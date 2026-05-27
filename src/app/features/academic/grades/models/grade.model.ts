export type EvaluationType = 'HOMEWORK' | 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PROJECT';

export interface Grade {
  id: string;
  tenantId: string;
  studentName: string;
  registrationNumber: string;
  subject: string;
  evaluationType: EvaluationType;
  score: number;
  maxScore: number;
  evaluatedAt: string;
}

export interface GradeFilter {
  search?: string;
  evaluationType?: EvaluationType;
  subject?: string;
}

export type GradeDraft = Omit<Grade, 'id' | 'tenantId'>;
