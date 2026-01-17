import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ai-agent',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './ai-agent.html',
  styleUrl: './ai-agent.scss',
})
export class AiAgent implements OnInit {
  isActive = true;

  ngOnInit(): void {
    this.isActive = true;
  }
}