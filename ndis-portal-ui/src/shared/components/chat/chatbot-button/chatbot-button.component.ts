import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatIconComponent } from '../../../../shared/components/icons/svg-icons/chat-icon';

@Component({
  selector: 'app-chat-button',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatIconComponent ],
  templateUrl: './chatbot-button.component.html',
})
export class ChatButtonComponent {
  /**
   * Custom click event
   */
  @Output()
  buttonClick = new EventEmitter<void>();

  /**
   * Trigger event
   */
  handleClick() {
    console.log('Button clicked'); // debug

    this.buttonClick.emit();
  }
}
