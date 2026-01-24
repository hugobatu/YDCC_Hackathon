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
import { ApiService } from '../../../services/api.service';
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
  // ==================== INJECTED SERVICES ====================
  
  /**
   * ApiService: Provides access to backend APIs
   */
  private apiService = inject(ApiService);

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

  ngOnInit() {
    // Subscribe to route parameters
    this.route.params.subscribe(params => {
      this.poolId = params['id'];
      this.loadPoolData();
    });

    // Set up auto-refresh interval: updates every 60 seconds (1 minute)
    this.updateInterval = setInterval(() => {
      this.refreshCurrentMeasurement();
    }, 60000); // 60000ms = 60 seconds (1 minute)
  }

  // ==================== DATA LOADING ====================

  private loadPoolData() {
    // Get pool by ID from service
    this.pool = this.poolService.getPool(this.poolId);
    
    // Redirect to dashboard if pool doesn't exist
    if (!this.pool) {
      console.warn(`Pool with ID ${this.poolId} not found. Redirecting to dashboard.`);
      this.router.navigate(['/dashboard']);
      return;
    }

    // Initial load of measurement data
    this.refreshCurrentMeasurement();
  }

  /**
   * REFRESH CURRENT MEASUREMENT
   * Fetches latest measurement from API, rounds values, updates store and UI
   */
  private refreshCurrentMeasurement() {
    this.apiService.getLatestMeasurement(this.poolId).subscribe({
      next: (data) => {
        if (data) {
          // Round values to 1 decimal place (or 2 for small values)
          const roundedMeasurement: WaterMeasurement = {
            measure_id: data.measure_id,
            pool_id: this.poolId,
            dissolved_oxygen: parseFloat(data.dissolved_oxygen.toFixed(1)),
            ph: parseFloat(data.ph.toFixed(1)),
            amonia: parseFloat(data.amonia.toFixed(2)),
            turbidity: parseFloat(data.turbidity.toFixed(1)),
            temperature: parseFloat(data.temperature.toFixed(1)),
            created_at: data.created_at
          };

          // Update store (this will automatically update the chart)
          this.measurementService.addMeasurement(roundedMeasurement);

          // Update local state for current metrics display
          this.currentMeasurement = roundedMeasurement;
        } else {
          this.currentMeasurement = null;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching latest measurement:', error);
      }
    });
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
