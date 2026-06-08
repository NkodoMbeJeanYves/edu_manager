import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ProfilePhotoComponent } from "./profile-photo.component";

/**
 * Page de démonstration du composant ProfilePhoto.
 * Accessible via la route de dev `/_demo/profile-photo` (non liée au menu).
 */
@Component({
  selector: "app-profile-photo-demo",
  standalone: true,
  imports: [ProfilePhotoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section style="padding: 24px; display: flex; flex-direction: column; gap: 24px; max-width: 640px;">
      <h1>ProfilePhoto — démo</h1>

      <div style="display: flex; gap: 32px; align-items: flex-start;">
        <app-profile-photo
          size="lg"
          name="Alice Johnson"
          [photo]="photo()"
          (photoChange)="photo.set($event)"
          (error)="msg.set($event)" />

        <app-profile-photo size="md" name="Marcus Lee" [photo]="photo()" [editable]="false" />
        <app-profile-photo size="sm" name="Sofia Martinez" [photo]="photo()" [editable]="false" />
      </div>

      @if (msg()) {
        <p style="color: var(--color-danger);">{{ msg() }}</p>
      }

      <p style="color: var(--color-text-muted); font-size: 13px; word-break: break-all;">
        photoChange =
        {{ photo() ? (photo()!.slice(0, 64) + "… (" + photo()!.length + " chars)") : "null" }}
      </p>
    </section>
  `,
})
export class ProfilePhotoDemoComponent {
  protected readonly photo = signal<string | null>(null);
  protected readonly msg = signal<string>("");
}
