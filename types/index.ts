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

export interface ProjectPlan {
  description: string;
  pages: PagePlan[];
  structure: string[];
  designTheme: {
    colors: string[];
    typography: string;
    style: string;
  };
}

export interface PagePlan {
  name: string;
  route: string;
  description: string;
  sections: SectionPlan[];
  priority: number;
}

export interface SectionPlan {
  name: string;
  description: string;
  features: string[];
}

export interface Task {
  id: string;
  type: 'page' | 'section' | 'component' | 'style';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: FileItem[];
  dependencies?: string[];
}
