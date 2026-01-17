import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss',
  imports: [RouterLink, CommonModule]
})
export class Header {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
