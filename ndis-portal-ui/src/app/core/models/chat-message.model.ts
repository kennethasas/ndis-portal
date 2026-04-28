/**
 * ChatMessage Model
 * Represents a single message in the chatbot.
 */

export interface ChatMessage {
  // Unique ID for tracking
  id: string;

  // Who sent the message
  role: 'user' | 'assistant';

  // Message text content
  content: string;

  // Time message was created
  timestamp: Date;
}
