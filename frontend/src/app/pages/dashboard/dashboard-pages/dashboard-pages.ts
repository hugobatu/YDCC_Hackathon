/**
 * DASHBOARD PAGES COMPONENT
 * =========================
 * Main dashboard page showing all pools owned by the current user.
 * Displays pools in a grid layout with cards showing basic info and actions.
 *
 * Features:
 * - Grid view of all pools
 * - Add new pool (opens modal)
 * - Edit pool functionality
 * - Delete pool functionality
 * - Navigate to pool detail page
 * - Empty state when no pools exist
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │                    HEADER (app-header)                   │
 * ├─────────────────────────────────────────────────────────┤
 * │  My Pools                            [+ Add New Pool]    │
 * ├─────────────────┬────────────────┬────────────────┬─────┤
 * │  Pool Card 1    │  Pool Card 2   │  Pool Card 3   │ ... │
 * │  [Edit][Delete] │  [Edit][Delete]│  [Edit][Delete]│     │
 * │  [View Details] │  [View Details]│  [View Details]│     │
 * └─────────────────┴────────────────┴────────────────┴─────┘
 *
 * Route: /dashboard
 */

import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from "../../../layout/header/header";
import { Footer } from '../../../layout/footer/footer';
import { PoolCardComponent } from '../../../components/pool-card/pool-card.component';
import { AddPoolModalComponent } from '../../../components/add-pool-modal/add-pool-modal.component';
import { PoolService, Pool } from '../../../services/pool.service';

@Component({
  selector: 'app-dashboard-pages',
  imports: [
    CommonModule,            // Enables *ngIf, *ngFor directives
    Header,                  // Top navigation bar
    PoolCardComponent,       // Individual pool card component
    AddPoolModalComponent    // Modal for creating new pool
  ],
  templateUrl: './dashboard-pages.html',
  styleUrl: './dashboard-pages.scss',
})
export class DashboardPages implements OnInit {
  
  // ==================== VIEW CHILD ====================
  
  /**
   * Reference to the AddPoolModal component
   * Allows programmatic control of modal (open/close)
   * 
   * Usage:
   * this.addPoolModal.open();        // Open the modal
   * this.addPoolModal.closeModal();  // Close the modal
   *
   * Note: ViewChild is populated after the view initializes
   * Don't use in constructor, use in ngAfterViewInit if needed
   */
  @ViewChild(AddPoolModalComponent) addPoolModal!: AddPoolModalComponent;
  
  // ==================== INJECTED SERVICES ====================
  
  /**
   * PoolService: Provides access to pool data and operations
   * Using public to allow direct template access to pools() signal
   * 
   * Template Usage:
   * *ngFor="let pool of poolService.pools()"
   */
  poolService = inject(PoolService);
  
  /**
   * Router: Angular navigation service
   * Used to navigate to pool detail page when user clicks on a pool
   */
  private router = inject(Router);

  // ==================== LIFECYCLE HOOKS ====================

  /**
   * Angular lifecycle hook - called when component is initialized
   * Loads pools from API on component initialization
   */
  ngOnInit() {
    // Load pools from API
    this.poolService.loadPools().subscribe({
      next: (pools) => {
        console.log('Pools loaded successfully:', pools);
      },
      error: (error) => {
        console.error('Error loading pools:', error);
        // TODO: Show error notification to user
      }
    });
  }

  // ==================== POOL OPERATIONS ====================

  /**
   * ON ADD POOL
   * Opens the modal to create a new pool
   * 
   * Triggered By:
   * - "Add New Pool" button click in template
   * 
   * Flow:
   * 1. Call open() method on AddPoolModalComponent
   * 2. Modal becomes visible
   * 3. User fills in form
   * 4. On submit, onPoolAdded() is called
   *
   * Previous Implementation: alert('Open add pool modal')
   * Current: Uses ViewChild reference to control modal
   */
  onAddPool() {
    this.addPoolModal.open();
  }

