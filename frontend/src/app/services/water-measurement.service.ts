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
   * 
   * Initial State: 7 mock measurements for pool_id '1'
   * - Measurements are spaced 1 hour apart (6 hours ago to present)
   * - Values show gradual improvement trend (e.g., decreasing ammonia)
   * - Realistic ranges for each parameter
   *
   * Measurement Timestamps:
   * - 6 hours ago (oldest)
   * - 5 hours ago
   * - 4 hours ago
   * - 3 hours ago
   * - 2 hours ago
   * - 1 hour ago
   * - Now (latest)
   *
   * Parameter Trends (pool_id '1'):
   * - Dissolved Oxygen: 7.5 → 8.3 mg/L (improving, good)
   * - pH: 7.2 → 7.5 (stable, optimal)
   * - Ammonia: 0.2 → 0.12 mg/L (decreasing, good)
   * - Turbidity: 2.5 → 1.7 NTU (improving clarity)
   * - Temperature: 28 → 29.8°C (slight increase)
   *
   * TODO: Replace with empty array, load from API
   */
  private measurementsSignal = signal<WaterMeasurement[]>([
    {
      measure_id: '1',
      pool_id: '1',
      dissolved_oxygen: 7.5,
      ph: 7.2,
      amonia: 0.2,
      turbidity: 2.5,
      temperature: 28,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()  // 6 hours ago
    },
    {
      measure_id: '2',
      pool_id: '1',
      dissolved_oxygen: 7.8,
      ph: 7.3,
      amonia: 0.18,
      turbidity: 2.3,
      temperature: 28.5,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()  // 5 hours ago
    },
    {
      measure_id: '3',
      pool_id: '1',
      dissolved_oxygen: 8.0,
      ph: 7.4,
      amonia: 0.15,
      turbidity: 2.0,
      temperature: 29,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()  // 4 hours ago
    },
    {
      measure_id: '4',
      pool_id: '1',
      dissolved_oxygen: 7.9,
      ph: 7.3,
      amonia: 0.17,
      turbidity: 2.1,
      temperature: 28.8,
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()  // 3 hours ago
    },
    {
      measure_id: '5',
      pool_id: '1',
      dissolved_oxygen: 8.1,
      ph: 7.5,
      amonia: 0.14,
      turbidity: 1.9,
      temperature: 29.2,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()  // 2 hours ago
    },
    {
      measure_id: '6',
      pool_id: '1',
      dissolved_oxygen: 8.2,
      ph: 7.4,
      amonia: 0.13,
      turbidity: 1.8,
      temperature: 29.5,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()  // 1 hour ago
    },
    {
      measure_id: '7',
      pool_id: '1',
      dissolved_oxygen: 8.3,
      ph: 7.5,
      amonia: 0.12,
      turbidity: 1.7,
      temperature: 29.8,
      created_at: new Date().toISOString()  // Current time
    }
  ]);

  /**
   * Public readonly accessor for all measurements
   * Components can subscribe to this for reactive updates
   *
   * Usage:
   * allMeasurements = this.measurementService.measurements();
   */
  public measurements = this.measurementsSignal.asReadonly();

  // ==================== QUERY METHODS ====================

  /**
   * GET MEASUREMENTS BY POOL ID
   * Filters measurements to return only those for a specific pool
   *
   * @param poolId - ID of the pool to get measurements for
   * @returns Array of measurements for that pool, sorted by time
   *
   * Common Usage Pattern:
   * const measurements = this.getMeasurementsByPoolId('pool-1');
   * const latest = measurements[measurements.length - 1];  // Most recent
   * const oldest = measurements[0];                         // Oldest
   *
   * Note: Measurements are ordered by created_at (oldest first)
   *
   * TODO: Consider adding date range filtering:
   * getMeasurementsByPoolId(poolId: string, startDate?: Date, endDate?: Date)
   */
  getMeasurementsByPoolId(poolId: string) {
    return this.measurements().filter(m => m.pool_id === poolId);
  }

  // ==================== MUTATION METHODS ====================

  /**
   * ADD MEASUREMENT
   * Adds a new water measurement to the state
   *
   * Flow:
   * 1. Generate new measure_id from timestamp
   * 2. Add measurement to existing array (immutable update)
   * 3. Update signal
   *
   * @param measurement - Measurement object (without measure_id or with temporary id)
   *
   * Current Implementation: Client-side ID generation
   * TODO: Replace with HTTP POST to backend
   *
   * Expected Usage:
   * this.addMeasurement({
   *   pool_id: 'pool-1',
   *   dissolved_oxygen: 8.0,
   *   ph: 7.3,
   *   amonia: 0.15,
   *   turbidity: 2.0,
   *   temperature: 28.5,
   *   created_at: new Date().toISOString()
   * });
   *
   * TODO: Proper implementation with API:
   * addMeasurement(measurement: Omit<WaterMeasurement, 'measure_id'>): Observable<WaterMeasurement> {
   *   return this.http.post<WaterMeasurement>('/api/measurements', measurement).pipe(
   *     tap(newMeasurement => {
   *       this.measurementsSignal.update(measurements => [...measurements, newMeasurement]);
   *     })
   *   );
   * }
   */
  addMeasurement(measurement: WaterMeasurement) {
    this.measurementsSignal.update(measurements => [
      ...measurements,
      {
        ...measurement,
        measure_id: Date.now().toString()  // Generate ID from timestamp
      }
    ]);
  }

  // ==================== SIMULATION METHODS ====================

  /**
   * SIMULATE REAL-TIME UPDATE
   * Generates and adds a random measurement for testing
   * Useful for demonstrating real-time data updates without actual sensors
   *
   * Flow:
   * 1. Generate random but realistic values for all parameters
   * 2. Create new measurement object
   * 3. Add to state using addMeasurement()
   *
   * @param poolId - ID of the pool to generate measurement for
   *
   * Value Ranges (realistic for aquaculture):
   * - Dissolved Oxygen: 7.5 - 9.0 mg/L
   * - pH: 7.0 - 7.8
   * - Ammonia: 0.1 - 0.3 mg/L
   * - Turbidity: 1.5 - 3.5 NTU
   * - Temperature: 28 - 31°C
   *
   * Usage:
   * // Manually trigger update
   * this.measurementService.simulateRealTimeUpdate('pool-1');
   *
   * // Or set up interval for continuous updates
   * setInterval(() => {
   *   this.measurementService.simulateRealTimeUpdate('pool-1');
   * }, 60000);  // Every 60 seconds
   *
   * TODO: Replace with WebSocket or Server-Sent Events for real sensor data
   */
  simulateRealTimeUpdate(poolId: string) {
    const newMeasurement: WaterMeasurement = {
      measure_id: Date.now().toString(),
      pool_id: poolId,
      dissolved_oxygen: 7.5 + Math.random() * 1.5,    // 7.5 - 9.0 mg/L
      ph: 7.0 + Math.random() * 0.8,                  // 7.0 - 7.8
      amonia: 0.1 + Math.random() * 0.2,              // 0.1 - 0.3 mg/L
      turbidity: 1.5 + Math.random() * 2,             // 1.5 - 3.5 NTU
      temperature: 28 + Math.random() * 3,            // 28 - 31°C
      created_at: new Date().toISOString()
    };
    this.addMeasurement(newMeasurement);
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
