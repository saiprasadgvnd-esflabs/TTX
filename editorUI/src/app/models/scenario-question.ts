export interface Option {
  option: string;
  weightage: number;
}

export interface ScenarioQuestion {
  scenario_id: number;
  role_id: number;
  exercise_id: number;
  scenario_inject_id: number;
  question: string;
  compliance_reference: string;
  options: Option[];
  question_type_id: number;
}