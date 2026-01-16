import { Component } from '@angular/core';
import { ChartDemoComponent } from '../chart-demo/chart-demo';
import { AiAgent } from '../ai-agent/ai-agent';

@Component({
  selector: 'app-visualization-section',
  standalone: true,
  imports: [ChartDemoComponent, AiAgent],
  templateUrl: './visualization.html',
  styleUrl: './visualization.scss',
})
export class Visualization {}