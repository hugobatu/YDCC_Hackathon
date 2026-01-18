import { Component, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-consultant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-consultant.component.html',
  styleUrl: './ai-consultant.component.scss'
})
export class AiConsultantComponent {
  @Input() poolName: string = 'Your Pool';
  
  private cdr = inject(ChangeDetectorRef);

  advice: string | null = null;
  isLoading = false;
  suggestedActions: { label: string, action: string, performed: boolean }[] = [];

  getAdvice() {
    this.isLoading = true;
    this.advice = null;
    this.suggestedActions = [];
    this.cdr.markForCheck();
    
    // Simulate AI processing delay
    setTimeout(() => {
      this.isLoading = false;
      this.generateAdvice();
      this.cdr.detectChanges();
    }, 500);
  }

  generateAdvice() {
    // Mock advice generation logic based on random factors or "current state"
    const scenarios = [
      {
        text: 'The dissolved oxygen levels are slightly low (4.2 mg/L). This can stress the fish and reduce feeding efficiency. I recommend increasing aeration immediately.',
        actions: [
          { label: 'Turn on Auxiliary Aerator', action: 'aerator_on', performed: false },
          { label: 'Reduce Feeding by 50%', action: 'reduce_feed', performed: false }
        ]
      },
      {
        text: 'Ammonia levels are rising (0.5 mg/L). This might be due to overfeeding or decomposing organic matter. A partial water exchange is recommended.',
        actions: [
          { label: 'Start Water Pump (Exchange 10%)', action: 'pump_on', performed: false },
          { label: 'Stop Auto-Feeder', action: 'feeder_off', performed: false }
        ]
      },
      {
        text: 'Water quality parameters are optimal. Temperature and pH are stable. No immediate actions are required, but routine monitoring should continue.',
        actions: []
      }
    ];

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    this.advice = randomScenario.text;
    this.suggestedActions = randomScenario.actions;
  }

  performAction(item: { label: string, action: string, performed: boolean }) {
    if (item.performed) return;

    // Simulate action execution
    const originalLabel = item.label;
    item.label = 'Executing...';
    this.cdr.detectChanges();
    
    setTimeout(() => {
      item.performed = true;
      item.label = `${originalLabel} (Done)`;
      this.cdr.detectChanges();
    }, 1000);
  }
}
