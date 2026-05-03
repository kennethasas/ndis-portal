import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../app/core/services/chatbot.service';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../../../../shared/models/chat-message.model';
import { ChatMessageComponent } from '../../../../shared/components/chat/chatbot-message/chatbot-message.component';
import { ChatIconComponent } from '../../icons/svg-icons/chat-icon';

@Component({
  selector: 'app-chat-messages',
  standalone: true,

  imports: [CommonModule, ChatMessageComponent, ChatIconComponent],

  templateUrl: './chatbot-messages.component.html',
})
export class ChatMessagesComponent implements OnInit, AfterViewInit, OnDestroy {
  messages: ChatMessage[] = [];
  loading = false;
  private messagesSub?: Subscription;
  private loadingSub?: Subscription;
  private isDestroyed = false;
  private viewReady = false;

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef;

  constructor(
    private chat: ChatService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    this.messagesSub = this.chat.messages$.subscribe((messages) => {
      this.messages = messages;
      this.refreshChatView();
    });

    this.loadingSub = this.chat.loading$.subscribe((loading) => {
      this.loading = loading;
      this.refreshChatView();
    });
  }

  /**
   * Auto-scroll when messages change
   */
  ngAfterViewInit() {
    this.viewReady = true;
    this.refreshChatView();
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.messagesSub?.unsubscribe();
    this.loadingSub?.unsubscribe();
  }

  private refreshChatView() {
    this.zone.run(() => {
      setTimeout(() => {
        if (this.isDestroyed) return;

        this.cdr.detectChanges();

        if (this.viewReady) {
          this.scrollToBottom();
        }
      }, 0);
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
