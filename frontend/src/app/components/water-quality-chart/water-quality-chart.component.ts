import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterMeasurementService, WaterMeasurement } from '../../services/water-measurement.service';

declare var Chart: any;

/**
 * Type definition for available water quality metrics
 * These metrics are displayed in the chart tabs for user selection
 */
type MetricType = 'Temperature' | 'pH' | 'Dissolved Oxygen' | 'Ammonia' | 'Turbidity';

/**
 * WaterQualityChartComponent
 * 
 * Displays real-time water quality metrics in an interactive line chart.
 * Features:
 * - Real-time data updates every 5 seconds without page refresh
 * - Sliding window display: shows only the last N data points (default 12)
 * - Smooth animations: prevents chart flickering on updates
 * - Metric switching: users can toggle between different water quality metrics
 * - Automatic cleanup: properly destroys chart and intervals on component destroy
 */
@Component({
  selector: 'app-water-quality-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './water-quality-chart.component.html',
  styleUrl: './water-quality-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaterQualityChartComponent implements OnInit, OnDestroy {
  /** Input: Pool ID used to fetch measurements specific to this pool */
  @Input() poolId!: string;
  
  /**
   * Input: Maximum number of data points to display on chart
   * Default: 12 points
   * Purpose: Maintains chart clarity by preventing overcrowding
   * As new data arrives, oldest data is removed (sliding window effect)
   */
  @Input() maxDataPoints: number = 12;

  private measurementService = inject(WaterMeasurementService);
  
  /** Chart.js instance - holds the rendered chart object */
  private chart: any;
  
  /** Interval ID for real-time update timer */
  private updateInterval: any;
  
  /**
   * Stores the filtered measurements to display on chart
   * Managed as a sliding window: only contains the last 'maxDataPoints' measurements
   * This prevents data accumulation and keeps the chart responsive
   */
  private displayedMeasurements: WaterMeasurement[] = [];

  /** Available metrics for user to select from */
  metrics: MetricType[] = ['Temperature', 'pH', 'Dissolved Oxygen', 'Ammonia', 'Turbidity'];
  
  /** Currently selected metric to display (default: Temperature) */
  selectedMetric: MetricType = 'Temperature';
  
  /** Timestamp of last chart update - displayed to user */
  lastUpdated = new Date();

  /**
   * Angular lifecycle hook: Called after component initialization
   * 
   * Initialization sequence:
   * 1. Load initial measurements into the sliding window
   * 2. Create the Chart.js chart instance
   * 3. Set up interval timer for real-time updates
   */
  ngOnInit() {
    this.initializeDisplayedMeasurements();
    this.loadChart();
    
    // Set up real-time update interval: triggers every 5 seconds
    this.updateInterval = setInterval(() => {
      // 1. Simulate/fetch new measurement data from service
      this.measurementService.simulateRealTimeUpdate(this.poolId);
      
      // 2. Update the sliding window with latest data
      this.updateDisplayedMeasurements();
      
      // 3. Refresh chart with new data
      this.updateChart();
      
      // 4. Update the "Last updated" timestamp
      this.lastUpdated = new Date();
    }, 5000); // 5000 milliseconds = 5 seconds
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
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
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
      case 'Temperature':
        data = measurements.map(m => m.temperature);
        label = 'Temperature (°C)';
        borderColor = '#ef4444';
        backgroundColor = 'rgba(239, 68, 68, 0.1)';
        break;
      case 'pH':
        data = measurements.map(m => m.ph);
        label = 'pH Level';
        borderColor = '#3b82f6';
        backgroundColor = 'rgba(59, 130, 246, 0.1)';
        break;
      case 'Dissolved Oxygen':
        data = measurements.map(m => m.dissolved_oxygen);
        label = 'Dissolved Oxygen (mg/L)';
        borderColor = '#10b981';
        backgroundColor = 'rgba(16, 185, 129, 0.1)';
        break;
      case 'Ammonia':
        data = measurements.map(m => m.amonia);
        label = 'Ammonia (mg/L)';
        borderColor = '#f59e0b';
        backgroundColor = 'rgba(245, 158, 11, 0.1)';
        break;
      case 'Turbidity':
        data = measurements.map(m => m.turbidity);
        label = 'Turbidity (NTU)';
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
