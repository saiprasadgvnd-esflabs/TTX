import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter,withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routes } from './app/app.routes';
import { NgxEchartsModule } from 'ngx-echarts';
import { importProvidersFrom } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: '<router-outlet></router-outlet>'
})
export class App {
  name = 'CyberDharshinik';
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    importProvidersFrom(
      NgxEchartsModule.forRoot({
        echarts: () => import('echarts')
      })
    )
  ],
}).catch(err => console.error(err));