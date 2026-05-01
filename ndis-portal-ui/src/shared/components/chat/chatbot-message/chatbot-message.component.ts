import { Component, Input, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../models/chat-message.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatIconComponent } from '../../icons/svg-icons/chat-icon';
import { ChatService } from '../../../../app/core/services/chatbot.service';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatIconComponent],
  templateUrl: './chatbot-message.component.html',
})
export class ChatMessageComponent implements AfterViewInit {
  @Input() message!: ChatMessage;

  constructor(
    private sanitizer: DomSanitizer,
    private chatService: ChatService,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    // Add click event listeners for AI service buttons
    if (this.message.content.includes('ai-service-buttons')) {
      setTimeout(() => {
        const buttons = this.elementRef.nativeElement.querySelectorAll('.ai-service-btn');
        buttons.forEach((button: HTMLButtonElement) => {
          button.addEventListener('click', (event: Event) => {
            event.preventDefault();
            const serviceType = button.getAttribute('data-service');
            const serviceText = button.textContent?.trim();
            if (serviceText) {
              this.chatService.sendMessage(serviceText);
            }
          });
        });
      }, 0);
    }
  }

  /**
   * Check if bot message
   */
  isBot(): boolean {
    return this.message.role === 'assistant';
  }

  /**
   * Format message content with line breaks and basic formatting
   */
  formatMessage(content: string): SafeHtml {
    if (!content) return this.sanitizer.bypassSecurityTrustHtml('');

    // Check if this is an AI recommendation message with buttons
    if (content.includes('ai-service-buttons')) {
      // For AI recommendation messages, allow the specific HTML structure
      return this.sanitizer.bypassSecurityTrustHtml(content);
    }

    // Escape HTML to prevent XSS for regular messages
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Convert newlines to <br>
    formatted = formatted.replace(/\n\n/g, '<br><br>');
    formatted = formatted.replace(/\n/g, '<br>');

    // Convert bullet points
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc ml-4 my-2">$1</ul>');

    // Convert numbered lists
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Bold text between ** (optional enhancement)
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
}
