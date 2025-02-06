import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateScenarioAndQuestions(exerciseType: string, role: string): Promise<{
  scenario: string;
  questions: Question[];
}> {
  const prompt = `Create a detailed cybersecurity incident scenario  for a ${exerciseType} attack and generate 10 multiple choice questions  based on NIST Incident Response phases for it and CERT-IN 2022, and for the Role of a ${role}.
  The response must be in valid JSON format with exactly this structure, no markdown or other formatting:
  {
    "scenario": "detailed scenario description",
    "questions": [
      {
        "id": number,
        "question": "question text",
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": number (0-3),
        "explanation": "why this is the correct answer"
      }
    ]
  }
  Make the scenario realistic and the questions challenging but fair. Ensure the response is valid JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7
    });

    const content = completion.choices[0].message.content || '{}';
    let response;
    
    try {
      // Try to parse the response, removing any potential markdown formatting
      response = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from OpenAI');
    }
    
    if (!response.scenario || !Array.isArray(response.questions)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return {
      scenario: response.scenario,
      questions: response.questions.map((q: any, index: number) => ({
        ...q,
        id: index + 1
      }))
    };
  } catch (error) {
    console.error('Error generating scenario:', error);
    // Fall back to mock data if available
    const mockData = MOCK_SCENARIOS[exerciseType as keyof typeof MOCK_SCENARIOS];
    if (mockData) {
      console.log('Falling back to mock data');
      return mockData;
    }
    throw error;
  }
}

// Mock data for fallback
const MOCK_SCENARIOS = {
  'Ransomware': {
    scenario: `A major manufacturing company has been hit by a sophisticated ransomware attack. At 3:00 AM, the IT team receives alerts about unusual file system activity across multiple servers. Employees arriving for the morning shift report being locked out of their workstations, with their screens displaying a ransom note demanding $5 million in cryptocurrency. Initial investigation reveals that the attackers gained access through a compromised vendor account and have encrypted critical production data, customer information, and backup systems.

The company's operations have come to a complete halt, affecting not only the main manufacturing facility but also the supply chain management system that coordinates with hundreds of vendors and customers. The attackers have threatened to publish stolen sensitive data if the ransom isn't paid within 48 hours.`,
    questions: [
      {
        id: 1,
        question: "What should be the immediate first step after discovering the ransomware attack?",
        options: [
          "Pay the ransom immediately to prevent data leaks",
          "Isolate affected systems and disconnect from network",
          "Format all affected systems to remove the ransomware",
          "Send company-wide email about the situation"
        ],
        correctAnswer: 1,
        explanation: "Isolating affected systems prevents further spread of ransomware and contains the incident. This is crucial before taking any other actions."
      }
    ]
  }
};