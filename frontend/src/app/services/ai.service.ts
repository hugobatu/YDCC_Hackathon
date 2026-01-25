import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionResult {
  species: string;
  current_values: any;
  prediction_next_30min: {
    temperature: number;
    dissolved_oxygen: number;
    ph: number;
    turbidity: number;
    ammonia: number;
  };
  risk_level: string;
  details: string[];
}

export interface AnalysisResult {
  analysis: {
    overall_assessment: string;
    potential_risks: any[]; // Can be string[] or { risk, severity, explanation }[]
    recommendations: any[]; // Can be string[] or { action, priority, reason }[]
    environmental_impact: string;
    priority_actions: string[];
  };
  context: any;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  predict(poolId: string, species: string = 'tom'): Observable<PredictionResult> {
    return this.http.post<PredictionResult>(`${this.apiUrl}/predict`, {
      pool_id: poolId,
      species: species
    });
  }

  analyzeWithLlm(poolId: string, species: string = 'tom'): Observable<AnalysisResult> {
    return this.http.post<AnalysisResult>(`${this.apiUrl}/analyze-with-llm`, {
      pool_id: poolId,
      species: species,
      include_raw_prompt: false
    });
  }
}
