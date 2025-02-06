import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ScenarioQuestionFormComponent } from './app/components/scenario-question-form/scenario-question-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ScenarioQuestionFormComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black relative overflow-hidden">
      <!-- Animated background elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute w-[500px] h-[500px] -top-48 -left-48 bg-blue-500/20 rounded-full filter blur-[100px] animate-pulse"></div>
        <div class="absolute w-[500px] h-[500px] -bottom-48 -right-48 bg-purple-500/20 rounded-full filter blur-[100px] animate-pulse delay-700"></div>
        <div class="absolute w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500/10 rounded-full filter blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <!-- Grid overlay -->
      <div class="absolute inset-0" style="background-image: linear-gradient(rgba(15, 23, 42, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(15, 23, 42, 0.1) 1px, transparent 1px); background-size: 40px 40px;"></div>

      <!-- Floating particles -->
      <div class="absolute inset-0">
        <div class="absolute h-2 w-2 bg-blue-500/40 rounded-full top-1/4 left-1/4 animate-ping"></div>
        <div class="absolute h-2 w-2 bg-purple-500/40 rounded-full top-3/4 right-1/4 animate-ping delay-300"></div>
        <div class="absolute h-2 w-2 bg-cyan-500/40 rounded-full bottom-1/4 left-1/2 animate-ping delay-700"></div>
      </div>

      <!-- Main content -->
      <div class="relative z-10">
        <header class="py-8 px-6">
          <h1 class="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 animate-gradient bg-300% tracking-tight">
            Scenario Management System
          </h1>
        </header>
        <app-scenario-question-form></app-scenario-question-form>
      </div>

      <!-- Decorative corner elements -->
      <div class="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-blue-500/30 rounded-tl-xl"></div>
      <div class="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-purple-500/30 rounded-tr-xl"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-xl"></div>
      <div class="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-blue-500/30 rounded-br-xl"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    @keyframes gradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .animate-gradient {
      animation: gradient 8s ease infinite;
    }
    .bg-300\% {
      background-size: 300% 300%;
    }
  `]
})
export class App {
  name = 'Angular';
}

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
});