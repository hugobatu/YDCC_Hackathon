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

import { Component, OnInit, inject } from '@angular/core';
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
export class PoolDetailComponent implements OnInit {
  
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
   */
  currentMeasurement: WaterMeasurement | null = null;

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
