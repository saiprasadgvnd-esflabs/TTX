export interface ScenarioQuestion {
    id?: number;
    scenario_id: number;
    role_id: number;
    exercise_id: number;
    scenario_inject_id: number;
    question: string;
    options: any; // JSON field for storing multiple options
    question_type_id: number;
  }
  