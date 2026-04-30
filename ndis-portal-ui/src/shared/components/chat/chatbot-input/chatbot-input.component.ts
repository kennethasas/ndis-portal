import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../app/core/services/chatbot.service';
import { SendIconComponent } from '../../icons/svg-icons/send-icon'
@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, SendIconComponent],
  templateUrl: './chatbot-input.component.html',
})
export class ChatInputComponent {
  text = '';

  constructor(private chat: ChatService) {}

  send() {
    console.log('[ChatInput] Sending message:', this.text);
    if (this.text.trim()) {
      this.chat.sendMessage(this.text);
      this.text = '';
    }
  }
}
