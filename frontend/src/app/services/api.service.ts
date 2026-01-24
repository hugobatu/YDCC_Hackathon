import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * API Service Template
 * 
 * Mẫu service để tích hợp các API khác trong hệ thống
 * Copy template này và customize theo nhu cầu
 */

// Interfaces cho API responses
interface PoolResponse {
  pool_id: string;
  pool_name: string;
  owner_id: string;
  region: {
    region_id: string;
    region_name: string;
  };
  species: {
    species_id: string;
    species_name: string;
  };
  created_at: string;
}

interface CreatePoolRequest {
  pool_name: string;
  region_name: string;
  species_id: string;
}

interface PredictionRequest {
  pool_id: string;
  species?: string;
  history?: any[];
}

interface PredictionResponse {
  species: string;
  current_values: {
    temperature: number;
    dissolved_oxygen: number;
    ph: number;
    turbidity: number;
    ammonia: number;
  };
  prediction_next_30min: {
    temperature: number;
    dissolved_oxygen: number;
    ph: number;
    turbidity: number;
    ammonia: number;
  };
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  details: string[];
  thresholds: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * POOL MANAGEMENT APIs
   */

  // GET /api/pool/my-pools
  getMyPools(): Observable<PoolResponse[]> {
    return this.http.get<PoolResponse[]>(`${this.apiUrl}/pool/my-pools`);
  }

  // POST /api/pool/
  createPool(data: CreatePoolRequest): Observable<PoolResponse> {
    return this.http.post<PoolResponse>(`${this.apiUrl}/pool/`, data);
  }

  // DELETE /api/pool/{pool_id}
  deletePool(poolId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pool/${poolId}`);
  }

  // GET /api/pool/{pool_id}/species
  getPoolSpecies(poolId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pool/${poolId}/species`);
  }

  // GET /api/pool/species/all
  getAllSpecies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pool/species/all`);
  }

  /**
   * PREDICTION & ANALYSIS APIs
   */

  // POST /api/predict
  predict(data: PredictionRequest): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict`, data);
  }

  // POST /api/analyze-with-llm
  analyzeWithLLM(poolId: string, species: string = 'tom', includeRawPrompt: boolean = false): Observable<any> {
    const body = {
      pool_id: poolId,
      species: species,
      include_raw_prompt: includeRawPrompt
    };
    return this.http.post(`${this.apiUrl}/analyze-with-llm`, body);
  }
}

/**
 * USAGE EXAMPLES trong Component:
 * 
 * 1. Inject service:
 *    private apiService = inject(ApiService);
 * 
 * 2. Lấy danh sách hồ:
 *    this.apiService.getMyPools().subscribe({
 *      next: (pools) => console.log(pools),
 *      error: (error) => console.error(error)
 *    });
 * 
 * 3. Tạo hồ mới:
 *    this.apiService.createPool({
 *      pool_name: 'Hồ Tôm Số 1',
 *      region_name: 'Miền Nam',
 *      species_id: 'tom'
 *    }).subscribe({
 *      next: (pool) => console.log('Created:', pool),
 *      error: (error) => console.error(error)
 *    });
 * 
 * 4. Dự báo chất lượng nước:
 *    this.apiService.predict({
 *      pool_id: 'pool-uuid-here',
 *      species: 'tom'
 *    }).subscribe({
 *      next: (prediction) => console.log(prediction),
 *      error: (error) => console.error(error)
 *    });
 * 
 * 5. Phân tích AI:
 *    this.apiService.analyzeWithLLM('pool-uuid-here', 'tom').subscribe({
 *      next: (analysis) => console.log(analysis),
 *      error: (error) => console.error(error)
 *    });
 */