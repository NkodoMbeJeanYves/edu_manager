import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";

export interface PaginatorChange {
  pageIndex: number; // 0-based
  pageSize: number;
}

@Component({
  selector: "app-paginator",
  standalone: true,
  imports: [MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./paginator.component.html",
  styleUrl: "./paginator.component.scss",
})
export class PaginatorComponent {
  /** Nombre total d'éléments. */
  @Input({ required: true }) length = 0;
  @Input() pageSize = 20;
  /** Index de page 0-based (comme mat-paginator). */
  @Input() pageIndex = 0;
  @Input() appearance: "material" | "compact" = "material";
  @Input() pageSizeOptions: number[] = [10, 20, 50];

  @Output() pageChange = new EventEmitter<PaginatorChange>();

  protected get computedTotalPages(): number {
    return Math.max(1, Math.ceil(this.length / this.pageSize));
  }

  protected get currentPage(): number {
    return this.pageIndex + 1;
  }

  protected get hasPrev(): boolean {
    return this.pageIndex > 0;
  }

  protected get hasNext(): boolean {
    return this.currentPage < this.computedTotalPages;
  }

  protected onMatPage(e: PageEvent): void {
    this.pageChange.emit({ pageIndex: e.pageIndex, pageSize: e.pageSize });
  }

  protected prev(): void {
    if (this.hasPrev) {
      this.pageChange.emit({ pageIndex: this.pageIndex - 1, pageSize: this.pageSize });
    }
  }

  protected next(): void {
    if (this.hasNext) {
      this.pageChange.emit({ pageIndex: this.pageIndex + 1, pageSize: this.pageSize });
    }
  }
}
