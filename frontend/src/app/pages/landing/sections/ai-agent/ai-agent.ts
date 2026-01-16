import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ai-agent',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './ai-agent.html',
  styleUrl: './ai-agent.scss',
})
export class AiAgent {
  @Input() active = false;
}