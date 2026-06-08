import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiResponse } from "@core/models/apiResponse";
import { environment } from "@env/environment";
import { delay, map, Observable, of } from "rxjs";
import { Student, StudentDraft, StudentFilter } from "./models/student.model";

@Injectable({ providedIn: "root" })
export class StudentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/students`;

  list(filter: StudentFilter = {}): Observable<ApiResponse.Items<Student>> {
    // --- Branche API réelle (désactivée tant que le backend n'est pas prêt) ---
    // let params = new HttpParams();
    // if (filter.search) params = params.set("q", filter.search);
    // if (filter.level) params = params.set("level", filter.level);
    // if (filter.status) params = params.set("status", filter.status);
    // params = params.set("page", String(filter.page ?? 1));
    // params = params.set("size", String(filter.size ?? 20));
    // return this.http.get<ApiResponse.Items<Student>>(this.baseUrl, { params });

    // --- Mock : filtre + pagination côté client sur les données seedées ---
    const page = Math.max(1, filter.page ?? 1);
    const size = Math.max(1, filter.size ?? 20);
    const search = filter.search?.toLowerCase().trim();

    const all = this.seed().data.filter((s) => {
      if (filter.level && s.level !== filter.level) return false;
      if (filter.status && s.status !== filter.status) return false;
      if (search) {
        const haystack =
          `${s.firstName} ${s.lastName} ${s.email} ${s.registrationNumber}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const totalItems = all.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / size));
    const start = (page - 1) * size;
    const data = all.slice(start, start + size);
    const query = `?page=${page}&size=${size}`;

    const response: ApiResponse.Items<Student> = {
      data,
      meta: { page, size, totalItems, totalPages },
      links: {
        self: `${this.baseUrl}${query}`,
        first: `${this.baseUrl}?page=1&size=${size}`,
        last: `${this.baseUrl}?page=${totalPages}&size=${size}`,
      },
    };

    return of(response).pipe(delay(500)); // Simule la latence réseau
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

  /** Fixture de pagination : renvoie une réponse paginée mock au format API réel. */
  private seed(): ApiResponse.Items<Student> {
    const data: Student[] = [
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
      {
        id: "s-4",
        tenantId: "t-1",
        registrationNumber: "STU-2024-002",
        firstName: "Liam",
        lastName: "Nguyen",
        email: "liam.nguyen@school.edu",
        birthDate: "2009-01-18",
        level: "PRIMARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-5",
        tenantId: "t-1",
        registrationNumber: "STU-2024-003",
        firstName: "Emma",
        lastName: "Dubois",
        email: "emma.dubois@school.edu",
        birthDate: "2008-06-30",
        level: "SECONDARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-6",
        tenantId: "t-1",
        registrationNumber: "STU-2023-015",
        firstName: "Noah",
        lastName: "Schmidt",
        email: "noah.schmidt@uni.edu",
        birthDate: "2004-02-14",
        level: "UNDERGRAD",
        status: "SUSPENDED",
        enrolledAt: "2023-09-01T00:00:00Z",
      },
      {
        id: "s-7",
        tenantId: "t-1",
        registrationNumber: "STU-2022-010",
        firstName: "Olivia",
        lastName: "Rossi",
        email: "olivia.rossi@uni.edu",
        birthDate: "2000-09-09",
        level: "GRADUATE",
        status: "ACTIVE",
        enrolledAt: "2022-09-01T00:00:00Z",
      },
      {
        id: "s-8",
        tenantId: "t-1",
        registrationNumber: "STU-2021-004",
        firstName: "William",
        lastName: "Kowalski",
        email: "william.kowalski@uni.edu",
        birthDate: "1999-12-01",
        level: "GRADUATE",
        status: "GRADUATED",
        enrolledAt: "2021-09-01T00:00:00Z",
      },
      {
        id: "s-9",
        tenantId: "t-1",
        registrationNumber: "STU-2024-004",
        firstName: "Ava",
        lastName: "Andersson",
        email: "ava.andersson@school.edu",
        birthDate: "2010-03-22",
        level: "PRIMARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-10",
        tenantId: "t-1",
        registrationNumber: "STU-2023-016",
        firstName: "James",
        lastName: "O'Brien",
        email: "james.obrien@uni.edu",
        birthDate: "2003-11-11",
        level: "UNDERGRAD",
        status: "ACTIVE",
        enrolledAt: "2023-09-01T00:00:00Z",
      },
      {
        id: "s-11",
        tenantId: "t-1",
        registrationNumber: "STU-2023-017",
        firstName: "Isabella",
        lastName: "Costa",
        email: "isabella.costa@uni.edu",
        birthDate: "2004-07-05",
        level: "UNDERGRAD",
        status: "WITHDRAWN",
        enrolledAt: "2023-09-01T00:00:00Z",
      },
      {
        id: "s-12",
        tenantId: "t-1",
        registrationNumber: "STU-2024-005",
        firstName: "Lucas",
        lastName: "Müller",
        email: "lucas.muller@school.edu",
        birthDate: "2008-10-19",
        level: "SECONDARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-13",
        tenantId: "t-1",
        registrationNumber: "STU-2022-011",
        firstName: "Mia",
        lastName: "Yamamoto",
        email: "mia.yamamoto@uni.edu",
        birthDate: "2001-05-27",
        level: "GRADUATE",
        status: "ACTIVE",
        enrolledAt: "2022-09-01T00:00:00Z",
      },
      {
        id: "s-14",
        tenantId: "t-1",
        registrationNumber: "STU-2024-006",
        firstName: "Benjamin",
        lastName: "Petit",
        email: "benjamin.petit@school.edu",
        birthDate: "2009-08-03",
        level: "PRIMARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-15",
        tenantId: "t-1",
        registrationNumber: "STU-2023-018",
        firstName: "Charlotte",
        lastName: "Ivanova",
        email: "charlotte.ivanova@uni.edu",
        birthDate: "2003-04-16",
        level: "UNDERGRAD",
        status: "ACTIVE",
        enrolledAt: "2023-09-01T00:00:00Z",
      },
      {
        id: "s-16",
        tenantId: "t-1",
        registrationNumber: "STU-2021-005",
        firstName: "Henry",
        lastName: "Garcia",
        email: "henry.garcia@uni.edu",
        birthDate: "1998-06-21",
        level: "GRADUATE",
        status: "GRADUATED",
        enrolledAt: "2021-09-01T00:00:00Z",
      },
      {
        id: "s-17",
        tenantId: "t-1",
        registrationNumber: "STU-2024-007",
        firstName: "Amelia",
        lastName: "Nowak",
        email: "amelia.nowak@school.edu",
        birthDate: "2008-12-09",
        level: "SECONDARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-18",
        tenantId: "t-1",
        registrationNumber: "STU-2023-019",
        firstName: "Alexander",
        lastName: "Hansen",
        email: "alexander.hansen@uni.edu",
        birthDate: "2004-01-30",
        level: "UNDERGRAD",
        status: "SUSPENDED",
        enrolledAt: "2023-09-01T00:00:00Z",
      },
      {
        id: "s-19",
        tenantId: "t-1",
        registrationNumber: "STU-2022-012",
        firstName: "Sophia",
        lastName: "Lefebvre",
        email: "sophia.lefebvre@uni.edu",
        birthDate: "2000-03-12",
        level: "GRADUATE",
        status: "ACTIVE",
        enrolledAt: "2022-09-01T00:00:00Z",
      },
      {
        id: "s-20",
        tenantId: "t-1",
        registrationNumber: "STU-2024-008",
        firstName: "Daniel",
        lastName: "Silva",
        email: "daniel.silva@school.edu",
        birthDate: "2010-05-25",
        level: "PRIMARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-21",
        tenantId: "t-1",
        registrationNumber: "STU-2023-020",
        firstName: "Evelyn",
        lastName: "Tanaka",
        email: "evelyn.tanaka@uni.edu",
        birthDate: "2003-09-17",
        level: "UNDERGRAD",
        status: "ACTIVE",
        enrolledAt: "2023-09-01T00:00:00Z",
      },
      {
        id: "s-22",
        tenantId: "t-1",
        registrationNumber: "STU-2022-013",
        firstName: "Matthew",
        lastName: "Wagner",
        email: "matthew.wagner@uni.edu",
        birthDate: "2001-02-08",
        level: "GRADUATE",
        status: "WITHDRAWN",
        enrolledAt: "2022-09-01T00:00:00Z",
      },
      {
        id: "s-23",
        tenantId: "t-1",
        registrationNumber: "STU-2024-009",
        firstName: "Harper",
        lastName: "Moreau",
        email: "harper.moreau@school.edu",
        birthDate: "2008-07-14",
        level: "SECONDARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-24",
        tenantId: "t-1",
        registrationNumber: "STU-2024-010",
        firstName: "Sebastian",
        lastName: "Lopez",
        email: "sebastian.lopez@school.edu",
        birthDate: "2009-11-02",
        level: "PRIMARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-25",
        tenantId: "t-1",
        registrationNumber: "STU-2023-021",
        firstName: "Abigail",
        lastName: "Novak",
        email: "abigail.novak@uni.edu",
        birthDate: "2004-04-28",
        level: "UNDERGRAD",
        status: "ACTIVE",
        enrolledAt: "2023-09-01T00:00:00Z",
      },
      {
        id: "s-26",
        tenantId: "t-1",
        registrationNumber: "STU-2021-006",
        firstName: "Jack",
        lastName: "Bianchi",
        email: "jack.bianchi@uni.edu",
        birthDate: "1999-08-19",
        level: "GRADUATE",
        status: "GRADUATED",
        enrolledAt: "2021-09-01T00:00:00Z",
      },
      {
        id: "s-27",
        tenantId: "t-1",
        registrationNumber: "STU-2024-011",
        firstName: "Emily",
        lastName: "Fischer",
        email: "emily.fischer@school.edu",
        birthDate: "2008-02-23",
        level: "SECONDARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
      {
        id: "s-28",
        tenantId: "t-1",
        registrationNumber: "STU-2023-022",
        firstName: "Owen",
        lastName: "Marchetti",
        email: "owen.marchetti@uni.edu",
        birthDate: "2003-06-11",
        level: "UNDERGRAD",
        status: "SUSPENDED",
        enrolledAt: "2023-09-01T00:00:00Z",
      },
      {
        id: "s-29",
        tenantId: "t-1",
        registrationNumber: "STU-2022-014",
        firstName: "Ella",
        lastName: "Sørensen",
        email: "ella.sorensen@uni.edu",
        birthDate: "2000-10-04",
        level: "GRADUATE",
        status: "ACTIVE",
        enrolledAt: "2022-09-01T00:00:00Z",
      },
      {
        id: "s-30",
        tenantId: "t-1",
        registrationNumber: "STU-2024-012",
        firstName: "Logan",
        lastName: "Roy",
        email: "logan.roy@school.edu",
        birthDate: "2009-03-29",
        level: "PRIMARY",
        status: "ACTIVE",
        enrolledAt: "2024-09-01T00:00:00Z",
      },
    ];

    return {
      data,
      meta: {
        page: 1,
        size: data.length,
        totalItems: data.length,
        totalPages: 1,
      },
      links: {
        self: `${this.baseUrl}?page=1&size=${data.length}`,
        first: `${this.baseUrl}?page=1&size=${data.length}`,
        last: `${this.baseUrl}?page=1&size=${data.length}`,
      },
    };
  }
}
