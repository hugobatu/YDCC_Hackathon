/**
 * SYSTEM CONTROL COMPONENT
 * =========================
 * Provides UI controls for managing pool hardware devices (simulation).
 * Allows users to turn on/off various pool equipment like pumps, valves, aerators, etc.
 *
 * Features:
 * - Toggle switches for each device
 * - Real-time status indicators (ON/OFF)
 * - Visual feedback with color-coding
 * - Immediate UI updates using ChangeDetectorRef
 *
 * Location: Middle column of pool detail page (between chart and consultant)
 *
 * Current Implementation: Simulation only
 * TODO: Connect to actual IoT/hardware control API
 *
 * Usage:
 * <app-system-control></app-system-control>
 */

import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interface for control device data structure
 * Represents a hardware device that can be controlled
 */
export interface ControlDevice {
  id: string;           // Unique identifier (e.g., 'water_pump')
  name: string;         // Display name (e.g., 'Water Pump')
  icon: string;         // Emoji icon for visual representation
  isActive: boolean;    // Current state: true = ON, false = OFF
  description: string;  // Brief description of device function
}

@Component({
  selector: 'app-system-control',
  standalone: true,
  imports: [CommonModule],  // Required for *ngFor and *ngIf directives
  templateUrl: './system-control.component.html',
  styleUrl: './system-control.component.scss'
})
export class SystemControlComponent {
  
  // ==================== SERVICES ====================
  /**
   * ChangeDetectorRef is injected to manually trigger UI updates
   * This ensures Angular detects changes after device state modifications
   * Important for synchronous state changes that Angular might miss
   */
  private cdr = inject(ChangeDetectorRef);
  
  // ==================== COMPONENT STATE ====================
  /**
   * Array of all controllable devices in the pool system
   * Each device has:
   * - Unique ID for API calls
   * - Display name and icon for UI
   * - Active state (on/off)
   * - Description for user reference
   *
   * Initial States:
   * - Aerator: ON (needs to run continuously)
   * - Auto Feeder: ON (scheduled feeding)
   * - Filter System: ON (water filtration)
   * - Water Pump: OFF (manual operation)
   * - Inlet Valve: OFF (manual operation)
   * - Outlet Valve: OFF (manual operation)
   *
   * TODO: Load initial states from backend API
   * TODO: Sync states with actual hardware status
   */
  devices: ControlDevice[] = [
    {
      id: 'water_pump',
      name: 'Máy Bơm Nước',
      icon: '💧',
      isActive: false,
      description: 'Bơm nước vào/ra'
    },
    {
      id: 'aerator',
      name: 'Máy Sục Khí',
      icon: '💨',
      isActive: true,  // Started by default (oxygen circulation is critical)
      description: 'Tuần hoàn oxy'
    },
    {
      id: 'inlet_valve',
      name: 'Van Cấp Nước',
      icon: '🚰',
      isActive: false,
      description: 'Kiểm soát cấp nước'
    },
    {
      id: 'outlet_valve',
      name: 'Van Xả Nước',
      icon: '🔓',
      isActive: false,
      description: 'Kiểm soát xả nước'
    },
    {
      id: 'auto_feeder',
      name: 'Máy Cho Ăn Tự Động',
      icon: '🍽️',
      isActive: true,  // Started by default (scheduled feeding)
      description: 'Cho ăn tự động'
    },
    {
      id: 'filter_system',
      name: 'Hệ Thống Lọc',
      icon: '🗑️',
      isActive: true,  // Started by default (water quality maintenance)
      description: 'Lọc nước'
    }
  ];

  // ==================== DEVICE CONTROL METHODS ====================
  
  /**
   * Toggles a device between ON and OFF states
   * 
   * Flow:
   * 1. Toggle the isActive boolean
   * 2. Trigger change detection for UI update
   * 3. Log the action (for debugging)
   * 4. TODO: Send command to hardware API
   *
   * @param device - The device object to toggle
   *
   * Important Notes:
   * - Uses cdr.detectChanges() to ensure immediate UI update
   * - Currently simulation only (no actual hardware control)
   * - Logs to console for debugging
   *
   * TODO: Implement actual hardware control
   * Example:
   * this.deviceService.toggleDevice(device.id, !device.isActive).subscribe({
   *   next: (response) => {
   *     device.isActive = response.isActive;
   *     this.cdr.detectChanges();
   *   },
   *   error: (error) => {
   *     console.error('Failed to toggle device:', error);
   *     // Revert state change
   *     device.isActive = !device.isActive;
   *     // Show error message to user
   *   }
   * });
   */
  toggleDevice(device: ControlDevice) {
    // Toggle the device state
    device.isActive = !device.isActive;
    
    // Manually trigger change detection to update UI immediately
    // This prevents the issue where UI doesn't update until user interacts
    this.cdr.detectChanges();
    
    // Log for debugging (can see device state changes in console)
    console.log(`${device.name} is now ${device.isActive ? 'ON' : 'OFF'}`);
    
    // TODO: Add API call to actually control the physical device
    // this.deviceControlService.setDeviceState(device.id, device.isActive)
    //   .subscribe({
    //     next: (response) => {
    //       console.log('Device state updated successfully:', response);
    //       // Optional: Show success toast notification
    //     },
    //     error: (error) => {
    //       console.error('Error controlling device:', error);
    //       // Revert the toggle if API call fails
    //       device.isActive = !device.isActive;
    //       this.cdr.detectChanges();
    //       // Show error message to user
    //     }
    //   });
  }

  // ==================== HELPER METHODS ====================
  
  /**
   * Returns the status text for a device
   * Used in the template to display badge text
   *
   * @param device - The device to check
   * @returns 'ON' if device is active, 'OFF' if inactive
   *
   * Note: This is a simple helper method for template readability
   * Could be replaced with direct property access in template
   */
  getDeviceStatus(device: ControlDevice): string {
    return device.isActive ? 'BẬT' : 'TẮT';
  }
  
  // ==================== FUTURE ENHANCEMENTS ====================
  
  /**
   * TODO: Add method to schedule device operations
   * scheduleDevice(deviceId: string, schedule: DeviceSchedule): Observable<void>
   */
  
  /**
   * TODO: Add method to get device usage history
   * getDeviceHistory(deviceId: string): Observable<DeviceLog[]>
   */
  
  /**
   * TODO: Add method to get device health status
   * getDeviceHealth(deviceId: string): Observable<DeviceHealth>
   */
  
  /**
   * TODO: Add emergency stop functionality
   * emergencyStopAll(): Observable<void>
   */
}
