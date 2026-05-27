export interface SubjectStats {
  subject: string;
  average: number;
  passRate: number;
  enrolled: number;
}

export interface StudentRanking {
  name: string;
  classGroup: string;
  average: number;
}

export interface RapportPedagogique {
  periodLabel: string;
  classLabel: string;
  overallAverage: number;
  passRate: number;
  totalStudents: number;
  bySubject: SubjectStats[];
  topPerformers: StudentRanking[];
  inDifficulty: StudentRanking[];
}
