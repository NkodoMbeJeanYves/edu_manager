import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization.service';
import { ModuleKey } from '@core/models/auth.models';

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  path: string;
  module: ModuleKey;
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthorizationService);

  private readonly allGroups: readonly NavGroup[] = [
    {
      label: $localize`:@@sidebar.group.academic:Academic`,
      items: [
        { label: $localize`:@@sidebar.students:Students`, path: '/academic/students', module: 'academic' },
        { label: $localize`:@@sidebar.teachers:Teachers`, path: '/academic/teachers', module: 'academic' },
        { label: $localize`:@@sidebar.timetable:Timetable`, path: '/academic/timetable', module: 'academic' },
        { label: $localize`:@@sidebar.grades:Grades`, path: '/academic/grades', module: 'academic' },
        { label: $localize`:@@sidebar.sessions:Sessions`, path: '/academic/sessions', module: 'academic' },
      ],
    },
    {
      label: $localize`:@@sidebar.group.administration:Administration`,
      items: [
        { label: $localize`:@@sidebar.users:Users`, path: '/administration/users', module: 'administration' },
        { label: $localize`:@@sidebar.roles:Roles`, path: '/administration/roles', module: 'administration' },
        { label: $localize`:@@sidebar.departments:Departments`, path: '/administration/departments', module: 'administration' },
      ],
    },
    {
      label: $localize`:@@sidebar.group.finance:Finance`,
      items: [
        { label: $localize`:@@sidebar.payments:Payments`, path: '/finance/payments', module: 'finance' },
        { label: $localize`:@@sidebar.invoices:Invoices`, path: '/finance/invoices', module: 'finance' },
      ],
    },
    {
      label: $localize`:@@sidebar.group.institution:Institution`,
      items: [
        { label: $localize`:@@sidebar.etablissements:Establishments`, path: '/etablissements', module: 'etablissements' },
        { label: $localize`:@@sidebar.structure:Structure`, path: '/structure', module: 'structure' },
        { label: $localize`:@@sidebar.referentiel:Catalog`, path: '/referentiel', module: 'referentiel' },
        { label: $localize`:@@sidebar.enseignants:Teachers (HR)`, path: '/enseignants', module: 'enseignants' },
      ],
    },
    {
      label: $localize`:@@sidebar.group.studentLife:Student life`,
      items: [
        { label: $localize`:@@sidebar.inscriptions:Enrolments`, path: '/inscriptions', module: 'inscriptions' },
        { label: $localize`:@@sidebar.edt:Schedules`, path: '/edt', module: 'edt' },
        { label: $localize`:@@sidebar.absences:Absences`, path: '/absences', module: 'absences' },
      ],
    },
    {
      label: $localize`:@@sidebar.group.evaluation:Evaluation`,
      items: [
        { label: $localize`:@@sidebar.notes:Grades & evaluations`, path: '/notes', module: 'notes' },
        { label: $localize`:@@sidebar.bulletins:Report cards`, path: '/bulletins', module: 'bulletins' },
        { label: $localize`:@@sidebar.examens:Exam sessions`, path: '/examens', module: 'examens' },
      ],
    },
    {
      label: $localize`:@@sidebar.group.communication:Communication`,
      items: [
        { label: $localize`:@@sidebar.notifications:Notifications`, path: '/communication', module: 'communication' },
        { label: $localize`:@@sidebar.messages:Messages`, path: '/communication/messages', module: 'communication' },
        { label: $localize`:@@sidebar.annonces:Announcements`, path: '/communication/annonces', module: 'communication' },
        { label: $localize`:@@sidebar.modeles:Templates`, path: '/communication/modeles', module: 'communication' },
      ],
    },
    {
      label: $localize`:@@sidebar.group.reporting:Reporting`,
      items: [
        { label: $localize`:@@sidebar.dashboard:Dashboard`, path: '/reporting', module: 'reporting' },
        { label: $localize`:@@sidebar.report.peda:Pedagogy`, path: '/reporting/pedagogique', module: 'reporting' },
        { label: $localize`:@@sidebar.report.abs:Absenteeism`, path: '/reporting/absenteisme', module: 'reporting' },
        { label: $localize`:@@sidebar.report.fin:Finance`, path: '/reporting/financier', module: 'reporting' },
      ],
    },
  ];

  protected readonly groups = computed<NavGroup[]>(() => {
    // Lecture du signal `roles` via `canAccessModule` pour assurer la
    // réactivité au changement de session.
    return this.allGroups
      .map((group) => ({
        label: group.label,
        items: group.items.filter((item) => this.auth.canAccessModule(item.module)),
      }))
      .filter((group) => group.items.length > 0);
  });
}
