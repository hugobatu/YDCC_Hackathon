/**
 * POOL SERVICE
 * ============
 * Centralized service for managing pool data throughout the application.
 * Uses Angular Signals for reactive state management.
 *
 * Features:
 * - CRUD operations for pool data (Create, Read, Update, Delete)
 * - Reactive state with Angular Signals
 * - Auto-generated IDs for new pools
 * - Immutable state updates
 *
 * Current Implementation: In-memory mock data
 * TODO: Replace with HTTP calls to backend API
 *
 * Usage:
 * constructor(private poolService: PoolService) {}
 * this.poolService.pools() // Get all pools
 * this.poolService.getPool(id) // Get specific pool
 * this.poolService.addPool(pool) // Create new pool
 */

import { Injectable, signal } from '@angular/core';

/**
 * Interface for Pool data structure
 * Matches the database table: pool
 *
 * Properties:
 * - pool_id: Unique identifier (UUID in database, string here)
 * - pool_name: Human-readable pool name
 * - region_id: Foreign key to region table
 * - species_id: Foreign key to aquatic_species table
 * - owner_id: Foreign key to users table
 * - created_at: Creation timestamp (optional for display)
 * - updated_at: Last update timestamp (optional for display)
 */
export interface Pool {
  pool_id: string;
  pool_name: string;
  region_id: string;
  species_id: string;
  owner_id: string;
  created_at?: string;    // Optional: may not be needed in frontend
  updated_at?: string;    // Optional: may not be needed in frontend
}

/**
 * Service decorator makes this class injectable throughout the application
 * providedIn: 'root' ensures singleton instance (shared across app)
 */
@Injectable({
  providedIn: 'root'
})
export class PoolService {
  
  // ==================== REACTIVE STATE ====================
  
