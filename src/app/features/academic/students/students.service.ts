import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@env/environment";
import { map, Observable } from "rxjs";
import { Student, StudentDraft } from "./models/student.model";
import { ApiResponse } from "@core/models/apiResponse";

@Injectable({ providedIn: "root" })
export class StudentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/students`;

  list(): Observable<Student[]> {
    return this.http
      .get<ApiResponse.Items<Student>>(this.baseUrl)
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<Student | undefined> {
    return this.http
      .get<ApiResponse.Items<Student>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data[0]));
  }

  create(draft: StudentDraft): Observable<Student> {
    const student: Student = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: "t-1",
      enrolledAt: new Date().toISOString(),
    };
    return this.http
      .post<ApiResponse.Items<Student>>(this.baseUrl, student)
      .pipe(map((response) => response.data[0]));
  }

  update(id: string, draft: StudentDraft): Observable<Student> {
    return this.http
      .put<ApiResponse.Items<Student>>(`${this.baseUrl}/${id}`, draft)
      .pipe(map((response) => response.data[0]));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private seed(): Student[] {
    return [
      {
        id: "s-1",
        tenantId: "t-1",
        registrationNumber: "STU-2024-001",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@school.edu",
        birthDate: "2008-04-12",
        level: "SECONDARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-2",
        tenantId: "t-1",
        registrationNumber: "STU-2023-014",
        firstName: "Marcus",
        lastName: "Lee",
        email: "marcus.lee@uni.edu",
        birthDate: "2003-07-22",
        level: "UNDERGRAD",
        status: "ACTIVE",
        enrolledAt: "2023-09-01T00:00:00Z",
      },
      {
        id: "s-3",
        tenantId: "t-1",
        registrationNumber: "STU-2022-009",
        firstName: "Sofia",
        lastName: "Martinez",
        email: "sofia.martinez@uni.edu",
        birthDate: "2001-11-03",
        level: "GRADUATE",
        status: "GRADUATED",
        enrolledAt: "2022-09-01T00:00:00Z",
      },
    ];
  }
}
