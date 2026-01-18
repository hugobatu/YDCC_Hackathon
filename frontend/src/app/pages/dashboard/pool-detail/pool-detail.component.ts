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
    CommonModule,
    Header,
    Footer,
    WaterQualityChartComponent,
    AiConsultantComponent,
    NewsComponent,
    SystemControlComponent
  ],
  templateUrl: './pool-detail.component.html',
  styleUrl: './pool-detail.component.scss'
})
export class PoolDetailComponent implements OnInit {
  poolId: string = '';
  pool: Pool | undefined;
  currentMeasurement: WaterMeasurement | null = null;

  private poolService = inject(PoolService);
  private measurementService = inject(WaterMeasurementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    // Get pool ID from route params
    this.route.params.subscribe(params => {
      this.poolId = params['id'];
      this.loadPoolData();
    });
  }

  private loadPoolData() {
    this.pool = this.poolService.getPool(this.poolId);
    
    // Get current (latest) measurement
    const measurements = this.measurementService.getMeasurementsByPoolId(this.poolId);
    this.currentMeasurement = measurements[measurements.length - 1] || null;

    if (!this.pool) {
      // Pool not found, redirect to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
