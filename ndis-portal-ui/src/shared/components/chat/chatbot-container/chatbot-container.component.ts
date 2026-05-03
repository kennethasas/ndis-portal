import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { ChatButtonComponent } from '../../../../shared/components/chat/chatbot-button/chatbot-button.component';
import { ChatPanelComponent } from '../chatbot-panel/chatbot-panel.component';
import { AuthService } from '../../../../app/core/services/auth.service';
import { ChatService } from '../../../../app/core/services/chatbot.service';


/**
 * Chatbot Container
 * Controls:
 * - Opening panel
 * - Closing panel
 * - Role-based visibility (Participant only)
 */

@Component({
  selector: 'app-chatbot-container',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatButtonComponent, ChatPanelComponent],
  templateUrl: './chatbot-container.component.html',
})
export class ChatbotContainerComponent implements OnInit, OnDestroy {
  isOpen = false;
  showChatbot = false;
  private authSub!: Subscription;
  private routerSub!: Subscription;

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.checkRole();

    // Re-check role when auth state changes
    this.authSub = this.auth.isAuthenticated$.subscribe(() => {
      this.checkRole();
    });

    // Re-check role on every navigation
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkRole();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  /**
   * Only show chatbot for Participants, not Coordinators
   */
  private checkRole(): void {
    const role = this.auth.getRole();
    this.showChatbot = this.auth.isAuthenticated() && role?.toLowerCase() === 'participant';

    if (!this.showChatbot) {
      this.isOpen = false;
    }

    this.cdr.detectChanges();
  }

  toggleChat() {
    if (!this.showChatbot) {
      this.isOpen = false;
      this.cdr.detectChanges();
      return;
    }

    const wasOpen = this.isOpen;
    this.isOpen = !this.isOpen;

    // If opening via chat button (not via service recommendation card),
    // reset to normal chat mode
    if (!wasOpen && this.isOpen) {
      this.chatService.resetToNormalChat();
    }

    this.cdr.detectChanges();
  }

  /**
   * Open chat in AI recommendation mode (called from service recommendation card)
   */
  openAiRecommendation() {
    if (!this.showChatbot) {
      return;
    }

    // Initialize AI recommendation mode
    this.chatService.initializeAiRecommendation();
    
    // Open the chat panel
    this.isOpen = true;
    this.cdr.detectChanges();
  }
}
