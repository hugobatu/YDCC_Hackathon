import { Component, Input, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterMeasurementService, WaterMeasurement } from '../../services/water-measurement.service';

declare var Chart: any;

/**
 * Type definition for available water quality metrics
 * These metrics are displayed in the chart tabs for user selection
 */
type MetricType = 'Nhiệt độ' | 'Độ pH' | 'Oxy hòa tan' | 'Amoniac' | 'Độ đục';

/**
 * WaterQualityChartComponent
 * 
 * Displays real-time water quality metrics in an interactive line chart.
 * Features:
 * - Real-time data updates handled via Angular Signals effects
 * - Sliding window display: shows only the last N data points
 * - Smooth animations: prevents chart flickering on updates
 * - Metric switching: users can toggle between different water quality metrics
 * - Automatic cleanup: properly destroys chart on component destroy
 */
@Component({
  selector: 'app-water-quality-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './water-quality-chart.component.html',
  styleUrl: './water-quality-chart.component.scss'
})
export class WaterQualityChartComponent implements OnInit, OnDestroy {
  /** Input: Pool ID used to fetch measurements specific to this pool */
  @Input() poolId!: string;
  
  /**
   * Input: Maximum number of data points to display on chart
   */
  @Input() maxDataPoints: number = 12;

  private measurementService = inject(WaterMeasurementService);
  
  /** Chart.js instance - holds the rendered chart object */
  private chart: any;
  
  // Removed updateInterval as we now react to signal changes
  
  /**
   * Stores the filtered measurements to display on chart
   */
  private displayedMeasurements: WaterMeasurement[] = [];

  /** Available metrics for user to select from */
  metrics: MetricType[] = ['Nhiệt độ', 'Độ pH', 'Oxy hòa tan', 'Amoniac', 'Độ đục'];
  
  /** Currently selected metric to display (default: Temperature) */
  selectedMetric: MetricType = 'Nhiệt độ';
  
  /** Timestamp of last chart update - displayed to user */
  lastUpdated = new Date();

  constructor() {
    // Reactively update chart when measurements change in the service
    // PoolDetailComponent handles the actual data fetching (every 60s)
    effect(() => {
      // Create a dependency on measurements signal
      const allMeasurements = this.measurementService.measurements();
      
      // Only update if we have poolId (might be undefined initially)
      if (this.poolId) {
        this.updateDisplayedMeasurements();
        this.updateChart();
        this.lastUpdated = new Date();
      }
    });
  }

  /**
   * Angular lifecycle hook: Called after component initialization
   */
  ngOnInit() {
    this.initializeDisplayedMeasurements();
    this.loadChart();
    // Logic for polling is now handled by parent component (PoolDetailComponent)
  }

  /**
   * Initialize the displayedMeasurements array with the sliding window of data
   * 
   * Logic:
   * - Get all measurements for this pool from the service
   * - Extract only the last 'maxDataPoints' entries using Array.slice()
   * - This initial window will be maintained as new data arrives
   * 
   * Why sliding window approach?
   * - Prevents memory issues from unlimited data accumulation
   * - Maintains chart readability by limiting visible data points
   * - Provides smooth "scrolling" effect as new data arrives
   */
  private initializeDisplayedMeasurements() {
    const allMeasurements = this.measurementService.getMeasurementsByPoolId(this.poolId);
    // Keep only the last maxDataPoints entries (e.g., last 12 measurements)
    this.displayedMeasurements = allMeasurements.slice(-this.maxDataPoints);
  }

  /**
   * Update the sliding window of displayed measurements
   * Called on every real-time update (every 5 seconds)
   * 
   * Logic:
   * - Fetch all measurements for this pool
   * - Keep only the last 'maxDataPoints' entries
   * - When new data arrives and array exceeds maxDataPoints, oldest data is automatically dropped
   * 
   * Example: If maxDataPoints = 12 and we have 13 measurements:
   * - slice(-12) returns measurements at indices 1-12 (dropping index 0)
   */
  private updateDisplayedMeasurements() {
    const allMeasurements = this.measurementService.getMeasurementsByPoolId(this.poolId);
    // Sliding window: only keep the most recent 'maxDataPoints' measurements
    this.displayedMeasurements = allMeasurements.slice(-this.maxDataPoints);
  }

  /**
   * Angular lifecycle hook: Called when component is destroyed
   * 
   * Cleanup responsibilities:
   * 1. Clear the update interval timer to prevent memory leaks
   * 2. Destroy Chart.js instance to free up resources
   * 
   * Important: Not cleaning up these resources can cause:
   * - Memory leaks (interval continues running)
   * - Multiple chart instances if component is created/destroyed repeatedly
   */
  ngOnDestroy() {
    // updateInterval is no longer needed/used as we rely on signals
    
    if (this.chart) {
      this.chart.destroy();
    }
  }

  /**
   * User action handler: Called when user clicks on a metric tab
   * 
   * Steps:
   * 1. Update the selected metric
   * 2. Trigger chart update to show data for the new metric
   */
  selectMetric(metric: MetricType) {
    this.selectedMetric = metric;
    this.updateChart();
  }

