/**
 * ChatMessage Model
 * Represents a single message in the chatbot.
 */

export interface ServiceRecommendation {
  serviceId: number;
  serviceName: string;
  categoryName: string;
  description: string;
  reason: string;
  confidence: number;
}

export interface ChatMessage {
  // Unique ID for tracking
  id: string;

  // Who sent the message
  role: 'user' | 'assistant';

  // Message text content
  content: string;

  // Time message was created
  timestamp: Date;

  // AI service recommendations (when applicable)
  recommendations?: ServiceRecommendation[];

  // Flag for out-of-scope requests
  isOutOfScope?: boolean;
}
