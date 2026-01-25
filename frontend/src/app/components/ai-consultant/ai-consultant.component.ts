/**
 * AI CONSULTANT COMPONENT
 * =======================
 * Provides AI-powered advice and recommendations for pool management.
 * Analyzes water quality data and suggests actionable improvements.
 *
 * Features:
 * - One-click advice generation
 * - Randomized scenario-based recommendations
 * - Actionable suggestions with confirmation buttons
 * - Loading states for better UX
 * - Regenerate option for new advice
 *
 * Location: Right sidebar of pool detail page (below News component)
 *
 * Current Implementation: Mock data with random scenarios
 * TODO: Replace with actual AI/ML model API integration
 *
 * Usage:
 * <app-ai-consultant [poolName]="poolName"></app-ai-consultant>
 */

import { Component, Input, ChangeDetectorRef, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService, PredictionResult, AnalysisResult } from '../../services/ai.service';

@Component({
  selector: 'app-ai-consultant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-consultant.component.html',
  styleUrl: './ai-consultant.component.scss'
})
export class AiConsultantComponent implements OnInit, OnChanges {
  
  @Input() poolName: string = 'Your Pool';
  @Input() poolId: string = '';
  @Input() species: string = 'tom';
  
  private cdr = inject(ChangeDetectorRef);
  private aiService = inject(AiService);

  // State
  advice: string | null = null;
  prediction: PredictionResult | null = null;
  isLoadingPrediction = false;
  isLoadingAnalysis = false;
  
  suggestedActions: { label: string, action: string, performed: boolean, priority?: string }[] = [];
  
  ngOnInit() {
    if (this.poolId) {
      this.getAdvice();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['poolId'] && !changes['poolId'].firstChange && this.poolId) {
      this.getAdvice();
    }
  }

  getAdvice() {
    if (!this.poolId) return;

    // Reset state
    this.isLoadingPrediction = true;
    this.isLoadingAnalysis = true;
    this.advice = null;
    this.prediction = null;
    this.suggestedActions = [];
    this.cdr.markForCheck();

    // Step 1: Get Prediction (Fast)
    this.aiService.predict(this.poolId, this.species).subscribe({
      next: (data) => {
        this.prediction = data;
        this.isLoadingPrediction = false;
        this.cdr.detectChanges();
        
        // Step 2: Get LLM Analysis (Slow)
        this.getAnalysis();
      },
      error: (err) => {
        console.error('Prediction failed', err);
        this.isLoadingPrediction = false;
        // Still try analysis even if prediction UI fails? 
        // Or maybe analysis will fail too if DB is empty.
        // Let's try analysis anyway.
        this.getAnalysis();
        this.cdr.detectChanges();
      }
    });
  }

  private getAnalysis() {
    this.aiService.analyzeWithLlm(this.poolId, this.species).subscribe({
      next: (data) => {
        if (data && data.analysis) {
          this.advice = data.analysis.overall_assessment;
          
          // Map recommendations to actions
          if (Array.isArray(data.analysis.recommendations)) {
            this.suggestedActions = data.analysis.recommendations.map((rec: any) => {
              // Handle string format (from User JSON) or object format (from previous spec)
              const label = typeof rec === 'string' ? rec : rec.action;
              return {
                label: label,
                action: label, // use label as ID
                performed: false,
                priority: (typeof rec === 'object' && rec.priority) ? rec.priority : 'medium'
              };
            });
          }
        }
        this.isLoadingAnalysis = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Analysis failed', err);
        this.advice = "Could not generate AI analysis at this time.";
        this.isLoadingAnalysis = false;
        this.cdr.detectChanges();
      }
    });
  }

  performAction(item: any) {
    if (item.performed) return;
    const originalLabel = item.label;
    item.label = 'Executing...';
    this.cdr.detectChanges();
    
    // Simulate execution
    setTimeout(() => {
      item.performed = true;
      item.label = `${originalLabel} (Done)`;
      this.cdr.detectChanges();
    }, 1000);
  }
}
