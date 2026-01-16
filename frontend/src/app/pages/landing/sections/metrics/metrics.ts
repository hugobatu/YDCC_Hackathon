import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Metric {
  key: string;
  label: string;
  unit: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-metrics-section',
  standalone: true,
  imports: [ MatIconModule],
  templateUrl: './metrics.html',
  styleUrl: './metrics.scss',
})
export class MetricsSection {
  metrics: Metric[] = [
    {
      key: 'temperature',
      label: 'Water Temperature',
      unit: '°C',
      icon: 'thermostat',
      description: 'Tracks optimal temperature levels for aquatic species.',
    },
    {
      key: 'dissolved_oxygen',
      label: 'Dissolved Oxygen',
      unit: 'mg/L',
      icon: 'air',
      description: 'Ensures sufficient oxygen levels for aquatic life.',
    },
    {
      key: 'amonia',
      label: 'Ammonia',
      unit: 'mg/L',
      icon: 'science',
      description: 'Detects toxic ammonia concentration in water.',
    },
    {
      key: 'ph',
      label: 'pH Level',
      unit: '',
      icon: 'water_drop',
      description: 'Monitors water acidity and alkalinity balance.',
    },
  ];
}
