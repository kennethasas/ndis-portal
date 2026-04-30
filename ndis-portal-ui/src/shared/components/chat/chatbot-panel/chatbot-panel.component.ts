import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChatInputComponent } from '../chatbot-input/chatbot-input.component';
import { ChatMessagesComponent } from '../chatbot-messages/chatbot-messages.component';
import { ChatService } from '../../../../app/core/services/chatbot.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

// Service keyword mapping - keywords map to serviceId and service name
const SERVICE_KEYWORDS: { [key: string]: { id: number; name: string; keywords: string[] } } = {
  hygiene: { id: 1, name: 'Personal Hygiene Assistance', keywords: ['hygiene', 'shower', 'bath', 'wash', 'cleaning', 'grooming', 'toilet', 'personal care'] },
  transport: { id: 2, name: 'Transport Services', keywords: ['transport', 'drive', 'ride', 'vehicle', 'car', 'bus', 'travel', 'appointment'] },
  meal: { id: 3, name: 'Meal Preparation', keywords: ['meal', 'food', 'cook', 'cooking', 'kitchen', 'lunch', 'dinner', 'breakfast', 'eat'] },
  cleaning: { id: 4, name: 'Home Cleaning', keywords: ['cleaning', 'housework', 'tidy', 'vacuum', 'mop', 'housekeeping', 'domestic'] },
  nursing: { id: 5, name: 'Nursing Care', keywords: ['nursing', 'nurse', 'medical', 'medication', 'wound', 'health', 'care'] },
};

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, ChatInputComponent, ChatMessagesComponent],

  animations: [
    trigger('chatAnimation', [
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'scale(0.7) translateY(20px)',
        }),
      ),

      state(
        'open',
        style({
          opacity: 1,
          transform: 'scale(1) translateY(0)',
        }),
      ),

      transition('closed => open', [animate('180ms ease-out')]),

      transition('open => closed', [animate('150ms ease-in')]),
    ]),
  ],

  templateUrl: './chatbot-panel.component.html',
})
export class ChatPanelComponent implements OnInit, OnDestroy {
  @Output()
  close = new EventEmitter<void>();

  @Output()
  bookService = new EventEmitter<void>();

  state: 'open' | 'closed' = 'open';
  detectedService: { id: number; name: string } | null = null;

  private messagesSubscription!: Subscription;

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit() {
    // Subscribe to messages and detect service keywords
    this.messagesSubscription = this.chatService.messages$.subscribe(messages => {
      this.detectServiceFromMessages(messages);
    });
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  /**
   * Detect service keywords from chat messages
   */
  private detectServiceFromMessages(messages: any[]) {
    if (!messages || messages.length === 0) {
      this.detectedService = null;
      return;
    }

    // Check the last few messages (both user and assistant)
    const recentMessages = messages.slice(-5);
    const textToCheck = recentMessages.map(m => m.content?.toLowerCase() || '').join(' ');

    for (const service of Object.values(SERVICE_KEYWORDS)) {
      for (const keyword of service.keywords) {
        if (textToCheck.includes(keyword.toLowerCase())) {
          this.detectedService = { id: service.id, name: service.name };
          return;
        }
      }
    }

    // No service detected
    this.detectedService = null;
  }

  /**
   * Navigate to booking page for detected service
   */
  onBookService() {
    if (this.detectedService) {
      const url = `/book-new?serviceId=${this.detectedService.id}`;
      this.router.navigateByUrl(url);
      this.close.emit();
    }
  }
}