import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry, takeUntil } from 'rxjs/operators';

interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  isError: boolean;
  errorMessage: string | null;
  queueSize: number;
  downloadProgress: number;
  isMuted: boolean;
}

interface AudioQueueItem {
  buffer: AudioBuffer;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class TTSService {
  private apiKey = 'sk_19601422a3e0b25162b2378079055d610362d907e9e936f7';
  private voiceId = 'kWINXfmSFfYha4ycRYO7';
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private audioContext: AudioContext;
  private currentSource: AudioBufferSourceNode | null = null;
  private destroySubject = new Subject<void>();
  private stateSubject = new BehaviorSubject<TTSState>({
    isPlaying: false,
    isPaused: false,
    isError: false,
    errorMessage: null,
    queueSize: 0,
    downloadProgress: 0,
    isMuted: false
  });
  private retryAttempts = 3;
  private retryDelay = 1000;
  private audioQueue: AudioQueueItem[] = [];
  private downloadQueue: string[] = [];
  private isDownloading = false;
  private isPlaying = false;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  constructor(private http: HttpClient) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.5; // Set initial volume
    this.gainNode.connect(this.audioContext.destination);
  }

  public getState(): Observable<TTSState> {
    return this.stateSubject.asObservable();
  }

  private updateState(newState: Partial<TTSState>) {
    this.stateSubject.next({
      ...this.stateSubject.getValue(),
      ...newState,
      queueSize: this.downloadQueue.length + this.audioQueue.length
    });
  }

  public async speak(text: string): Promise<void> {
    if (!text?.trim()) return;
    
    // If muted, don't process audio but still simulate the typing
    if (this.stateSubject.getValue().isMuted) {
      console.log("Audio is muted, not processing speech");
      return;
    }

    const sentences = this.splitIntoSentences(text.trim());
    sentences.forEach(sentence => this.downloadQueue.push(sentence));
    this.updateState({});

    // Start downloading if not already in progress
    if (!this.isDownloading) {
      this.processDownloadQueue();
    }

    // Start playing if not already playing
    if (!this.isPlaying) {
      this.processAudioQueue();
    }
  }

  private async processDownloadQueue(): Promise<void> {
    if (this.isDownloading || this.downloadQueue.length === 0) return;

    this.isDownloading = true;
    
    while (this.downloadQueue.length > 0) {
      const sentence = this.downloadQueue[0];
      
      try {
        const audioBuffer = await this.fetchAudio(sentence);
        this.audioQueue.push({ buffer: audioBuffer, text: sentence });
        this.downloadQueue.shift();
        this.updateState({
          downloadProgress: ((this.audioQueue.length) / (this.audioQueue.length + this.downloadQueue.length)) * 100
        });

        // Start playing if not already playing
        if (!this.isPlaying) {
          this.processAudioQueue();
        }
      } catch (error) {
        console.error('Error downloading audio:', error);
        this.downloadQueue.shift(); // Remove failed sentence
        this.handleError(error as Error);
      }
    }

    this.isDownloading = false;
    this.updateState({ downloadProgress: 100 });
  }

  private async fetchAudio(text: string): Promise<AudioBuffer> {
    const headers = new HttpHeaders({
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    });

    const body = {
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      }
    };

