import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-container">
      <nav class="navbar">
        <div class="logo-container">
          <img src="https://esflabs.ai/logo.svg" alt="ESF Labs" class="logo-image">
          <span class="logo-text">Cyber Darshinik</span>
        </div>
        <button class="contact-btn">Contact us</button>
      </nav>
      <div class="content">
        <div class="text-content">
          <h1>Defending the Digital Frontier</h1>
          <p>We assist organizations in conducting advanced cybersecurity tabletop exercises for enhanced digital resilience.</p>
          <button (click)="navigateToLogin()" class="login-btn">Enter Portal</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
      padding: 2rem 4rem;
      position: relative;
      overflow: hidden;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      position: relative;
      z-index: 2;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-image {
      height: 100px;
      width: auto;
    }

    .logo-text {
      font-size: 3rem;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 1px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .contact-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid #ffffff;
      color: #ffffff;
      padding: 0.5rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .contact-btn:hover {
      background: #ffffff;
      color: #2c3e50;
      transform: translateY(-2px);
    }

    .content {
      display: flex;
      align-items: center;
      min-height: calc(100vh - 100px);
      position: relative;
      z-index: 2;
    }

    .text-content {
      max-width: 600px;
      margin-left: 12rem;
      animation: slideIn 1s ease-out;
    }

    h1 {
      font-size: 4.5rem;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    p {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 2rem;
      line-height: 1.6;
      max-width: 500px;
      font-weight: 500;
    }

    .login-btn {
      background: #ffffff;
      color: #2c3e50;
      border: none;
      padding: 1rem 2.5rem;
      font-size: 1.2rem;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .login-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.9);
    }

    .login-btn::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        to right,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      transform: rotate(45deg);
      animation: shine 3s infinite;
    }

    @keyframes shine {
      0% {
        transform: translateX(-100%) rotate(45deg);
      }
      100% {
        transform: translateX(100%) rotate(45deg);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 768px) {
      .welcome-container {
        padding: 1rem;
      }

      h1 {
        font-size: 3rem;
      }

      .text-content {
        margin-left: 0;
      }
    }
  `]
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}