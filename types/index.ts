export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileItem[];
}

export interface Project {
  id: string;
  name: string;
  files: FileItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateRequest {
  prompt: string;
  conversationHistory: Message[];
  currentFiles: FileItem[];
  operation: 'create' | 'refine' | 'add';
  targetFile?: string;
}

export interface FileOperation {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
}
