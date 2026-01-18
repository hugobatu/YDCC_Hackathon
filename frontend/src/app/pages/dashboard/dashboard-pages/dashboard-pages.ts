import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from "../../../layout/header/header";
import { Footer } from '../../../layout/footer/footer';
import { PoolCardComponent } from '../../../components/pool-card/pool-card.component';
import { AddPoolModalComponent } from '../../../components/add-pool-modal/add-pool-modal.component';
import { PoolService, Pool } from '../../../services/pool.service';

@Component({
  selector: 'app-dashboard-pages',
  imports: [CommonModule, Header, PoolCardComponent, AddPoolModalComponent],
  templateUrl: './dashboard-pages.html',
  styleUrl: './dashboard-pages.scss',
})
export class DashboardPages {
  @ViewChild(AddPoolModalComponent) addPoolModal!: AddPoolModalComponent;
  
  poolService = inject(PoolService);
  private router = inject(Router);

  onAddPool() {
    this.addPoolModal.open();
  }

  onPoolAdded(poolData: any) {
    console.log('New pool created:', poolData);
    // TODO: Refresh pool list after successful creation
    // this.poolService.getAllPools().subscribe(...);
  }

  onEditPool(pool: Pool) {
    console.log('Edit pool:', pool);
    // TODO: Open edit modal or navigate to edit form
    alert(`Edit pool: ${pool.pool_name}`);
  }

  onDeletePool(poolId: string) {
    this.poolService.deletePool(poolId);
  }

  onViewPoolDetails(pool: Pool) {
    this.router.navigate(['/dashboard', pool.pool_id]);
  }
}
