import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterMeasurementService, WaterMeasurement } from '../../services/water-measurement.service';

declare var Chart: any;

type MetricType = 'Temperature' | 'pH' | 'Dissolved Oxygen' | 'Ammonia' | 'Turbidity';

@Component({
  selector: 'app-water-quality-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './water-quality-chart.component.html',
  styleUrl: './water-quality-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaterQualityChartComponent implements OnInit, OnDestroy {
  @Input() poolId!: string;

  private measurementService = inject(WaterMeasurementService);
  private chart: any;
  private updateInterval: any;

  metrics: MetricType[] = ['Temperature', 'pH', 'Dissolved Oxygen', 'Ammonia', 'Turbidity'];
  selectedMetric: MetricType = 'Temperature';
  lastUpdated = new Date();

  ngOnInit() {
    this.loadChart();
    // Simulate real-time updates every 5 seconds
    this.updateInterval = setInterval(() => {
      this.measurementService.simulateRealTimeUpdate(this.poolId);
      this.updateChart();
      this.lastUpdated = new Date();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  selectMetric(metric: MetricType) {
    this.selectedMetric = metric;
    this.updateChart();
  }

  private loadChart() {
    const ctx = document.getElementById('waterQualityChart') as HTMLCanvasElement;
    if (!ctx) return;

    const measurements = this.measurementService.getMeasurementsByPoolId(this.poolId);
    const chartData = this.getChartData(measurements);

    if (this.chart) {
      this.chart.destroy();
    }

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

  private updateChart() {
    if (!this.chart) {
      this.loadChart();
      return;
    }

    const measurements = this.measurementService.getMeasurementsByPoolId(this.poolId);
    const chartData = this.getChartData(measurements);

    this.chart.data = chartData;
    this.chart.update();
  }

  private getChartData(measurements: WaterMeasurement[]) {
    const labels = measurements.map(m => new Date(m.created_at).toLocaleTimeString());
    let data: number[] = [];
    let label = '';
    let borderColor = '';
    let backgroundColor = '';

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
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: borderColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6
        }
      ]
    };
  }
}