    let attempts = 0;
    while (attempts < this.retryAttempts) {
      try {
        console.log(`Fetching audio from Eleven Labs for text: "${text}"`);
        const response = await this.http.post(
          `${this.baseUrl}/text-to-speech/${this.voiceId}/stream`,
          body,
          { headers, responseType: 'blob', observe: 'response' }
        ).pipe(
          takeUntil(this.destroySubject)
        ).toPromise();

        if (!response?.body) {
          throw new Error('Empty response body');
        }

        console.log('Successfully received audio from Eleven Labs');
        const arrayBuffer = await response.body.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        attempts++;
        if (attempts === this.retryAttempts) {
          console.error('All attempts failed, falling back to synthetic audio');
          // If all attempts fail, fall back to synthetic audio
          return this.createSyntheticAudioBuffer(text);
        }
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempts));
      }
    }

    throw new Error('Failed to fetch audio after all attempts');
  }

  private async createSyntheticAudioBuffer(sentence: string): Promise<AudioBuffer> {
    // Create a synthetic audio buffer as fallback
    console.log('Creating synthetic audio as fallback');
    const sampleRate = this.audioContext.sampleRate;
    
    // Calculate duration based on sentence length (longer sentences = longer audio)
    const durationInSeconds = Math.max(1, Math.min(5, sentence.length / 20));
    
    const buffer = this.audioContext.createBuffer(
      1, // mono
      sampleRate * durationInSeconds,
      sampleRate
    );
    
    // Get the channel data
    const data = buffer.getChannelData(0);
    
    // Generate a unique frequency based on the first character of the sentence
    // This creates different tones for different sentences
    const baseFrequency = 220 + (sentence.charCodeAt(0) % 20) * 20; // Range from 220Hz to 620Hz
    
    // Create a more complex waveform with harmonics
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // Create a fade in and fade out effect
      const fadeInTime = 0.1;
      const fadeOutTime = 0.3;
      const fadeInFactor = Math.min(1, t / fadeInTime);
      const fadeOutFactor = Math.min(1, (durationInSeconds - t) / fadeOutTime);
      const fadeFactor = fadeInFactor * fadeOutFactor;
      
      // Add some variation based on the sentence content
      const variationFactor = 1 + 0.1 * Math.sin(2 * Math.PI * 0.5 * t);
      
      // Create a more complex tone with harmonics
      const fundamental = Math.sin(2 * Math.PI * baseFrequency * t);
      const harmonic1 = 0.5 * Math.sin(2 * Math.PI * baseFrequency * 2 * t); // First harmonic
      const harmonic2 = 0.25 * Math.sin(2 * Math.PI * baseFrequency * 3 * t); // Second harmonic
      
      // Combine the waveforms with a slight vibrato effect
      const vibrato = Math.sin(2 * Math.PI * 5 * t) * 0.02;
      const combinedWave = (fundamental + harmonic1 + harmonic2) / 1.75;
      
      // Apply all effects
      data[i] = combinedWave * fadeFactor * variationFactor * (1 + vibrato);
    }
    
    return buffer;
  }

  private async processAudioQueue(): Promise<void> {
    if (this.isPlaying || this.audioQueue.length === 0) return;

    this.isPlaying = true;
    this.updateState({ isPlaying: true });

    while (this.audioQueue.length > 0 && !this.stateSubject.getValue().isPaused) {
      const item = this.audioQueue[0];
      
      try {
        await this.playAudioBuffer(item.buffer);
        this.audioQueue.shift();
        this.updateState({});
      } catch (error) {
        console.error('Error playing audio:', error);
        this.audioQueue.shift();
        this.handleError(error as Error);
      }
    }

    this.isPlaying = false;
    this.updateState({ isPlaying: false });
  }

  private async playAudioBuffer(buffer: AudioBuffer): Promise<void> {
    // If muted, resolve immediately without playing
    if (this.stateSubject.getValue().isMuted) {
      console.log("Audio is muted, skipping playback");
      return Promise.resolve();
    }

    await this.audioContext.resume();

    return new Promise((resolve, reject) => {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.gainNode!);
        this.currentSource = source;

        source.onended = () => {
          this.currentSource = null;
          resolve();
        };

        source.start();
      } catch (error) {
        this.currentSource = null;
        reject(error);
      }
    });
  }

  public pause(): void {
    this.updateState({ isPaused: true });
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
  }

  public resume(): void {
    this.updateState({ isPaused: false });
    if (!this.isPlaying) {
      this.processAudioQueue();
    }
  }

  public stop(): void {
    this.destroySubject.next();
    
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
      this.currentSource = null;
    }
    
    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch (error) {
        console.error('Error stopping oscillator:', error);
      }
      this.oscillator = null;
    }

    this.audioQueue = [];
    this.downloadQueue = [];
    this.isDownloading = false;
    this.isPlaying = false;
    
    this.updateState({
      isPlaying: false,
      isPaused: false,
      isError: false,
      errorMessage: null,
      downloadProgress: 0
    });
  }

  public toggleMute(): void {
    const currentState = this.stateSubject.getValue();
    const newMuteState = !currentState.isMuted;
    
    console.log(`Toggling mute state from ${currentState.isMuted} to ${newMuteState}`);
    
    this.updateState({ isMuted: newMuteState });
    
    // If currently playing and we're muting, stop the current playback
    if (newMuteState && this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    
    // If unmuting and we have items in the queue, start playing
    if (!newMuteState && !this.isPlaying && this.audioQueue.length > 0) {
      this.processAudioQueue();
    }
    
    // Play a short beep to confirm mute/unmute
    this.playBeep(newMuteState);
  }
  
  private playBeep(isMuted: boolean): void {
    // Don't play beep if we're muting
    if (isMuted) return;
    
    // Stop any existing oscillator
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
    
    try {
      // Create and configure oscillator
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.value = 880; // A5 note
      
      // Connect to gain node
      this.oscillator.connect(this.gainNode!);
      
      // Start and stop after a short duration
      this.oscillator.start();
      setTimeout(() => {
        if (this.oscillator) {
          this.oscillator.stop();
          this.oscillator = null;
        }
      }, 200);
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  }

  public isMuted(): boolean {
    return this.stateSubject.getValue().isMuted;
  }

  private splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [text];
  }

  private handleError(error: Error): Observable<never> {
    let errorMessage = 'An error occurred with text-to-speech';
    
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid API key. Please check your Eleven Labs credentials.';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = `Server error: ${error.message}`;
      }
    }

    this.updateState({
      isError: true,
      errorMessage
    });

    return throwError(() => new Error(errorMessage));
  }

  public cleanup(): void {
    this.stop();
    this.destroySubject.complete();
    
    // Clean up audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(err => {
        console.error('Error closing audio context:', err);
      });
    }
  }

  public setVoice(voiceId: string): void {
    this.voiceId = voiceId;
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  public getAvailableVoices(): Observable<any> {
    const headers = new HttpHeaders({
      'xi-api-key': this.apiKey
    });
    
    return this.http.get(`${this.baseUrl}/voices`, { headers })
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }
}