import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject, signal } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { Action, ModuleKey } from '@core/models/auth.models';

/**
 * Masque un fragment de template si l'utilisateur ne dispose pas de
 * l'action demandée sur le module donné.
 *
 * Usage :
 *   <button *appCan="'validate'; module: 'notes'">Valider</button>
 *   <section *appCan="'delete'; module: 'inscriptions'">…</section>
 *
 * Réactif aux changements de session (signal `AuthStore.roles`).
 */
@Directive({
  selector: '[appCan]',
  standalone: true,
})
export class CanDirective {
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthorizationService);

  private readonly action = signal<Action | null>(null);
  private readonly module = signal<ModuleKey | null>(null);

  @Input() set appCan(value: Action) {
    this.action.set(value);
  }

  @Input() set appCanModule(value: ModuleKey) {
    this.module.set(value);
  }

  constructor() {
    effect(() => {
      const a = this.action();
      const m = this.module();
      this.vcr.clear();
      if (a && m && this.auth.can(a, m)) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }
}
