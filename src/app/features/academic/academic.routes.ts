import { Routes } from '@angular/router';

export const ACADEMIC_ROUTES: Routes = [
  {
    path: 'students',
    loadChildren: () =>
      import('./students/students.routes').then((m) => m.STUDENTS_ROUTES),
  },
  {
    path: 'teachers',
    loadChildren: () =>
      import('./teachers/teachers.routes').then((m) => m.TEACHERS_ROUTES),
  },
  {
    path: 'timetable',
    loadChildren: () =>
      import('./timetable/timetable.routes').then((m) => m.TIMETABLE_ROUTES),
  },
  {
    path: 'grades',
    loadChildren: () =>
      import('./grades/grades.routes').then((m) => m.GRADES_ROUTES),
  },
  {
    path: 'sessions',
    loadChildren: () =>
      import('./sessions/sessions.routes').then((m) => m.SESSIONS_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'students' },
];
