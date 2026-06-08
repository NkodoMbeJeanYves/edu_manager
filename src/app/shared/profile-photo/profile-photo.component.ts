import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";

export type ProfilePhotoSize = "sm" | "md" | "lg";

/**
 * Avatar réutilisable avec upload de photo (base64 inline).
 *
 * Composant contrôlé par le parent : il n'a pas d'état métier propre.
 * Il affiche `photo` (ou des initiales / une icône) et émet `photoChange`
 * avec la dataURL au choix d'un fichier valide, ou `null` au retrait.
 */
@Component({
  selector: "app-profile-photo",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./profile-photo.component.html",
  styleUrl: "./profile-photo.component.scss",
})
export class ProfilePhotoComponent {
  /** dataURL ou URL de la photo courante. */
  @Input() photo: string | null = null;
  /** Nom complet, utilisé pour les initiales de repli. */
  @Input() name = "";
  /** Si false, avatar en lecture seule (pas d'upload ni de retrait). */
  @Input() editable = true;
  @Input() size: ProfilePhotoSize = "md";
  @Input() acceptedTypes: string[] = ["image/jpeg", "image/png", "image/webp"];
  @Input() maxSizeBytes = 2_000_000;

  /** Émis avec la dataURL base64, ou null au retrait. */
  @Output() photoChange = new EventEmitter<string | null>();
  /** Émis avec un message i18n en cas de fichier invalide. */
  @Output() error = new EventEmitter<string>();

  @ViewChild("fileInput") private fileInput?: ElementRef<HTMLInputElement>;

  protected readonly changeLabel = $localize`:@@profilePhoto.changeAria:Change profile photo`;

  protected get initials(): string {
    return this.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  protected triggerPicker(): void {
    if (!this.editable) return;
    this.fileInput?.nativeElement.click();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.triggerPicker();
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.acceptedTypes.includes(file.type)) {
      this.error.emit(
        $localize`:@@profilePhoto.errorType:Unsupported file type. Use JPEG, PNG or WebP.`,
      );
      input.value = "";
      return;
    }

    if (file.size > this.maxSizeBytes) {
      const maxMb = Math.round(this.maxSizeBytes / 1_000_000);
      this.error.emit(
        $localize`:@@profilePhoto.errorSize:Image is too large (max ${maxMb} MB).`,
      );
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.photoChange.emit(reader.result as string);
    reader.onerror = () =>
      this.error.emit(
        $localize`:@@profilePhoto.errorRead:Could not read the file.`,
      );
    reader.readAsDataURL(file);

    // Permet de re-sélectionner le même fichier ensuite.
    input.value = "";
  }

  protected remove(): void {
    if (!this.editable) return;
    this.photoChange.emit(null);
  }
}
