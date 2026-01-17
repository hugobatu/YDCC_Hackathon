import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-consultant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-consultant.component.html',
  styleUrl: './ai-consultant.component.scss'
})
export class AiConsultantComponent {
  @Input() poolName: string = 'Your Pool';

  isOpen = false;
  userInput = '';
  messages = signal<Message[]>([
    {
      type: 'ai',
      text: `Hello! I'm your AI Water Quality Assistant. I can help you understand your water measurements and provide recommendations to keep your ${this.poolName} in optimal condition. Ask me anything about water quality!`,
      timestamp: new Date()
    }
  ]);

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      type: 'user',
      text: this.userInput,
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMessage]);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const aiResponse = this.generateAIResponse(this.userInput);
      const aiMessage: Message = {
        type: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, aiMessage]);
    }, 1000);

    this.userInput = '';
  }

  private generateAIResponse(userInput: string): string {
    const input = userInput.toLowerCase();

    if (input.includes('temperature')) {
      return 'Based on your recent measurements, the temperature is within a good range for most aquatic species. Ideal temperature is typically 25-30°C. Keep monitoring for any sudden changes.';
    } else if (input.includes('ph') || input.includes('acidic') || input.includes('alkaline')) {
      return 'Your pH level appears to be stable around 7.2-7.5, which is excellent for most freshwater aquaculture. Maintain regular testing to ensure consistency.';
    } else if (input.includes('oxygen') || input.includes('do')) {
      return 'Dissolved oxygen levels are healthy! Aim to keep DO above 5 mg/L for most species. Consider adding aeration if levels drop below 4 mg/L.';
    } else if (input.includes('ammonia') || input.includes('toxic')) {
      return 'Your ammonia levels are low, which is great! Keep up with regular water changes and monitor for any spikes, especially after feeding.';
    } else if (input.includes('turbidity') || input.includes('clear')) {
      return 'Water clarity looks good. Maintain this by ensuring proper filtration and reducing sediment disturbance. Clean filters regularly.';
    } else if (input.includes('help') || input.includes('recommend')) {
      return 'I can help with:\n• Temperature management\n• pH level optimization\n• Dissolved oxygen maintenance\n• Ammonia control\n• Water clarity\n\nWhat would you like to know more about?';
    } else {
      return 'That\'s a great question! Based on current best practices in aquaculture, I\'d recommend maintaining consistent water quality monitoring and making adjustments gradually. Would you like specific advice on any water quality parameter?';
    }
  }
}
