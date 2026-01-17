import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip
} from 'chart.js';
import { isPlatformBrowser } from '@angular/common';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip
);

@Component({
  selector: 'app-chart-demo',
  standalone: true,
  templateUrl: './chart-demo.html',
  styleUrl: './chart-demo.scss',
})
export class ChartDemoComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      new Chart(this.canvas.nativeElement, {
        type: 'line',
        data: {
          labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'],
          datasets: [
            {
              label: 'Dissolved Oxygen (mg/L)',
              data: [5.2, 5.5, 5.1, 6.0, 6.3, 6.1],
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37,99,235,0.15)',
              tension: 0.4,
              fill: true,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          animation: {
            duration: 1400,
            easing: 'easeOutQuart',
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        },
      });
    }
  }
}
