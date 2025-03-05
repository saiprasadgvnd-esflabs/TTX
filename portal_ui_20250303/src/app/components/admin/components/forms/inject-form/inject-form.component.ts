import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Scenario {
  id: number;
  name: string;
  client_id: number;
  execrise_id: number;
  description: string;
}

interface ScenarioInject {
  scenario_id: string;
  name: string;
  data: {
    situation: {
      description: string;
      type: string;
    };
    impact: {
      description: string;
      type: string;
    };
    action_required: {
      description: string;
      type: string;
    };
  };
}

@Component({
  selector: 'app-inject-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-content">
      <div class="form-group">
        <label for="injectScenario">Scenario</label>
        <select id="injectScenario" [(ngModel)]="inject.scenario_id" name="injectScenario">
          <option value="">Select a scenario</option>
          <option *ngFor="let scenario of scenarios" [value]="scenario.id">
            {{ scenario.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="injectName">Inject Name</label>
        <input
          type="text"
          id="injectName"
          [(ngModel)]="inject.name"
          name="injectName"
          placeholder="Enter inject name"
        />
      </div>
      <div class="form-group">
        <label for="situationDescription">Situation Description</label>
        <textarea
          id="situationDescription"
          [(ngModel)]="inject.data.situation.description"
          name="situationDescription"
          placeholder="Enter situation description"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="impactDescription">Impact Description</label>
        <textarea
          id="impactDescription"
          [(ngModel)]="inject.data.impact.description"
          name="impactDescription"
          placeholder="Enter impact description"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="actionDescription">Action Required Description</label>
        <textarea
          id="actionDescription"
          [(ngModel)]="inject.data.action_required.description"
          name="actionDescription"
          placeholder="Enter action required description"
        ></textarea>
      </div>
    </div>
  `
})
export class InjectFormComponent {
  @Input() inject: ScenarioInject = {
    scenario_id: '',
    name: '',
    data: {
      situation: {
        description: '',
        type: 'external'
      },
      impact: {
        description: '',
        type: 'external'
      },
      action_required: {
        description: '',
        type: 'external'
      }
    }
  };
  @Input() scenarios: Scenario[] = [];
  @Output() injectChange = new EventEmitter<ScenarioInject>();

  ngOnChanges(): void {
    this.injectChange.emit(this.inject);
  }
}