  /**
   * Private Signal holding the array of pools
   * Signal = Angular's reactive primitive for state management
   *
   * Benefits of Signals:
   * - Automatic change detection
   * - Fine-grained reactivity
   * - Better performance than traditional observables
   *
   * Initial State: Mock data with 5 pools (note: duplicate IDs exist - bug)
   * TODO: Remove mock data, initialize as empty array
   * TODO: Load data from API on service initialization
   */
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
    // BUG: Duplicate pool_id '3' - should be unique
    {
      pool_id: '3',
      pool_name: 'Secondary Pool',
      region_id: 'region-2',
      species_id: 'catfish',
      owner_id: 'user-1',
      created_at: new Date().toISOString()
    },
    // BUG: Another duplicate pool_id '3'
    {
      pool_id: '3',
      pool_name: 'Secondary Pool',
      region_id: 'region-2',
      species_id: 'catfish',
      owner_id: 'user-1',
      created_at: new Date().toISOString()
    }
  ]);

  /**
   * Public readonly accessor for pools
   * Returns a readonly signal that components can subscribe to
   *
   * Usage in components:
   * pools = this.poolService.pools();  // Get current value
   * pools = this.poolService.pools;    // Get signal reference for reactive template
   *
   * Note: asReadonly() prevents external modification of the signal
   * Only the service methods below can modify the pool state
   */
  public pools = this.poolsSignal.asReadonly();

  // ==================== CRUD OPERATIONS ====================

  /**
   * ADD POOL
   * Creates a new pool and adds it to the state
   *
   * Flow:
   * 1. Generate new pool_id using current timestamp
   * 2. Spread existing pools + new pool into new array
   * 3. Update signal with new array (immutable update)
   *
   * @param pool - Pool object without pool_id (or with temporary id)
   *
   * Current Implementation: Client-side ID generation
   * TODO: Replace with HTTP POST to backend
   *
   * Example Usage:
   * this.poolService.addPool({
   *   pool_name: 'New Pool',
   *   region_id: 'region-1',
   *   species_id: 'tilapia',
   *   owner_id: 'user-1'
   * });
   *
   * TODO: Proper implementation with API:
   * addPool(pool: Omit<Pool, 'pool_id'>): Observable<Pool> {
   *   return this.http.post<Pool>('/api/pools', pool).pipe(
   *     tap(newPool => {
   *       this.poolsSignal.update(pools => [...pools, newPool]);
   *     })
   *   );
   * }
   */
  addPool(pool: Pool) {
    this.poolsSignal.update(pools => [
      ...pools,
      {
        ...pool,
        pool_id: Date.now().toString()  // Generate ID from timestamp
      }
    ]);
  }

  /**
   * DELETE POOL
   * Removes a pool from the state
   *
   * Flow:
   * 1. Filter out the pool with matching pool_id
   * 2. Update signal with filtered array (immutable update)
   *
   * @param poolId - ID of the pool to delete
   *
   * Current Implementation: In-memory deletion
   * TODO: Add confirmation dialog before deletion
   * TODO: Replace with HTTP DELETE to backend
   *
   * Example Usage:
   * this.poolService.deletePool('pool-123');
   *
   * TODO: Proper implementation with API:
   * deletePool(poolId: string): Observable<void> {
   *   return this.http.delete<void>(`/api/pools/${poolId}`).pipe(
   *     tap(() => {
   *       this.poolsSignal.update(pools =>
   *         pools.filter(p => p.pool_id !== poolId)
   *       );
   *     })
   *   );
   * }
   */
  deletePool(poolId: string) {
    this.poolsSignal.update(pools =>
      pools.filter(p => p.pool_id !== poolId)
    );
  }

  /**
   * UPDATE POOL
   * Updates specific fields of a pool
   *
   * Flow:
   * 1. Map through all pools
   * 2. For matching pool_id, merge with updates
   * 3. For other pools, keep unchanged
   * 4. Update signal with new array (immutable update)
   *
   * @param poolId - ID of the pool to update
   * @param updates - Partial pool object with fields to update
   *
   * Current Implementation: In-memory update
   * TODO: Replace with HTTP PATCH/PUT to backend
   *
   * Example Usage:
   * this.poolService.updatePool('pool-123', {
   *   pool_name: 'Updated Pool Name',
   *   species_id: 'new-species'
   * });
   *
   * TODO: Proper implementation with API:
   * updatePool(poolId: string, updates: Partial<Pool>): Observable<Pool> {
   *   return this.http.patch<Pool>(`/api/pools/${poolId}`, updates).pipe(
   *     tap(updatedPool => {
   *       this.poolsSignal.update(pools =>
   *         pools.map(p => p.pool_id === poolId ? updatedPool : p)
   *       );
   *     })
   *   );
   * }
   */
  updatePool(poolId: string, updates: Partial<Pool>) {
    this.poolsSignal.update(pools =>
      pools.map(p =>
        p.pool_id === poolId
          ? { ...p, ...updates }  // Merge updates with existing pool
          : p                      // Keep other pools unchanged
      )
    );
  }

  /**
   * GET POOL BY ID
   * Retrieves a single pool by its ID
   *
   * @param poolId - ID of the pool to retrieve
   * @returns Pool object if found, undefined if not found
   *
   * Current Implementation: Array.find() on in-memory data
   * TODO: Replace with HTTP GET to backend (optional, may not be needed if using signals)
   *
   * Example Usage:
   * const pool = this.poolService.getPool('pool-123');
   * if (pool) {
   *   console.log(pool.pool_name);
   * }
   *
   * Note: Returns undefined if pool not found.
   * Consider returning Observable<Pool> if using HTTP:
   * getPool(poolId: string): Observable<Pool> {
   *   return this.http.get<Pool>(`/api/pools/${poolId}`);
   * }
   */
  getPool(poolId: string) {
    return this.poolsSignal().find(p => p.pool_id === poolId);
  }
  
  // ==================== FUTURE METHODS ====================
  
  /**
   * TODO: Add method to fetch pools from API
   * loadPools(): Observable<Pool[]>
   */
  
  /**
   * TODO: Add method to filter pools by criteria
   * filterPools(criteria: PoolFilter): Pool[]
   */
  
  /**
   * TODO: Add method to search pools by name
   * searchPools(query: string): Pool[]
   */
  
  /**
   * TODO: Add method to get pools by region
   * getPoolsByRegion(regionId: string): Pool[]
   */
  
  /**
   * TODO: Add method to get pools by species
   * getPoolsBySpecies(speciesId: string): Pool[]
   */
}
