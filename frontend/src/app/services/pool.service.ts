import { Injectable, signal } from '@angular/core';

export interface Pool {
  pool_id: string;
  pool_name: string;
  region_id: string;
  species_id: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PoolService {
  private poolsSignal = signal<Pool[]>([
    {
      pool_id: '1',
      pool_name: 'Main Aquaculture Pool',
      region_id: 'region-1',
      species_id: 'tilapia',
      owner_id: 'user-1',
      created_at: new Date().toISOString()
    },
    {
      pool_id: '2',
      pool_name: 'Breeding Tank',
      region_id: 'region-1',
      species_id: 'shrimp',
      owner_id: 'user-1',
      created_at: new Date().toISOString()
    },
    {
      pool_id: '3',
      pool_name: 'Secondary Pool',
      region_id: 'region-2',
      species_id: 'catfish',
      owner_id: 'user-1',
      created_at: new Date().toISOString()
    },
    {
      pool_id: '3',
      pool_name: 'Secondary Pool',
      region_id: 'region-2',
      species_id: 'catfish',
      owner_id: 'user-1',
      created_at: new Date().toISOString()
    },
    {
      pool_id: '3',
      pool_name: 'Secondary Pool',
      region_id: 'region-2',
      species_id: 'catfish',
      owner_id: 'user-1',
      created_at: new Date().toISOString()
    }
  ]);

  public pools = this.poolsSignal.asReadonly();

  addPool(pool: Pool) {
    this.poolsSignal.update(pools => [...pools, { ...pool, pool_id: Date.now().toString() }]);
  }

  deletePool(poolId: string) {
    this.poolsSignal.update(pools => pools.filter(p => p.pool_id !== poolId));
  }

  updatePool(poolId: string, updates: Partial<Pool>) {
    this.poolsSignal.update(pools =>
      pools.map(p => p.pool_id === poolId ? { ...p, ...updates } : p)
    );
  }

  getPool(poolId: string) {
    return this.poolsSignal().find(p => p.pool_id === poolId);
  }
}
