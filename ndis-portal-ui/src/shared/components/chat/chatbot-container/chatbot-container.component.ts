import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatButtonComponent } from '../../../../shared/components/chat/chatbot-button/chatbot-button.component';
import { ChatPanelComponent } from '../chatbot-panel/chatbot-panel.component';


/**
 * Chatbot Container
 * Controls:
 * - Opening panel
 * - Closing panel
 */

@Component({
  selector: 'app-chatbot-container',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatButtonComponent, ChatPanelComponent],
  templateUrl: './chatbot-container.component.html',
})
export class ChatbotContainerComponent {
  isOpen = false;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}