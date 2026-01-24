/**
 * WATER MEASUREMENT SERVICE
 * ==========================
 * Manages water quality measurement data for all pools.
 * Stores time-series data of water parameters (pH, temperature, DO, etc.).
 *
 * Features:
 * - Stores historical measurements for trend analysis
 * - Filter measurements by pool ID
 * - Add new measurements
 * - Simulate real-time sensor updates
 * - Reactive state with Angular Signals
 *
 * Current Implementation: In-memory mock data with simulated timestamps
 * TODO: Replace with HTTP calls to backend API
 *
 * Usage:
 * const measurements = this.measurementService.getMeasurementsByPoolId('pool-1');
 * const latest = measurements[measurements.length - 1];
 */

import { Injectable, signal } from '@angular/core';

/**
 * Interface for Water Measurement data structure
 * Matches the database table: water_measurement
 *
 * Properties represent water quality parameters:
 * - measure_id: Unique identifier for this measurement
 * - pool_id: Foreign key to pool table
 * - dissolved_oxygen: DO level in mg/L (critical for fish/shrimp health)
 * - ph: pH level (7.0-8.5 is ideal for most aquaculture)
 * - amonia: Ammonia level in mg/L (should be < 0.5 mg/L)
 * - turbidity: Water clarity in NTU (lower is clearer)
 * - temperature: Water temperature in Celsius
 * - created_at: When this measurement was taken
 *
 * Note: 'amonia' is a typo, should be 'ammonia' (check with backend schema)
 */
export interface WaterMeasurement {
  measure_id: string;
  pool_id: string;
  dissolved_oxygen: number;    // mg/L (milligrams per liter)
  ph: number;                  // pH scale (0-14, typically 6-9 for aquaculture)
  amonia: number;              // mg/L (ammonia - note typo in name)
  turbidity: number;           // NTU (Nephelometric Turbidity Units)
  temperature: number;         // Celsius
  created_at: string;          // ISO 8601 timestamp
}

@Injectable({
  providedIn: 'root'
})
export class WaterMeasurementService {
  
  // ==================== REACTIVE STATE ====================
  
  /**
   * Private Signal holding array of all water measurements
   * Initial State: Empty array (loaded from API)
   */
  private measurementsSignal = signal<WaterMeasurement[]>([]);

  /**
   * Public readonly accessor for all measurements
   */
  public measurements = this.measurementsSignal.asReadonly();

  // ==================== QUERY METHODS ====================

  /**
   * GET MEASUREMENTS BY POOL ID
   */
  getMeasurementsByPoolId(poolId: string) {
    return this.measurements().filter(m => m.pool_id === poolId);
  }

  // ==================== MUTATION METHODS ====================

  /**
   * ADD MEASUREMENT
   * Adds a new water measurement to the state
   */
  addMeasurement(measurement: WaterMeasurement) {
    this.measurementsSignal.update(measurements => [
      ...measurements,
      measurement
    ]);
  }

  /**
   * SET MEASUREMENTS
   * Replaces all measurements (e.g., initial load)
   */
  setMeasurements(measurements: WaterMeasurement[]) {
    this.measurementsSignal.set(measurements);
  }
  
  // ==================== FUTURE METHODS ====================
  
  /**
   * TODO: Add method to get measurements for a date range
   * getMeasurementsByDateRange(poolId: string, start: Date, end: Date): Observable<WaterMeasurement[]>
   */
  
  /**
   * TODO: Add method to get average values over time period
   * getAverageMeasurements(poolId: string, hours: number): Observable<WaterMeasurement>
   */
  
  /**
   * TODO: Add method to detect anomalies
   * detectAnomalies(poolId: string): Observable<Anomaly[]>
   */
  
  /**
   * TODO: Add method to get parameter trends
   * getTrend(poolId: string, parameter: string, hours: number): Observable<Trend>
   */
  
  /**
   * TODO: Add method to export measurements as CSV
   * exportToCsv(poolId: string, start: Date, end: Date): Observable<Blob>
   */
}
