/**
 * POOL DETAIL COMPONENT
 * =====================
 * Main page component for viewing detailed information about a single pool.
 * Displays water quality measurements, charts, AI advice, news, and system controls.
 *
 * Layout Structure (3-column grid):
 * ┌─────────────────────────────────────────────────────────────┐
 * │                     HEADER (app-header)                      │
 * ├──────────────────┬──────────────┬───────────────────────────┤
 * │                  │              │                           │
 * │  Water Quality   │   System     │  News                     │
 * │  Measurements    │   Control    │  (Industry updates)       │
 * │  & Chart         │   Panel      │                           │
 * │  (2 columns)     │  (1 column)  │  AI Consultant            │
 * │                  │              │  (Advice & Actions)       │
 * │                  │              │  (1 column)               │
 * └──────────────────┴──────────────┴───────────────────────────┘
 *
 * Features:
 * - Dynamic pool data loading from route parameter
 * - Current water quality metrics display
 * - Historical data visualization (chart)
 * - System device controls
 * - AI-powered recommendations
 * - Industry news feed
 * - Back navigation to dashboard
 *
 * Route: /dashboard/:id
 * Example: /dashboard/pool-123
 */

import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Footer } from '../../../layout/footer/footer';
import { PoolService, Pool } from '../../../services/pool.service';
import { WaterMeasurementService, WaterMeasurement } from '../../../services/water-measurement.service';
import { WaterQualityChartComponent } from '../../../components/water-quality-chart/water-quality-chart.component';
import { AiConsultantComponent } from '../../../components/ai-consultant/ai-consultant.component';
import { NewsComponent } from '../../../components/news/news.component';
import { SystemControlComponent } from '../../../components/system-control/system-control.component';

@Component({
  selector: 'app-pool-detail',
  standalone: true,
  imports: [
    CommonModule,                   // Enables *ngIf, *ngFor directives
    Header,                         // Top navigation bar
    Footer,                         // Bottom footer (currently commented out in template)
    WaterQualityChartComponent,     // Time-series chart for water parameters
    AiConsultantComponent,          // AI advice and action suggestions
    NewsComponent,                  // Industry news feed
    SystemControlComponent          // Device control panel (pumps, valves, etc.)
  ],
  templateUrl: './pool-detail.component.html',
  styleUrl: './pool-detail.component.scss'
})
export class PoolDetailComponent implements OnInit, OnDestroy {
  
  // ==================== COMPONENT STATE ====================
  
  /**
   * ID of the pool being displayed
   * Extracted from route parameter in ngOnInit
   * Example: 'pool-123'
   */
  poolId: string = '';
  
  /**
   * Complete pool object with all details
   * Loaded from PoolService using poolId
   * undefined if pool not found (triggers redirect to dashboard)
   */
  pool: Pool | undefined;
  
  /**
   * Most recent water measurement for this pool
   * Displayed in the "Current Water Quality" section
   * null if no measurements exist for this pool
   * 
   * AUTO-REFRESH: Updated every 5 seconds via updateInterval
   */
  currentMeasurement: WaterMeasurement | null = null;

  /**
   * Interval ID for auto-refresh timer
   * Updates currentMeasurement every 5 seconds to stay in sync with chart
   * Cleared in ngOnDestroy to prevent memory leaks
   */
  private updateInterval: any;

  // ==================== INJECTED SERVICES ====================
  
  /**
   * PoolService: Provides pool data and CRUD operations
   * Used to fetch the specific pool by ID
   */
  private poolService = inject(PoolService);
  
  /**
   * WaterMeasurementService: Provides water quality measurement data
   * Used to fetch measurements for this pool and get latest reading
   */
  private measurementService = inject(WaterMeasurementService);
  
  /**
   * ActivatedRoute: Angular router service to access route parameters
   * Used to extract pool ID from URL (e.g., /dashboard/:id)
   */
  private route = inject(ActivatedRoute);
  
  /**
   * Router: Angular navigation service
   * Used to redirect back to dashboard or handle invalid pool IDs
   */
  private router = inject(Router);

  /**
   * ChangeDetectorRef: Angular service for manual change detection
   * Used to ensure UI updates immediately when currentMeasurement changes
   * Especially important for preventing the "appearing/disappearing" issue
   */
  private cdr = inject(ChangeDetectorRef);

  // ==================== LIFECYCLE HOOKS ====================

  /**
   * Angular lifecycle hook - called when component initializes
   * 
   * IMPORTANT: Don't put heavy logic directly in ngOnInit
   * Instead, subscribe to route params and call helper methods
   *
   * Flow:
   * 1. Subscribe to route.params observable
   * 2. Extract 'id' parameter from URL
   * 3. Store in poolId property
   * 4. Call loadPoolData() to fetch pool and measurement data
   * 5. Set up auto-refresh interval (5 seconds) to sync with chart updates
   *
   * Route Parameter Format:
   * URL: /dashboard/pool-123
   * params['id'] = 'pool-123'
   *
   * Note: Subscription is automatically cleaned up by Angular when component destroys
   */
  ngOnInit() {
    // Subscribe to route parameters
    // This observable emits whenever route params change
    this.route.params.subscribe(params => {
      // Extract pool ID from URL parameter
      this.poolId = params['id'];
      
      // Load the pool data using this ID
      this.loadPoolData();
    });

    // Set up auto-refresh interval to update currentMeasurement every 5 seconds
    // This keeps the "Current Water Quality" section in sync with the chart
    this.updateInterval = setInterval(() => {
      this.refreshCurrentMeasurement();
    }, 5000); // 5000ms = 5 seconds (matches chart update interval)
  }

