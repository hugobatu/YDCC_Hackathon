import { Injectable, signal } from '@angular/core';

export interface WaterMeasurement {
  measure_id: string;
  pool_id: string;
  dissolved_oxygen: number;
  ph: number;
  amonia: number;
  turbidity: number;
  temperature: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class WaterMeasurementService {
  private measurementsSignal = signal<WaterMeasurement[]>([
    {
      measure_id: '1',
      pool_id: '1',
      dissolved_oxygen: 7.5,
      ph: 7.2,
      amonia: 0.2,
      turbidity: 2.5,
      temperature: 28,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      measure_id: '2',
      pool_id: '1',
      dissolved_oxygen: 7.8,
      ph: 7.3,
      amonia: 0.18,
      turbidity: 2.3,
      temperature: 28.5,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      measure_id: '3',
      pool_id: '1',
      dissolved_oxygen: 8.0,
      ph: 7.4,
      amonia: 0.15,
      turbidity: 2.0,
      temperature: 29,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      measure_id: '4',
      pool_id: '1',
      dissolved_oxygen: 7.9,
      ph: 7.3,
      amonia: 0.17,
      turbidity: 2.1,
      temperature: 28.8,
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      measure_id: '5',
      pool_id: '1',
      dissolved_oxygen: 8.1,
      ph: 7.5,
      amonia: 0.14,
      turbidity: 1.9,
      temperature: 29.2,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      measure_id: '6',
      pool_id: '1',
      dissolved_oxygen: 8.2,
      ph: 7.4,
      amonia: 0.13,
      turbidity: 1.8,
      temperature: 29.5,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      measure_id: '7',
      pool_id: '1',
      dissolved_oxygen: 8.3,
      ph: 7.5,
      amonia: 0.12,
      turbidity: 1.7,
      temperature: 29.8,
      created_at: new Date().toISOString()
    }
  ]);

  public measurements = this.measurementsSignal.asReadonly();

  getMeasurementsByPoolId(poolId: string) {
    return this.measurements().filter(m => m.pool_id === poolId);
  }

  addMeasurement(measurement: WaterMeasurement) {
    this.measurementsSignal.update(measurements => [
      ...measurements,
      { ...measurement, measure_id: Date.now().toString() }
    ]);
  }

  // Simulate real-time data updates
  simulateRealTimeUpdate(poolId: string) {
    const newMeasurement: WaterMeasurement = {
      measure_id: Date.now().toString(),
      pool_id: poolId,
      dissolved_oxygen: 7.5 + Math.random() * 1.5,
      ph: 7.0 + Math.random() * 0.8,
      amonia: 0.1 + Math.random() * 0.2,
      turbidity: 1.5 + Math.random() * 2,
      temperature: 28 + Math.random() * 3,
      created_at: new Date().toISOString()
    };
    this.addMeasurement(newMeasurement);
  }
}
