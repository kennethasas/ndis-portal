import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private storageKey = 'chat_history';

  private messagesSubject = new BehaviorSubject<ChatMessage[]>(
    this.loadMessages(),
  );

  messages$ = this.messagesSubject.asObservable();

  /**
   * Send user message
   */
  sendMessage(text: string) {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),

      role: 'user',

      content: text,

      timestamp: new Date(),
    };

    const updatedMessages = [...this.messagesSubject.value, userMessage];

    this.messagesSubject.next(updatedMessages);

    this.saveMessages(updatedMessages);

    // Fake bot reply
    this.simulateBotReply();
  }

  /**
   * Simulated bot
   */
  private simulateBotReply() {
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),

        role: 'assistant',

        content: 'Hello! I am your assistant.',

        timestamp: new Date(),
      };

      const updatedMessages = [...this.messagesSubject.value, botMessage];

      this.messagesSubject.next(updatedMessages);

      this.saveMessages(updatedMessages);
    }, 800);
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
