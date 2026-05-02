export interface ServiceRecommendation {
  serviceId: number;
  serviceName: string;
  categoryName: string;
  description: string;
  reason: string;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: ServiceRecommendation[];
  isOutOfScope?: boolean;
}
