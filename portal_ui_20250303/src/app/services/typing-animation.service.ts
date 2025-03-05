import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { TTSService } from './tts.service';

interface TypingState {
  isTyping: boolean;
  currentText: string;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class TypingAnimationService {
  private state = new BehaviorSubject<TypingState>({
    isTyping: false,
    currentText: '',
    progress: 0
  });
  private destroySubject = new Subject<void>();
  private typingSpeed = 30; // milliseconds per character
  private sentenceDelay = 500; // milliseconds between sentences
  private punctuationDelay = 200; // milliseconds after punctuation
  private maxQueueSize = 5;
  private textQueue: string[] = [];
  private isProcessing = false;

  constructor(private ttsService: TTSService) {
    // Listen for TTS state changes
    this.ttsService.getState().subscribe(ttsState => {
      if (ttsState.isError) {
        this.handleError(new Error(ttsState.errorMessage || 'TTS Error'));
      }
    });
  }

  getState(): Observable<TypingState> {
    return this.state.asObservable();
  }

  private updateState(newState: Partial<TypingState>) {
    this.state.next({
      ...this.state.getValue(),
      ...newState
    });
  }

  async typeText(text: string): Promise<void> {
    if (!text?.trim() || this.textQueue.length >= this.maxQueueSize) {
      return;
    }

    this.textQueue.push(text);
    
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.textQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.textQueue.length > 0) {
        const text = this.textQueue.shift();
        if (text) {
          await this.processText(text);
        }
      }
    } catch (error) {
      this.handleError(error as Error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processText(text: string): Promise<void> {
    const sentences = this.splitIntoSentences(text);
    let currentText = '';
    
    this.updateState({
      isTyping: true,
      currentText: '',
      progress: 0
    });

    for (const sentence of sentences) {
      try {
        // Start TTS for this sentence
        this.ttsService.speak(sentence);

        // Type out the sentence
        for (let i = 0; i < sentence.length; i++) {
          if (this.state.getValue().isTyping === false) {
            return;
          }

          currentText += sentence[i];
          this.updateState({
            currentText,
            progress: (currentText.length / text.length) * 100
          });

          // Add appropriate delays
          const delay = this.getCharacterDelay(sentence[i], sentence[i + 1]);
          await this.delay(delay);
        }

        // Add delay between sentences
        if (sentences.indexOf(sentence) < sentences.length - 1) {
          await this.delay(this.sentenceDelay);
        }
      } catch (error) {
        this.handleError(error as Error);
      }
    }

    this.updateState({
      isTyping: false,
      progress: 100
    });
  }

  private splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [text];
  }

  private getCharacterDelay(char: string, nextChar: string): number {
    if (['.', '!', '?'].includes(char)) {
      return this.sentenceDelay;
    }
    if ([',', ';', ':'].includes(char)) {
      return this.punctuationDelay;
    }
    if (char === ' ' && nextChar && /[A-Z]/.test(nextChar)) {
      return this.punctuationDelay;
    }
    return this.typingSpeed;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: Error): void {
    console.error('Typing Animation Error:', error);
    this.clear();
    throw error;
  }

  clear(): void {
    this.textQueue = [];
    this.isProcessing = false;
    this.ttsService.stop();
    this.updateState({
      isTyping: false,
      currentText: '',
      progress: 0
    });
  }

  setTypingSpeed(speed: number): void {
    this.typingSpeed = speed;
  }

  setSentenceDelay(delay: number): void {
    this.sentenceDelay = delay;
  }

  setPunctuationDelay(delay: number): void {
    this.punctuationDelay = delay;
  }

  destroy(): void {
    this.clear();
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}