import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pool } from '../../services/pool.service';

@Component({
  selector: 'app-pool-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pool-card.component.html',
  styleUrl: './pool-card.component.scss'
})
export class PoolCardComponent {
  @Input() pool!: Pool;
  @Output() edit = new EventEmitter<Pool>();
  @Output() delete = new EventEmitter<string>();
  @Output() viewDetails = new EventEmitter<Pool>();

  onEdit() {
    this.edit.emit(this.pool);
  }

  onDelete() {
    if (confirm(`Are you sure you want to delete "${this.pool.pool_name}"?`)) {
      this.delete.emit(this.pool.pool_id);
    }
  }

  onViewDetails() {
    this.viewDetails.emit(this.pool);
  }
}