  // ==================== DATA LOADING ====================

  /**
   * LOAD POOL DATA
   * Fetches pool information and latest water measurement
   * 
   * Flow:
   * 1. Get pool object from PoolService
   * 2. Get all measurements for this pool
   * 3. Extract the latest measurement (last in array)
   * 4. Redirect to dashboard if pool not found
   *
   * Error Handling:
   * - If pool doesn't exist → redirect to dashboard
   * - If no measurements exist → currentMeasurement remains null
   *
   * TODO: Add error handling for service failures
   * TODO: Add loading state while data is being fetched
   * TODO: Replace with Observable stream for reactive updates
   *
   * Current Implementation: Synchronous (assumes data is already in service)
   * Future: Should be async when using HTTP calls:
   *
   * private loadPoolData() {
   *   this.isLoading = true;
   *   forkJoin({
   *     pool: this.poolService.getPoolById(this.poolId),
   *     measurements: this.measurementService.getMeasurementsByPoolId(this.poolId)
   *   }).subscribe({
   *     next: ({ pool, measurements }) => {
   *       this.pool = pool;
   *       this.currentMeasurement = measurements[measurements.length - 1] || null;
   *       this.isLoading = false;
   *     },
   *     error: (error) => {
   *       console.error('Error loading pool data:', error);
   *       this.router.navigate(['/dashboard']);
   *     }
   *   });
   * }
   */
  private loadPoolData() {
    // Get pool by ID from service
    this.pool = this.poolService.getPool(this.poolId);
    
    // Get all measurements for this pool
    const measurements = this.measurementService.getMeasurementsByPoolId(this.poolId);
    
    // Get the most recent measurement (last element in array)
    // Returns null if array is empty
    this.currentMeasurement = measurements[measurements.length - 1] || null;

    // Redirect to dashboard if pool doesn't exist
    if (!this.pool) {
      console.warn(`Pool with ID ${this.poolId} not found. Redirecting to dashboard.`);
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * REFRESH CURRENT MEASUREMENT
   * Updates the currentMeasurement with the latest water quality data
   * Called every 5 seconds by the auto-refresh interval
   * 
   * Flow:
   * 1. Get all measurements for this pool
   * 2. Extract the latest measurement (last in array)
   * 3. Update currentMeasurement property
   * 4. Manually trigger change detection to ensure UI updates
   * 
   * Why manual change detection?
   * - Prevents the "appearing/disappearing" issue
   * - Ensures Angular immediately updates the template
   * - Critical when using OnPush change detection strategy
   * 
   * Note: This method is separate from loadPoolData to avoid
   * unnecessary pool data reloading on every refresh
   */
  private refreshCurrentMeasurement() {
    // Get all measurements for this pool
    const measurements = this.measurementService.getMeasurementsByPoolId(this.poolId);
    
    // Get the most recent measurement (last element in array)
    this.currentMeasurement = measurements[measurements.length - 1] || null;
    
    // Manually trigger change detection to update UI immediately
    // This ensures the "Current Water Quality" section stays visible
    this.cdr.detectChanges();
  }

  // ==================== NAVIGATION ====================

  /**
   * GO BACK
   * Navigates back to the dashboard (pool list page)
   * 
   * Triggered By:
   * - "Back to Dashboard" button click in template
   * 
   * Navigation Path: /dashboard
   *
   * TODO: Consider using Location.back() to preserve browser history
   * import { Location } from '@angular/common';
   * this.location.back(); // Goes to previous page in history
   */
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Angular lifecycle hook - called when component is destroyed
   * 
   * Cleanup responsibilities:
   * 1. Clear the update interval timer to prevent memory leaks
   * 
   * Important: Not cleaning up this resource can cause:
   * - Memory leaks (interval continues running in background)
   * - Unnecessary API/service calls after component destruction
   * - Performance degradation over time
   */
  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
  
  // ==================== FUTURE METHODS ====================
  
  /**
   * TODO: Add method to refresh data periodically
   * startAutoRefresh(intervalMs: number): void
   */
  
  /**
   * TODO: Add method to manually refresh measurements
   * refreshMeasurements(): void
   */
  
  /**
   * TODO: Add method to export pool data
   * exportPoolData(): void
   */
  
  /**
   * TODO: Add method to handle edit pool
   * editPool(): void
   */
  
  /**
   * TODO: Add method to handle delete pool
   * deletePool(): void
   */
}
