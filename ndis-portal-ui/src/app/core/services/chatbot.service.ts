import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private storageKey = 'chat_history';
  private apiUrl = `${environment.apiUrl}/chat`;

  private messagesSubject = new BehaviorSubject<ChatMessage[]>(
    this.loadMessages(),
  );
  
  private loadingSubject = new BehaviorSubject<boolean>(false);

  messages$ = this.messagesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Send user message to API
   */
  sendMessage(text: string) {
    console.log('[ChatService] sendMessage called:', text);
    if (!text.trim()) {
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

    // Call backend API
    console.log('[ChatService] Calling API...');
    this.callChatApi(text, updatedMessages);
  }

  /**
   * Call backend chat API
   */
  private callChatApi(message: string, currentMessages: ChatMessage[]) {
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
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Sorry, I am temporarily unavailable. Please try again later or contact your Support Coordinator for assistance.',
            timestamp: new Date(),
          };
          const messagesWithError = [...this.messagesSubject.value, errorMessage];
          this.messagesSubject.next(messagesWithError);
          this.saveMessages(messagesWithError);
          return of({ reply: '' });
        }),
        finalize(() => {
          this.loadingSubject.next(false);
        })
      )
      .subscribe(response => {
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
      });
  }

  /**
   * Save to localStorage
   */
  private saveMessages(messages: ChatMessage[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(messages));
  }

  /**
   * Load stored messages
   */
  private loadMessages(): ChatMessage[] {
    const data = localStorage.getItem(this.storageKey);

    return data ? JSON.parse(data) : [];
  }
}
