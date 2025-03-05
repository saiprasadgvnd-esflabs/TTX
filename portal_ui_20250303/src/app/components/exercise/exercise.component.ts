import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TTSService } from '../../services/tts.service';
import { TypingAnimationService } from '../../services/typing-animation.service';
import type { ExerciseData, UserResponse, Nist, QuestionOption } from '../../models/exercise.interface';
import { interval, Subscription, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.css']
})
export class ExerciseComponent implements OnInit, OnDestroy {
  exerciseData: ExerciseData | null = null;
  started: boolean = false;
  currentInjectIndex: number = 0;
  currentInject: any = null;
  currentQuestionIndex: number = 0;
  showAnswer: boolean = false;
  showAmountChange: boolean = false;
  currentAmount: number = 0;
  amountChangeType: 'increase' | 'decrease' = 'decrease';
  amountDifference: number = 0;
  Math = Math;
  userResponses: UserResponse = {
    name: '',
    role_id: 0,
    scenario_id: 0,
    responses: []
  };
  nistFrameworks: Nist[] = [];
  isMuted: boolean = false;
  private questionStartTime: number = 0;
  private destroy$ = new Subject<void>();

  // Separate BehaviorSubjects for different text sections
  descriptionText$ = new BehaviorSubject<string>('');
  injectText$ = new BehaviorSubject<string>('');
  questionText$ = new BehaviorSubject<string>('');
  typedOptions: string[] = [];

  // Reading states
  isReadingDescription = false;
  isReadingInject = false;
  isReadingQuestion = false;
  canStartExercise = false;

