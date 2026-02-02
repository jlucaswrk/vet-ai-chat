export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface PDFDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  documents: PDFDocument[];
  apiKey: string | null;
}

export interface ApiKeyConfig {
  key: string;
  isValid: boolean;
}