  /**
   * Create and initialize the Chart.js chart instance
   * 
   * Process:
   * 1. Get DOM reference to canvas element (#waterQualityChart)
   * 2. Prepare chart data based on displayedMeasurements
   * 3. Destroy any existing chart instance (if updating)
   * 4. Create new Chart.js instance with configuration
   * 
   * Chart Configuration:
   * - Type: Line chart for time-series visualization
   * - Responsive: Adapts to container size
   * - Styling: Colors, fonts, grid styling
   * - Options: Legend, scales, interaction settings
   */
  private loadChart() {
    const ctx = document.getElementById('waterQualityChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chartData = this.getChartData(this.displayedMeasurements);

    // Destroy existing chart if present (prevents multiple instances)
    if (this.chart) {
      this.chart.destroy();
    }

    // Create new Chart.js instance
    this.chart = new (window as any).Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12 },
              color: '#2d3748'
            }
          },
          filler: {
            propagate: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#718096',
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              color: '#718096',
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  }

  /**
   * Update chart with new data without full re-render
   * Called on every real-time update to smoothly add new data points
   * 
   * Key optimization: Instead of replacing entire chart data object,
   * we only update the specific arrays (labels and data).
   * This prevents flickering and maintains chart stability.
   * 
   * Process:
   * 1. If chart doesn't exist yet, create it with loadChart()
   * 2. Get new chart data for the current selected metric
   * 3. Update only the labels (x-axis timestamps)
   * 4. Update only the data values (y-axis measurements)
   * 5. Use update('none') mode:
   *    - 'none' means no animation
   *    - Prevents animation delays that cause visual flickering
   *    - Results in stable, smooth real-time updates
   * 
   * Why this approach is better:
   * - Previously: this.chart.data = chartData would cause full re-render
   * - Now: Only array updates = minimal DOM manipulation = no flicker
   */
  private updateChart() {
    if (!this.chart) {
      this.loadChart();
      return;
    }

    const chartData = this.getChartData(this.displayedMeasurements);
    
    // Update only the labels (timestamps on x-axis)
    this.chart.data.labels = chartData.labels;
    
    // Update only the data values for the first dataset
    this.chart.data.datasets[0].data = chartData.datasets[0].data;
    
    // Refresh chart with 'none' mode: instant update without animation
    // This prevents the chart from flickering or showing loading effects
    this.chart.update('none');
  }

  /**
   * Transform measurement data into Chart.js compatible format
   * 
   * Process:
   * 1. Extract and format timestamps from measurements as chart labels
   * 2. Based on selectedMetric, extract corresponding data values
   * 3. Assign metric-specific styling (colors, labels)
   * 4. Return formatted object for Chart.js
   * 
   * Metric mapping:
   * - Temperature: Red color (#ef4444)
   * - pH: Blue color (#3b82f6)
   * - Dissolved Oxygen: Green color (#10b981)
   * - Ammonia: Orange color (#f59e0b)
   * - Turbidity: Purple color (#8b5cf6)
   * 
   * Chart styling includes:
   * - Line color (borderColor)
   * - Fill color with transparency (backgroundColor)
   * - Point styling (radius, colors, borders)
   * - Line tension (0.4 for smooth curves)
   */
  private getChartData(measurements: WaterMeasurement[]) {
    // Convert timestamps to readable time format (HH:MM:SS)
    const labels = measurements.map(m => new Date(m.created_at).toLocaleTimeString());
    
    // Initialize variables for chart data and styling
    let data: number[] = [];
    let label = '';
    let borderColor = '';
    let backgroundColor = '';

    // Select data and styling based on currently selected metric
    switch (this.selectedMetric) {
      case 'Nhiệt độ':
        data = measurements.map(m => m.temperature);
        label = 'Nhiệt độ (°C)';
        borderColor = '#ef4444';
        backgroundColor = 'rgba(239, 68, 68, 0.1)';
        break;
      case 'Độ pH':
        data = measurements.map(m => m.ph);
        label = 'Độ pH';
        borderColor = '#3b82f6';
        backgroundColor = 'rgba(59, 130, 246, 0.1)';
        break;
      case 'Oxy hòa tan':
        data = measurements.map(m => m.dissolved_oxygen);
        label = 'Oxy hòa tan (mg/L)';
        borderColor = '#10b981';
        backgroundColor = 'rgba(16, 185, 129, 0.1)';
        break;
      case 'Amoniac':
        data = measurements.map(m => m.amonia);
        label = 'Amoniac (mg/L)';
        borderColor = '#f59e0b';
        backgroundColor = 'rgba(245, 158, 11, 0.1)';
        break;
      case 'Độ đục':
        data = measurements.map(m => m.turbidity);
        label = 'Độ đục (NTU)';
        borderColor = '#8b5cf6';
        backgroundColor = 'rgba(139, 92, 246, 0.1)';
        break;
    }

    // Return Chart.js compatible data structure
    return {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor,
          backgroundColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4, // Curve smoothness (0.4 = smooth curves)
          pointRadius: 4, // Size of data point circles
          pointBackgroundColor: borderColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6 // Size when hovering over points
        }
      ]
    };
  }
}
