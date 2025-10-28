
export enum ChatMessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: ChatMessageRole;
  text: string;
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
}
