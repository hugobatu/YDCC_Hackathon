import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ControlDevice {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  description: string;
}

@Component({
  selector: 'app-system-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-control.component.html',
  styleUrl: './system-control.component.scss'
})
export class SystemControlComponent {
  private cdr = inject(ChangeDetectorRef);
  
  devices: ControlDevice[] = [
    {
      id: 'water_pump',
      name: 'Water Pump',
      icon: '💧',
      isActive: false,
      description: 'Pump water in/out'
    },
    {
      id: 'aerator',
      name: 'Aerator',
      icon: '🌊',
      isActive: true,
      description: 'Oxygen circulation'
    },
    {
      id: 'inlet_valve',
      name: 'Inlet Valve',
      icon: '🚰',
      isActive: false,
      description: 'Water inlet control'
    },
    {
      id: 'outlet_valve',
      name: 'Outlet Valve',
      icon: '🔓',
      isActive: false,
      description: 'Water outlet control'
    },
    {
      id: 'auto_feeder',
      name: 'Auto Feeder',
      icon: '🍽️',
      isActive: true,
      description: 'Automatic feeding'
    },
    {
      id: 'filter_system',
      name: 'Filter System',
      icon: '🔄',
      isActive: true,
      description: 'Water filtration'
    }
  ];

  toggleDevice(device: ControlDevice) {
    // Simulate toggle action
    device.isActive = !device.isActive;
    this.cdr.detectChanges();
    
    // You can add API call here to actually control the device
    console.log(`${device.name} is now ${device.isActive ? 'ON' : 'OFF'}`);
  }

  getDeviceStatus(device: ControlDevice): string {
    return device.isActive ? 'ON' : 'OFF';
  }
}
