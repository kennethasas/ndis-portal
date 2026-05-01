import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

import { ChatMessage } from '../models/chat-message.model';

interface ChatApiResponse {
  reply?: string;
  Data?: {
    reply?: string;
  };
  Message?: {
    reply?: string;
  };
}

interface ChatRequest {
  message: string;
  conversationHistory: { role: string; content: string }[];
}

interface AiRecommendationRequest {
  message: string;
}

interface AiRecommendationResponse {
  recommendations: {
    serviceId: number;
    serviceName: string;
    categoryName: string;
    description: string;
    reason: string;
    confidence: number;
  }[];
  isOutOfScope: boolean;
  outOfScopeMessage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private storageKey = 'chat_history';
  private apiUrl = `${environment.apiUrl}/chat`;
  private aiRecommendationUrl = `${environment.apiUrl}/ai/recommend-services`;
  private minimumTypingMs = 500;
  private isAiRecommendationMode = false;

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  
  private loadingSubject = new BehaviorSubject<boolean>(false);

  messages$ = this.messagesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private auth: AuthService
  ) {
    this.messagesSubject.next(this.loadMessages());
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Check if current user is participant
   */
  private isParticipant(): boolean {
    const role = this.auth.getRole();
    return role?.toLowerCase() === 'participant';
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Send user message to API
   */
  sendMessage(text: string) {
    console.log('[ChatService] sendMessage called:', text);
    
    // Block non-participants
    if (!this.isParticipant()) {
      console.log('[ChatService] Access denied - only participants can use chat');
      return;
    }
    
    if (!text.trim() || this.isLoading()) {
      console.log('[ChatService] Empty message, returning');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...this.messagesSubject.value, userMessage];
    console.log('[ChatService] Adding user message, total messages:', updatedMessages.length);
    this.messagesSubject.next(updatedMessages);
    this.saveMessages(updatedMessages);

    // Check if this is an AI recommendation request
    if (this.isAiRecommendationRequest(text) || this.isAiRecommendationMode) {
      console.log('[ChatService] Calling AI recommendation API...');
      this.callAiRecommendationApi(text);
    } else {
      // Call regular chat API
      console.log('[ChatService] Calling regular chat API...');
      this.callChatApi(text, updatedMessages);
    }
  }

  /**
   * Call backend chat API
   */
  private callChatApi(message: string, currentMessages: ChatMessage[]) {
    const typingStartedAt = Date.now();
    this.loadingSubject.next(true);
    console.log('[ChatService] callChatApi - API URL:', this.apiUrl);

    // Prepare conversation history (last 10 messages for context)
    const conversationHistory = currentMessages
      .slice(-11, -1) // Exclude the last user message we just added
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    const request: ChatRequest = {
      message: message.trim(),
      conversationHistory
    };

    this.http.post<any>(this.apiUrl, request)
      .pipe(
        catchError(error => {
          console.error('[ChatService] API error:', error);
          console.error('[ChatService] Error status:', error.status);
          console.error('[ChatService] Error message:', error.message);
          return of({
            reply: 'Sorry, I am temporarily unavailable. Please try again later or contact your Support Coordinator for assistance.',
          });
        })
      )
      .subscribe(response => {
        const elapsed = Date.now() - typingStartedAt;
        const remainingDelay = Math.max(this.minimumTypingMs - elapsed, 0);

        setTimeout(() => {
          console.log('[ChatService] API response received:', response);
          console.log('[ChatService] Response structure:', JSON.stringify(response, null, 2));
          
          // Handle wrapped response format
          const reply = response.Data?.reply || response.reply || response.Message?.reply;
          
          console.log('[ChatService] Extracted reply:', reply);
          
          if (reply) {
            console.log('[ChatService] Got reply, adding bot message');
            const botMessage: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: reply,
              timestamp: new Date(),
            };

            const updatedMessages = [...this.messagesSubject.value, botMessage];
            console.log('[ChatService] Total messages after adding bot:', updatedMessages.length);
            this.messagesSubject.next(updatedMessages);
            this.saveMessages(updatedMessages);
          } else {
            console.log('[ChatService] Empty reply from API - response keys:', Object.keys(response));
          }

          this.loadingSubject.next(false);
        }, remainingDelay);
      });
  }

  /**
   * Save to localStorage
   */
  private saveMessages(messages: ChatMessage[]) {
    if (!this.isBrowser()) return;

    localStorage.setItem(this.storageKey, JSON.stringify(messages));
  }

  /**
   * Load stored messages
   */
  private loadMessages(): ChatMessage[] {
    if (!this.isBrowser()) return [];

    const data = localStorage.getItem(this.storageKey);

    try {
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Check if the message is an AI recommendation request
   */
  private isAiRecommendationRequest(text: string): boolean {
    const aiKeywords = [
      'daily personal activities',
      'community access',
      'therapy supports',
      'support coordination',
      'respite care',
      'find the right service',
      'recommend services',
      'service recommendation'
    ];
    
    return aiKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Call AI recommendation API
   */
  private callAiRecommendationApi(message: string) {
    const typingStartedAt = Date.now();
    this.loadingSubject.next(true);
    console.log('[ChatService] callAiRecommendationApi - API URL:', this.aiRecommendationUrl);

    const request: AiRecommendationRequest = {
      message: message.trim()
    };

    this.http.post<AiRecommendationResponse>(this.aiRecommendationUrl, request)
      .pipe(
        catchError(error => {
          console.error('[ChatService] AI recommendation API error:', error);
          return of({
            recommendations: [],
            isOutOfScope: true,
            outOfScopeMessage: 'Sorry, I am temporarily unable to provide service recommendations. Please try again later or contact your Support Coordinator for assistance.'
          });
        })
      )
      .subscribe(response => {
        const elapsed = Date.now() - typingStartedAt;
        const remainingDelay = Math.max(this.minimumTypingMs - elapsed, 0);

        setTimeout(() => {
          console.log('[ChatService] AI recommendation API response received:', response);
          
          if (response.isOutOfScope) {
            // Handle out-of-scope response
            const botMessage: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: response.outOfScopeMessage || 'Sorry, your request is outside the scope of our available NDIS services.',
              timestamp: new Date(),
            };

            const updatedMessages = [...this.messagesSubject.value, botMessage];
            this.messagesSubject.next(updatedMessages);
            this.saveMessages(updatedMessages);
          } else if (response.recommendations && response.recommendations.length > 0) {
            // Format recommendations as a nice response
            const recommendationsText = this.formatRecommendations(response.recommendations);
            const botMessage: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: `Based on your needs, I found the following services that might be perfect for you:\n\n${recommendationsText}\n\nWould you like more information about any of these services, or would you like me to help you with something else?`,
              timestamp: new Date(),
            };

            const updatedMessages = [...this.messagesSubject.value, botMessage];
            this.messagesSubject.next(updatedMessages);
            this.saveMessages(updatedMessages);
          } else {
            // No recommendations found
            const botMessage: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: "I couldn't find any specific services matching your needs. Could you tell me more about your situation, or would you like me to help you explore our available service categories?",
              timestamp: new Date(),
            };

            const updatedMessages = [...this.messagesSubject.value, botMessage];
            this.messagesSubject.next(updatedMessages);
            this.saveMessages(updatedMessages);
          }

          this.loadingSubject.next(false);
        }, remainingDelay);
      });
  }

  /**
   * Format AI recommendations into readable text
   */
  private formatRecommendations(recommendations: any[]): string {
    return recommendations.map((rec, index) => {
      return `${index + 1}. **${rec.serviceName}** (${rec.categoryName})\n   ${rec.reason}\n   *Confidence: ${Math.round(rec.confidence * 100)}%*`;
    }).join('\n\n');
  }

  /**
   * Initialize chat with AI recommendation context
   */
  initializeAiRecommendation(): void {
    if (!this.isParticipant()) {
      console.log('[ChatService] Access denied - only participants can use chat');
      return;
    }

    this.isAiRecommendationMode = true;

    const aiWelcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Let's find the perfect services for you

Tell us what areas of daily life you need support with, and we'll recommend the most relevant services.

What areas of daily life do you need support with?

<div class="ai-service-buttons" style="display: flex; flex-direction: column; gap: 8px; margin: 12px 0;">
  <button class="ai-service-btn" data-service="daily-activities" style="background: #6F2C91; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; text-align: left; transition: background 0.2s;">
    Daily personal activities
  </button>
  <button class="ai-service-btn" data-service="community-access" style="background: #6F2C91; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; text-align: left; transition: background 0.2s;">
    Community access and social activities
  </button>
  <button class="ai-service-btn" data-service="therapy-supports" style="background: #6F2C91; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; text-align: left; transition: background 0.2s;">
    Therapy supports
  </button>
  <button class="ai-service-btn" data-service="support-coordination" style="background: #6F2C91; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; text-align: left; transition: background 0.2s;">
    Support coordination
  </button>
  <button class="ai-service-btn" data-service="respite-care" style="background: #6F2C91; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; text-align: left; transition: background 0.2s;">
    Respite care
  </button>
</div>

<style>
.ai-service-btn:hover {
  background: #5a189a !important;
}
.ai-service-btn:active {
  transform: scale(0.98);
}
</style>

Click on any button above, or tell me in your own words what you need help with!`,
      timestamp: new Date(),
    };

    this.messagesSubject.next([aiWelcomeMessage]);
    this.saveMessages([aiWelcomeMessage]);
    console.log('[ChatService] AI recommendation initialized');
  }

  /**
   * Clear chat history - called when user logs in
   */
  clearHistory(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.storageKey);
    }

    this.messagesSubject.next([]);
    this.isAiRecommendationMode = false;
    console.log('[ChatService] Chat history cleared');
  }
}
