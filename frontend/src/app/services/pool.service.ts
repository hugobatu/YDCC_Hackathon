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

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

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
  region_name: string;
  species_id: string;
  species_name: string;
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
  
  // ==================== PRIVATE PROPERTIES ====================
  
  /**
   * API URL từ environment config
   */
  private apiUrl = environment.apiUrl;
  
  /**
   * HttpClient for making API calls
   */
  private http = inject(HttpClient);
  
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
   * Initial State: Empty array (sẽ được load từ API)
   */
  private poolsSignal = signal<Pool[]>([]);

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

  // ==================== LOAD DATA FROM API ====================

  /**
   * LOAD POOLS FROM API
   * Fetches all pools belonging to the current user from the backend
   *
   * Flow:
   * 1. Call GET /api/pool/my-pools
   * 2. Update poolsSignal with fetched data
   * 3. Handle errors appropriately
   *
   * @returns Observable<Pool[]> - List of pools
   *
   * Usage:
   * this.poolService.loadPools().subscribe({
   *   next: (pools) => console.log('Loaded pools:', pools),
   *   error: (error) => console.error('Error loading pools:', error)
   * });
   */
  loadPools(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pool/my-pools`).pipe(
      tap(pools => {
        try {
          // Safely transform API response to match our Pool interface
          const transformedPools: Pool[] = (pools || []).map(pool => ({
            pool_id: pool.pool_id || '',
            pool_name: pool.pool_name || 'Unknown Pool',
            region_id: pool.region?.region_id || '',
            region_name: pool.region?.region_name || 'Unknown',
            species_id: pool.species?.species_id || '',
            species_name: pool.species?.species_name || 'Unknown',
            owner_id: pool.owner_id || '',
            created_at: pool.created_at || new Date().toISOString()
          }));
          // Update signal with fetched data
          this.poolsSignal.set(transformedPools);
        } catch (error) {
          console.error('Error transforming pool data:', error);
          // Set empty array on transformation error
          this.poolsSignal.set([]);
        }
      }),
      catchError((error: any) => {
        console.error('Error fetching pools:', error);
        // Set empty array on fetch error
        this.poolsSignal.set([]);
        // Re-throw to let component handle it
        return throwError(() => error);
      })
    );
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * ADD POOL
   * Creates a new pool via API call
   *
   * Flow:
   * 1. Call POST /api/pool/ with pool data
   * 2. Backend generates UUID and creates pool
   * 3. Add new pool to local signal state
   * 4. Return observable for component to handle
   *
   * @param poolData - Pool object with pool_name, region_name, and species_id
   * @returns Observable<any> - Created pool response from API
   *
   * Example Usage:
   * this.poolService.addPool({
   *   pool_name: 'Hồ Tôm Số 1',
   *   region_name: 'Miền Nam',
   *   species_id: 'tom'
   * }).subscribe({
   *   next: (newPool) => console.log('Pool created:', newPool),
   *   error: (error) => console.error('Error creating pool:', error)
   * });
   */
  addPool(poolData: { pool_name: string; region_name: string; species_id: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pool/`, poolData).pipe(
      tap(newPool => {
        // Transform API response and add to signal
        const transformedPool: Pool = {
          pool_id: newPool.pool_id,
          pool_name: newPool.pool_name,
          region_id: newPool.region.region_id,
          region_name: newPool.region.region_name,
          species_id: newPool.species.species_id,
          species_name: newPool.species.species_name,
          owner_id: newPool.owner_id,
          created_at: newPool.created_at
        };
        // Add to existing pools
        this.poolsSignal.update(pools => [...pools, transformedPool]);
      })
    );
  }

  /**
   * DELETE POOL
   * Removes a pool via API call
   *
   * Flow:
   * 1. Call DELETE /api/pool/{pool_id}
   * 2. On success, remove from local signal state
   * 3. Return observable for component to handle
   *
   * @param poolId - ID of the pool to delete
   * @returns Observable<any> - Delete response from API
   *
   * Example Usage:
   * this.poolService.deletePool('pool-123').subscribe({
   *   next: () => console.log('Pool deleted successfully'),
   *   error: (error) => console.error('Error deleting pool:', error)
   * });
   */
  deletePool(poolId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/pool/${poolId}`).pipe(
      tap(() => {
        // Remove from local state
        this.poolsSignal.update(pools =>
          pools.filter(p => p.pool_id !== poolId)
        );
      })
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
  
  // ==================== ADDITIONAL API METHODS ====================
  
  /**
   * GET ALL SPECIES
   * Fetches all available aquatic species from the API
   *
   * @returns Observable<any[]> - List of species
   *
   * Example Usage:
   * this.poolService.getAllSpecies().subscribe({
   *   next: (species) => console.log('Species:', species),
   *   error: (error) => console.error('Error loading species:', error)
   * });
   */
  getAllSpecies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pool/species/all`);
  }
}
