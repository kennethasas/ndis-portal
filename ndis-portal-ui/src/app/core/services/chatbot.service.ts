import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, catchError, firstValueFrom, of } from 'rxjs';
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
  private cachedCategories: { id: number; name: string }[] = [];

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

    // Check if this is an AI recommendation request (async)
    this.checkAndHandleRecommendationRequest(text, updatedMessages);
  }

  /**
   * Check if we're in an active recommendation conversation
   */
  private isInRecommendationConversation(messages: ChatMessage[]): boolean {
    if (messages.length === 0) return false;
    
    // Find the last assistant message
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAssistantMessage) return false;
    
    // Check if it had service recommendations or was the AI welcome message
    const hasRecommendations = lastAssistantMessage.recommendations && lastAssistantMessage.recommendations.length > 0;
    const isAiWelcome = lastAssistantMessage.content.includes('ai-service-buttons');
    
    return hasRecommendations || isAiWelcome;
  }

  /**
   * Check if message is a recommendation request and route accordingly
   */
  private async checkAndHandleRecommendationRequest(text: string, currentMessages: ChatMessage[]) {
    const isRecommendationRequest = await this.isAiRecommendationRequest(text);
    const isFollowUpInRecommendationFlow = this.isInRecommendationConversation(currentMessages);

    if (isRecommendationRequest || isFollowUpInRecommendationFlow) {
      console.log('[ChatService] Calling AI recommendation API...');
      this.callAiRecommendationApi(text, currentMessages, isFollowUpInRecommendationFlow);
    } else {
      // Call regular chat API
      console.log('[ChatService] Calling regular chat API...');
      this.callChatApi(text, currentMessages);
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
   * Fetch service categories from the API
   */
  private async fetchCategories(): Promise<{ id: number; name: string }[]> {
    if (this.cachedCategories.length > 0) {
      return this.cachedCategories;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/service-categories`).pipe(
          catchError(error => {
            console.error('[ChatService] Failed to fetch categories:', error);
            return of({ Data: [] });
          })
        )
      );

      const categories = response?.Data || response || [];
      this.cachedCategories = categories.map((c: any) => ({
        id: c.id || c.Id,
        name: c.name || c.Name
      }));
      return this.cachedCategories;
    } catch {
      return [];
    }
  }

  /**
   * Check if the message is an AI recommendation request
   */
  private async isAiRecommendationRequest(text: string): Promise<boolean> {
    const defaultKeywords = [
      'find the right service',
      'recommend services',
      'service recommendation',
      'what service',
      'which service',
      'help me find',
      'i need help with',
      'looking for service'
    ];

    // Check default keywords first
    if (defaultKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    )) {
      return true;
    }

    // Check against dynamic category names from database
    const categories = await this.fetchCategories();
    return categories.some(cat =>
      text.toLowerCase().includes(cat.name.toLowerCase())
    );
  }

  /**
   * Call AI recommendation API
   */
  private callAiRecommendationApi(message: string, currentMessages: ChatMessage[], isFollowUp: boolean = false) {
    const typingStartedAt = Date.now();
    this.loadingSubject.next(true);
    console.log('[ChatService] callAiRecommendationApi - API URL:', this.aiRecommendationUrl, 'isFollowUp:', isFollowUp);

    const request: AiRecommendationRequest = {
      message: message.trim()
    };

    this.http.post<any>(this.aiRecommendationUrl, request)
      .pipe(
        catchError(error => {
          console.error('[ChatService] AI recommendation API error:', error);
          return of({
            Data: {
              recommendations: [],
              isOutOfScope: true,
              outOfScopeMessage: 'Sorry, I am temporarily unable to provide service recommendations. Please try again later or contact your Support Coordinator for assistance.'
            }
          });
        })
      )
      .subscribe(response => {
        const elapsed = Date.now() - typingStartedAt;
        const remainingDelay = Math.max(this.minimumTypingMs - elapsed, 0);

        setTimeout(() => {
          console.log('[ChatService] AI recommendation API response received:', response);
          
          // Extract data from wrapped response
          const data = response.Data || response;
          
          if (data.isOutOfScope) {
            // If this was a follow-up in a recommendation conversation, fall back to regular chat
            if (isFollowUp) {
              console.log('[ChatService] Recommendation API returned out-of-scope for follow-up, falling back to chat API');
              this.loadingSubject.next(false);
              this.callChatApi(message, currentMessages);
              return;
            }

            // Handle out-of-scope response for initial recommendation requests
            const botMessage: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.outOfScopeMessage || 'Sorry, your request is outside the scope of our available NDIS services.',
              timestamp: new Date(),
              isOutOfScope: true,
            };

            const updatedMessages = [...this.messagesSubject.value, botMessage];
            this.messagesSubject.next(updatedMessages);
            this.saveMessages(updatedMessages);
          } else if (data.recommendations && data.recommendations.length > 0) {
            // Debug: Log raw recommendations
            console.log('[ChatService] Raw recommendations:', data.recommendations.map((r: any) => ({
              id: r.serviceId ?? r.ServiceId,
              name: r.serviceName ?? r.ServiceName
            })));

            // Deduplicate recommendations by serviceId (handle both PascalCase and camelCase)
            const uniqueRecommendations = data.recommendations.filter(
              (rec: any, index: number, self: any[]) => {
                const recId = rec.serviceId ?? rec.ServiceId;
                const recName = (rec.serviceName ?? rec.ServiceName ?? '').toLowerCase();
                const isFirst = index === self.findIndex((r: any) =>
                  (r.serviceId ?? r.ServiceId) === recId ||
                  (r.serviceName ?? r.ServiceName ?? '').toLowerCase() === recName
                );
                return isFirst;
              }
            );

            console.log('[ChatService] After deduplication:', uniqueRecommendations.length, 'unique services');

            // Store recommendations as structured data
            const botMessage: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: `Based on your needs, I found ${uniqueRecommendations.length} service${uniqueRecommendations.length > 1 ? 's' : ''} that might be perfect for you. Click on any service card to book it:`,
              timestamp: new Date(),
              recommendations: uniqueRecommendations,
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
   * Format AI recommendations into readable text with Book buttons
   */
  private formatRecommendations(recommendations: any[]): string {
    return recommendations.map((rec, index) => {
      return `<div class="service-recommendation" style="margin-bottom: 16px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
  <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${index + 1}. ${rec.serviceName}</div>
  <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${rec.categoryName}</div>
  <div style="font-size: 14px; color: #374151; margin-bottom: 8px; line-height: 1.4;">${rec.reason}</div>
  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
    <span style="font-size: 12px; color: #6F2C91; font-weight: 500;">Confidence: ${Math.round(rec.confidence * 100)}%</span>
    <button class="book-service-btn" data-service-id="${rec.serviceId}" style="background: #6F2C91; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 500; transition: background 0.2s;">
      Book this service
    </button>
  </div>
</div>`;
    }).join('');
  }

  /**
   * Initialize chat with AI recommendation context
   */
  async initializeAiRecommendation(): Promise<void> {
    if (!this.isParticipant()) {
      console.log('[ChatService] Access denied - only participants can use chat');
      return;
    }

    this.isAiRecommendationMode = true;

    // Fetch categories from API
    const categories = await this.fetchCategories();

    // Build dynamic buttons from database categories
    const categoryButtons = categories.length > 0
      ? categories.map(cat => `
  <button class="ai-service-btn" data-service="${cat.name.toLowerCase().replace(/\s+/g, '-')}" style="background: white; color: #334155; border: 2px solid black; padding: 12px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; text-align: left; transition: all 0.2s; font-weight: 500;">
    ${cat.name}
  </button>`).join('')
      : `
  <button class="ai-service-btn" data-service="browse-all" style="background: white; color: #334155; border: 2px solid black; padding: 12px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; text-align: left; transition: all 0.2s; font-weight: 500;">
    Browse All Services
  </button>`;

    const aiWelcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Let's find the perfect services for you

Tell us what areas of daily life you need support with, and we'll recommend the most relevant services.

What areas of daily life do you need support with?

<div class="ai-service-buttons" style="display: flex; flex-direction: column; gap: 8px; margin: 12px 0;">
${categoryButtons}
</div>

<style>
.ai-service-btn:hover {
  background: #f3f0f5 !important;
  color: #334155 !important;
}
.ai-service-btn:active {
  transform: scale(0.98);
}
</style>

Click on any button above, or tell me in your own words what you need help with!`,
      timestamp: new Date(),
    };

    // Preserve existing conversation history and append the welcome message
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = [...currentMessages, aiWelcomeMessage];
    this.messagesSubject.next(updatedMessages);
    this.saveMessages(updatedMessages);
    console.log('[ChatService] AI recommendation initialized with', categories.length, 'categories');
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
    this.cachedCategories = []; // Clear cached categories
    console.log('[ChatService] Chat history cleared');
  }

  /**
   * Reset to normal chat mode (when opening via chat button)
   */
  resetToNormalChat(): void {
    // Only reset if we're currently in AI recommendation mode
    if (this.isAiRecommendationMode) {
      this.isAiRecommendationMode = false;
      console.log('[ChatService] Reset to normal chat mode');
    }
  }

  /**
   * Check if currently in AI recommendation mode
   */
  isInAiRecommendationMode(): boolean {
    return this.isAiRecommendationMode;
  }
}
