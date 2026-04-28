import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../models/chat-message.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-message.component.html',
})
export class ChatMessageComponent {
  @Input() message!: ChatMessage;

  /**
   * Check if bot message
   */
  isBot(): boolean {
    return this.message.role === 'assistant';
  }
}
