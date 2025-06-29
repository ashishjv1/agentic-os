export interface Agent {
  id: string;
  name: string;
  description: string;
  provider?: 'openai' | 'anthropic' | 'openrouter';
  model?: string;
  requiresApiKey?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId: string;
}

export interface GeneratedApp {
  id: string;
  name: string;
  prompt: string;
  agentId: string;
  html: string;
  css: string;
  js: string;
  createdAt: Date;
}
