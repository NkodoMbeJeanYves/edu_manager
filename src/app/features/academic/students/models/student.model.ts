export type StudentLevel = "PRIMARY" | "SECONDARY" | "UNDERGRAD" | "GRADUATE";
export type StudentStatus = "ACTIVE" | "GRADUATED" | "SUSPENDED" | "WITHDRAWN";

export interface Student {
  id: string;
  tenantId: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  level: StudentLevel;
  programId?: string;
  classId?: string;
  status: StudentStatus;
  enrolledAt: string;
  gender?: "m" | "f" | "o";
}

export interface StudentFilter {
  search?: string;
  level?: StudentLevel;
  status?: StudentStatus;
  page?: number; // 1-based
  size?: number; // default 20
}

export type StudentDraft = Omit<Student, "id" | "tenantId" | "enrolledAt">;
