import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Component } from '@angular/core';

import { ChatPanelComponent } from '../../../shared/components/chat/chatbot-panel/chatbot-panel.component';
import { ChatButtonComponent } from '../../../shared/components/chat/chatbot-button/chatbot-button.component';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatPanelComponent, ChatButtonComponent],
  templateUrl: './chat.component.html',
})
export class ChatComponent {
  isOpen = false;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}
