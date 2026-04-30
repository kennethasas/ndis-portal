import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../app/core/services/chatbot.service';
import { Observable } from 'rxjs';
import { ChatMessage } from '../../../../shared/models/chat-message.model';
import { ChatMessageComponent } from '../../../../shared/components/chat/chatbot-message/chatbot-message.component';

@Component({
  selector: 'app-chat-messages',
  standalone: true,

  imports: [CommonModule, ChatMessageComponent],

  templateUrl: './chatbot-messages.component.html',
})
export class ChatMessagesComponent implements AfterViewInit {
  messages$!: Observable<ChatMessage[]>;
  loading$!: Observable<boolean>;

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef;

  constructor(private chat: ChatService) {
    this.messages$ = this.chat.messages$;
    this.loading$ = this.chat.loading$;
  }

  /**
   * Auto-scroll when messages change
   */
  ngAfterViewInit() {
    this.messages$.subscribe(() => {
      setTimeout(() => {
        this.scrollToBottom();
      });
    });
  }

  private scrollToBottom() {
    if (!this.scrollContainer) return;

    const el = this.scrollContainer.nativeElement;

    el.scrollTop = el.scrollHeight;
  }

  trackById(index: number, msg: ChatMessage) {
    return msg.id;
  }
}