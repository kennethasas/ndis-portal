import { Component, Input, AfterViewInit, ElementRef, Renderer2, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatMessage } from '../../../models/chat-message.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatIconComponent } from '../../icons/svg-icons/chat-icon';
import { ChatService } from '../../../../app/core/services/chatbot.service';
import { DynamicIconComponent } from '../../icons/dynamic-icon.component';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatIconComponent, DynamicIconComponent],
  templateUrl: './chatbot-message.component.html',
})
export class ChatMessageComponent implements AfterViewInit {
  @Input() message!: ChatMessage;

  constructor(
    private sanitizer: DomSanitizer,
    private chatService: ChatService,
    private elementRef: ElementRef,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    console.log('[ChatMessage] ngAfterViewInit called, message role:', this.message.role);

    // Add click event listeners for AI service buttons with retry logic
    this.attachAiServiceButtonListeners();

    // Add click event listeners for Book Service buttons
    if (this.message.content && this.message.content.includes('book-service-btn')) {
      setTimeout(() => {
        const bookButtons = this.elementRef.nativeElement.querySelectorAll('.book-service-btn');
        console.log('[ChatMessage] Found book-service buttons:', bookButtons.length);
        
        if (bookButtons.length === 0) {
          console.log('[ChatMessage] No book buttons found, retrying in 500ms...');
          setTimeout(() => {
            const retryButtons = this.elementRef.nativeElement.querySelectorAll('.book-service-btn');
            console.log('[ChatMessage] Retry found book-service buttons:', retryButtons.length);
            this.attachBookButtonListeners(retryButtons);
          }, 500);
          return;
        }
        
        this.attachBookButtonListeners(bookButtons);
      }, 100);
    }
  }

  private attachAiServiceButtonListeners() {
    // Try to attach listeners immediately
    this.tryAttachAiServiceButtons();
    
    // Also retry after a delay to ensure DOM is ready
    setTimeout(() => {
      this.tryAttachAiServiceButtons();
    }, 300);
  }

  private tryAttachAiServiceButtons() {
    const buttons = this.elementRef.nativeElement.querySelectorAll('.ai-service-btn');
    console.log('[ChatMessage] Found ai-service buttons:', buttons.length);
    
    buttons.forEach((button: HTMLButtonElement) => {
      // Only attach if not already attached
      if (!button.hasAttribute('data-listener-attached')) {
        button.setAttribute('data-listener-attached', 'true');
        
        button.onclick = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          const serviceText = button.textContent?.trim();
          console.log('[ChatMessage] AI service button clicked:', serviceText);
          if (serviceText) {
            this.chatService.sendMessage(serviceText);
          }
          return false;
        };
      }
    });
  }

  private attachBookButtonListeners(buttons: NodeListOf<Element>) {
    buttons.forEach((btn: Element) => {
      const button = btn as HTMLButtonElement;
      console.log('[ChatMessage] Attaching listener to button:', button);
      
      // Use onclick property for more direct handling
      button.onclick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        const serviceId = button.getAttribute('data-service-id');
        console.log('[ChatMessage] Book button clicked via onclick, serviceId:', serviceId);
        if (serviceId) {
          console.log('[ChatMessage] Navigating to /participant/book-service with serviceId:', serviceId);
          this.router.navigate(['/participant/book-service'], { queryParams: { serviceId: serviceId } }).then(
            (success) => console.log('[ChatMessage] Navigation success:', success),
            (error) => console.error('[ChatMessage] Navigation error:', error)
          );
        }
        return false;
      };
    });
  }

  // Global handler as fallback
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    
    // Handle AI service buttons
    if (target && target.classList && target.classList.contains('ai-service-btn')) {
      event.preventDefault();
      event.stopPropagation();
      const serviceText = target.textContent?.trim();
      console.log('[ChatMessage] AI service button clicked via document listener:', serviceText);
      if (serviceText) {
        this.chatService.sendMessage(serviceText);
      }
      return;
    }
    
    // Handle view service buttons
    if (target && target.classList && target.classList.contains('view-service-btn')) {
      event.preventDefault();
      event.stopPropagation();
      const serviceId = target.getAttribute('data-service-id');
      console.log('[ChatMessage] View button clicked via document listener, serviceId:', serviceId);
      if (serviceId) {
        this.router.navigate(['/services'], { queryParams: { highlightService: serviceId } });
      }
    }
  }

  /**
   * Navigate to booking page for a service
   */
  bookService(serviceId: number) {
    console.log('[ChatMessage] Booking service:', serviceId);
    this.router.navigate(['/participant/book-service'], { queryParams: { serviceId: serviceId.toString() } });
  }

  /**
   * Get icon name based on category
   */
  getIconForCategory(categoryName: string): string {
    const normalized = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const iconMap: { [key: string]: string } = {
      'therapy-supports': 'therapy',
      'community-access': 'community',
      'respite-care': 'care',
      'support-coordination': 'support',
      'daily-personal-activities': 'activity',
    };
    return iconMap[normalized] || 'default';
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

    // Check if this is an AI recommendation message with buttons or service recommendations
    if (content.includes('ai-service-buttons') || content.includes('service-recommendation') || content.includes('book-service-btn')) {
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
