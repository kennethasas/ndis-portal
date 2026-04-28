import { Component, Output, EventEmitter } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ChatInputComponent } from '../chatbot-input/chatbot-input.component';
import { ChatMessagesComponent } from '../chatbot-messages/chatbot-messages.component';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule,  ChatInputComponent, ChatMessagesComponent],

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
export class ChatPanelComponent {
  @Output()
  close = new EventEmitter<void>();

  state: 'open' | 'closed' = 'open';
}