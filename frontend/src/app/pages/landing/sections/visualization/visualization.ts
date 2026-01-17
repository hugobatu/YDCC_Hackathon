import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ChartDemoComponent } from '../chart-demo/chart-demo';
import { AiAgent } from '../ai-agent/ai-agent';
// import { isPlatformBrowser } from '@angular/common';
// import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-visualization-section',
  standalone: true,
  imports: [ChartDemoComponent, AiAgent],
  templateUrl: './visualization.html',
  styleUrl: './visualization.scss',
})
export class Visualization {
}