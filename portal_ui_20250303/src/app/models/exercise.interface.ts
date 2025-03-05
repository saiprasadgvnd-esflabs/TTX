export interface ExerciseData {
  exercise: {
    id: number;
    name: string;
    time: number;
    simulated_amount: number;
  };
  scenario: {
    id: number;
    title: string;
    description: string;
  };
  scenario_inject: Array<{
    id: number;
    name: string;
    description: {
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
    scenario_inject_question: {
      id: number;
      role_id: number;
      questions: Array<{
        id: number;
        question: string;
        options: Array<QuestionOption>;
        nist_framework_id: Array<number>;
      }> | null;
    };
  }>;
}

export interface UserResponse {
  name: string;
  role_id: number;
  scenario_id: number;
  responses: Array<{
    question_id: number;
    selected_option: QuestionOption;
    response_time_seconds: number;
  }>;
}

export interface Nist {
  id: number;
  name: string;
  seq_no: number;
}

export interface QuestionOption {
  option: string;
  is_correct: boolean;
}