  private timerSubscription?: Subscription;
  private amountChangeTimeout?: any;
  totalSeconds: number = 0;
  remainingSeconds: string = '00';
  remainingMinutes: number = 0;
  timerPercentage: number = 100;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private ttsService: TTSService,
    private typingService: TypingAnimationService
  ) {}

  ngOnInit() {
    const userSessionId = this.route.snapshot.params['user_session_id'];
    
    // Subscribe to typing service state
    this.typingService.getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        const text = state.currentText;
        if (this.isReadingDescription) {
          this.descriptionText$.next(text);
        } else if (this.isReadingInject) {
          this.injectText$.next(text);
        } else if (this.isReadingQuestion) {
          this.questionText$.next(text);
        }
      });

    // Subscribe to TTS state
    this.ttsService.getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.isError) {
          console.error('TTS Error:', state.errorMessage);
        }
        this.isMuted = state.isMuted;
        console.log("Updated mute state from TTS service:", this.isMuted);
      });

    // Load exercise data
    this.apiService.getExerciseData(userSessionId).subscribe(async data => {
      this.exerciseData = data;
      if (data) {
        this.currentAmount = data.exercise.simulated_amount;
        this.totalSeconds = data.exercise.time * 60;
        this.remainingMinutes = data.exercise.time;
        this.setFirstInjectWithQuestions();
        await this.readDescription();
      }
    });

    // Load NIST frameworks
    this.apiService.getNistFrameworks().subscribe(frameworks => {
      this.nistFrameworks = frameworks;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.amountChangeTimeout) {
      clearTimeout(this.amountChangeTimeout);
    }
    
    this.ttsService.cleanup();
    this.typingService.destroy();
  }

  clearAllText() {
    // Only clear question-related text when moving to a new question
    this.questionText$.next('');
    this.typedOptions = [];
    // Don't clear inject text unless explicitly moving to a new inject
    if (!this.isReadingInject) {
      this.injectText$.next('');
    }
  }

  private resetReadingStates() {
    this.isReadingDescription = false;
    this.isReadingInject = false;
    this.isReadingQuestion = false;
  }

  async readDescription() {
    if (!this.exerciseData) return;
    
    this.clearAllText();
    this.resetReadingStates();
    this.isReadingDescription = true;
    
    try {
      await this.typingService.typeText(this.exerciseData.scenario.description);
      this.canStartExercise = true;
    } finally {
      this.isReadingDescription = false;
    }
  }

  async readInject(inject: any) {
    if (!inject) return;

    this.resetReadingStates();
    this.isReadingInject = true;
    
    const injectText = `${inject.name}. ${inject.description.situation.description}`;
    
    try {
      // Don't clear text before typing
      await this.typingService.typeText(injectText);
      // Keep the text visible after typing
      this.injectText$.next(injectText);
    } finally {
      this.isReadingInject = false;
      // Show the question immediately after inject reading is complete
      this.showQuestion(this.currentInject.scenario_inject_question.questions[this.currentQuestionIndex]);
    }
  }

  showQuestion(question: any) {
    if (!question) return;
    
    // Set the question text directly without animation
    this.questionText$.next(question.question);
    
    // Set all options at once
    this.typedOptions = question.options.map((option: any) => option.option);
    
    // Start the question timer
    this.startQuestionTimer();
  }

  startTimer() {
    if (this.exerciseData) {
      this.timerSubscription = interval(1000).subscribe(() => {
        this.totalSeconds--;
        
        if (this.totalSeconds <= 0) {
          this.finishExercise();
          return;
        }

        this.remainingMinutes = Math.floor(this.totalSeconds / 60);
        this.remainingSeconds = (this.totalSeconds % 60).toString().padStart(2, '0');
        this.timerPercentage = (this.totalSeconds / (this.exerciseData!.exercise.time * 60)) * 100;
      });
    }
  }

  async startExercise() {
    this.started = true;
    this.startTimer();
    if (this.currentInject) {
      await this.readInject(this.currentInject);
      // Note: The question will be shown automatically after inject reading is complete
    }
  }

  setFirstInjectWithQuestions() {
    if (this.exerciseData) {
      const firstInjectWithQuestions = this.exerciseData.scenario_inject.find(
        inject => inject.scenario_inject_question?.questions && inject.scenario_inject_question.questions.length > 0
      );
      if (firstInjectWithQuestions) {
        this.currentInjectIndex = this.exerciseData.scenario_inject.indexOf(firstInjectWithQuestions);
        this.currentInject = firstInjectWithQuestions;
      }
    }
  }

  startQuestionTimer() {
    this.questionStartTime = Date.now();
  }

  getResponseTime(): number {
    return Math.round((Date.now() - this.questionStartTime) / 1000);
  }

  hasSelectedOption(): boolean {
    if (!this.currentInject?.scenario_inject_question?.questions) return false;
    const currentQuestion = this.currentInject.scenario_inject_question.questions[this.currentQuestionIndex];
    return this.userResponses.responses.some(r => r.question_id === currentQuestion.id);
  }

  async submitAnswer() {
    if (!this.currentInject?.scenario_inject_question?.questions) return;
    
    this.showAnswer = true;
    
    const currentQuestion = this.currentInject.scenario_inject_question.questions[this.currentQuestionIndex];
    const responseIndex = this.userResponses.responses.findIndex(
      r => r.question_id === currentQuestion.id
    );

    if (responseIndex !== -1 && this.userResponses.responses[responseIndex].response_time_seconds === 0) {
      this.userResponses.responses[responseIndex].response_time_seconds = this.getResponseTime();
    }

    if (responseIndex !== -1) {
      const userAnswer = this.userResponses.responses[responseIndex].selected_option;
      this.apiService.submitUserSessionAnswer({
        session_id: this.route.snapshot.params['user_session_id'],
        scenario_question_id: currentQuestion.id,
        option: userAnswer,
        is_correct: userAnswer.is_correct,
        answered_in: this.userResponses.responses[responseIndex].response_time_seconds
      }).subscribe();
    }

    if (this.isAnswerCorrect()) {
      this.reduceAmount();
    } else {
      this.increaseAmount();
    }
  }

  isAnswerCorrect(): boolean {
    if (!this.currentInject?.scenario_inject_question?.questions) return false;
    const currentQuestion = this.currentInject.scenario_inject_question.questions[this.currentQuestionIndex];
    const userResponse = this.userResponses.responses.find(r => r.question_id === currentQuestion.id);
    return userResponse?.selected_option.is_correct || false;
  }

  async continueToNext() {
    this.showAnswer = false;
    this.ttsService.stop();
    
    // Only clear question text and options, preserve inject text
    this.questionText$.next('');
    this.typedOptions = [];
    
    if (this.currentInject?.scenario_inject_question?.questions) {
      if (this.currentQuestionIndex < this.currentInject.scenario_inject_question.questions.length - 1) {
        this.currentQuestionIndex++;
        this.showQuestion(this.currentInject.scenario_inject_question.questions[this.currentQuestionIndex]);
      } else {
        await this.nextInject();
      }
    }
  }

  selectOption(questionId: number, option: QuestionOption) {
    if (this.showAnswer) return;
    
    const currentResponseTime = this.getResponseTime();
    const existingResponseIndex = this.userResponses.responses.findIndex(
      r => r.question_id === questionId
    );

    if (existingResponseIndex !== -1) {
      this.userResponses.responses[existingResponseIndex].selected_option = option;
      if (this.userResponses.responses[existingResponseIndex].response_time_seconds === 0) {
        this.userResponses.responses[existingResponseIndex].response_time_seconds = currentResponseTime;
      }
    } else {
      this.userResponses.responses.push({
        question_id: questionId,
        selected_option: option,
        response_time_seconds: currentResponseTime
      });
    }
  }

  isOptionSelected(questionId: number, option: QuestionOption): boolean {
    const response = this.userResponses.responses.find(
      r => r.question_id === questionId
    );
    return response?.selected_option.option === option.option;
  }

  findNextInjectWithQuestions(startIndex: number): number {
    if (!this.exerciseData) return -1;
    
    for (let i = startIndex; i < this.exerciseData.scenario_inject.length; i++) {
      const inject = this.exerciseData.scenario_inject[i];
      if (inject.scenario_inject_question?.questions && inject.scenario_inject_question.questions.length > 0) {
        return i;
      }
    }
    return -1;
  }

  async nextInject() {
    if (this.exerciseData) {
      const nextIndex = this.findNextInjectWithQuestions(this.currentInjectIndex + 1);
      if (nextIndex !== -1) {
        this.currentInjectIndex = nextIndex;
        this.currentInject = this.exerciseData.scenario_inject[nextIndex];
        this.currentQuestionIndex = 0;
        await this.readInject(this.currentInject);
        // Note: The question will be shown automatically after inject reading is complete
      } else {
        this.finishExercise();
      }
    }
  }

  finishExercise() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    if (!this.exerciseData) return;
    
    const sessionId = this.route.snapshot.params['user_session_id'];
    
    this.apiService.setUserSessionComplted(sessionId).subscribe({
      next: () => {
        this.router.navigate(['/results/session', sessionId]);
      },
      error: (error) => {
        console.error('Error completing session:', error);
        this.router.navigate(['/results/session', sessionId]);
      }
    });
  }

  reduceAmount() {
    const reduction = this.currentAmount * 0.1;
    this.amountDifference = -reduction;
    this.currentAmount -= reduction;
    this.showAmountChange = true;
    this.amountChangeType = 'decrease';
    
    // Announce the money saved using Eleven Labs
    const savedAmount = Math.round(reduction).toLocaleString();
    const announcement = `Great job! You saved ${savedAmount} dollars.`;
    this.ttsService.speak(announcement);
    
    if (this.amountChangeTimeout) {
      clearTimeout(this.amountChangeTimeout);
    }
    
    this.amountChangeTimeout = setTimeout(() => {
      this.showAmountChange = false;
    }, 2000);
  }

  increaseAmount() {
    const increase = this.currentAmount * 0.2;
    this.amountDifference = increase;
    this.currentAmount += increase;
    this.showAmountChange = true;
    this.amountChangeType = 'increase';
    
    // Announce the money lost using Eleven Labs
    const lostAmount = Math.round(increase).toLocaleString();
    const announcement = `Unfortunately, you lost ${lostAmount} dollars.`;
    this.ttsService.speak(announcement);
    
    if (this.amountChangeTimeout) {
      clearTimeout(this.amountChangeTimeout);
    }
    
    this.amountChangeTimeout = setTimeout(() => {
      this.showAmountChange = false;
    }, 2000);
  }

  getCurrentQuestionNistFrameworks(): Nist[] {
    if (!this.currentInject?.scenario_inject_question?.questions) return [];
    const currentQuestion = this.currentInject.scenario_inject_question.questions[this.currentQuestionIndex];
    return this.nistFrameworks
      .filter(nist => currentQuestion.nist_framework_id.includes(nist.id))
      .sort((a, b) => a.seq_no - b.seq_no);
  }

  toggleMute() {
    console.log("Toggle mute button clicked, current state:", this.isMuted);
    this.ttsService.toggleMute();
    // The isMuted state will be updated via the subscription to ttsService.getState()
  }
}