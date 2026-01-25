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
      label: 'Nhiệt độ nước',
      unit: '°C',
      icon: 'thermostat',
      description: 'Theo dõi mức nhiệt độ tối ưu cho các loài thủy sinh.',
    },
    {
      key: 'dissolved_oxygen',
      label: 'Oxy hòa tan',
      unit: 'mg/L',
      icon: 'air',
      description: 'Đảm bảo mức oxy đầy đủ cho đời sống thủy sinh.',
    },
    {
      key: 'amonia',
      label: 'Amoniac',
      unit: 'mg/L',
      icon: 'science',
      description: 'Phát hiện nồng độ amoniac độc hại trong nước.',
    },
    {
      key: 'ph',
      label: 'Độ pH',
      unit: '',
      icon: 'water_drop',
      description: 'Giám sát sự cân bằng axit và kiềm của nước.',
    },
  ];

}
