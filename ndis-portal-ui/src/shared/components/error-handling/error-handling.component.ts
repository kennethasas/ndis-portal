import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Error handling component
 * Displays error, warning, success, or info messages in a reusable format
 * Used in Login, Signup, and other forms
 */
@Component({
  selector: 'app-error-handling',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-handling.component.html',
  styleUrls: ['./error-handling.component.css'],
})
export class ErrorHandlingComponent {
  /**
   * The message to display
   * Example: 'Invalid email or password'
   */
  @Input() message: string = '';

  /**
   * The type of message (error, success, warning, info)
   * Default is 'error'
   */
  @Input() type: 'error' | 'success' | 'warning' | 'info' = 'error';

  /**
   * Whether the message is visible
   */
  @Input() isVisible: boolean = false;

  /**
   * Event emitted when user clicks the close button
   */
  @Output() closeError = new EventEmitter<void>();

  /**
   * Close the error message
   */
  close(): void {
    this.closeError.emit();
  }

  /**
   * Get the icon class based on message type
   */
  getIconClass(): string {
    const iconMap: { [key: string]: string } = {
      error: 'pi pi-exclamation-circle',
      success: 'pi pi-check-circle',
      warning: 'pi pi-exclamation-triangle',
      info: 'pi pi-info-circle',
    };
    return iconMap[this.type] || iconMap['error'];
  }

  /**
   * Get CSS class for styling based on type
   */
  getAlertClass(): string {
    return `alert alert-${this.type}`;
  }
}