  /**
   * ON POOL ADDED
   * Handles successful pool creation from the modal
   * 
   * Event Flow:
   * 1. User submits pool creation form in modal
   * 2. Modal emits poolAdded event with new pool data
   * 3. This method receives the data
   * 4. Can refresh pool list or show success message
   *
   * @param poolData - New pool data from the modal
   *
   * Current Implementation: Just logs to console
   * TODO: Implement the following:
   * 1. Show success toast notification
   * 2. Refresh pool list if needed (if not using signals)
   * 3. Navigate to new pool detail page (optional)
   *
   * Example Enhancement:
   * onPoolAdded(poolData: any) {
   *   console.log('New pool created:', poolData);
   *   this.toastService.success('Pool created successfully!');
   *   // If not using signals, manually refresh:
   *   // this.poolService.getAllPools().subscribe(...);
   *   // Optional: Navigate to new pool
   *   // this.router.navigate(['/dashboard', poolData.pool_id]);
   * }
   */
  onPoolAdded(poolData: any) {
    console.log('New pool created:', poolData);
    // TODO: Refresh pool list after successful creation
    // this.poolService.getAllPools().subscribe(...);
    
    // TODO: Show success notification
    // this.toastService.success('Pool created successfully!');
    
    // TODO: Optional - navigate to new pool detail
    // this.router.navigate(['/dashboard', poolData.pool_id]);
  }

  /**
   * ON EDIT POOL
   * Opens edit modal or navigates to edit page for a pool
   * 
   * Triggered By:
   * - "Edit" button click on pool card
   * - Receives pool object from child component
   *
   * @param pool - The pool to edit
   *
   * Current Implementation: Shows alert (placeholder)
   * TODO: Implement one of the following:
   * 1. Open edit modal (similar to add modal)
   * 2. Navigate to dedicated edit page
   * 3. Enable inline editing in pool card
   *
   * Recommended Implementation:
   * onEditPool(pool: Pool) {
   *   // Option 1: Use modal
   *   this.editPoolModal.open(pool);
   *   
   *   // Option 2: Navigate to edit page
   *   this.router.navigate(['/dashboard', pool.pool_id, 'edit']);
   * }
   */
  onEditPool(pool: Pool) {
    console.log('Edit pool:', pool);
    // TODO: Open edit modal or navigate to edit form
    alert(`Edit pool: ${pool.pool_name}`);
  }

  /**
   * ON DELETE POOL
   * Deletes a pool from the system via API
   * 
   * Triggered By:
   * - "Delete" button click on pool card
   * - Receives pool ID from child component
   *
   * @param poolId - ID of the pool to delete
   *
   * Implementation: 
   * 1. Shows confirmation dialog
   * 2. Calls API to delete pool
   * 3. Updates local state on success
   * 4. Shows error on failure
   */
  onDeletePool(poolId: string) {
    // Show confirmation dialog
    const confirmed = confirm('Bạn có chắc chắn muốn xóa hồ này không? Hành động này không thể hoàn tác.');
    
    if (!confirmed) {
      return; // User cancelled
    }

    // Call API to delete pool
    this.poolService.deletePool(poolId).subscribe({
      next: (response) => {
        console.log('Pool deleted successfully:', response);
        // TODO: Show success notification
        // this.toastService.success('Xóa hồ thành công');
      },
      error: (error) => {
        console.error('Error deleting pool:', error);
        alert('Có lỗi xảy ra khi xóa hồ. Vui lòng thử lại.');
        // TODO: Show error notification
        // this.toastService.error('Không thể xóa hồ');
      }
    });
  }

  /**
   * ON VIEW POOL DETAILS
   * Navigates to the detailed view of a specific pool
   * 
   * Triggered By:
   * - "View Details" button click on pool card
   * - Pool card click (depending on implementation)
   *
   * @param pool - The pool to view in detail
   *
   * Navigation Path: /dashboard/:pool_id
   * Example: /dashboard/pool-123
   *
   * On the detail page, user can see:
   * - Current water quality measurements
   * - Historical data chart
   * - AI recommendations
   * - System controls
   * - Industry news
   */
  onViewPoolDetails(pool: Pool) {
    this.router.navigate(['/dashboard', pool.pool_id]);
  }
  
  // ==================== FUTURE METHODS ====================
  
  /**
   * TODO: Add method to filter pools
   * filterPools(criteria: PoolFilter): void
   */
  
  /**
   * TODO: Add method to search pools
   * searchPools(query: string): void
   */
  
  /**
   * TODO: Add method to sort pools
   * sortPools(sortBy: string, direction: 'asc' | 'desc'): void
   */
  
  /**
   * TODO: Add method to bulk operations
   * bulkDeletePools(poolIds: string[]): void
   */
  
  /**
   * TODO: Add method to export pools data
   * exportPools(): void
   */
}
