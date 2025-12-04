export interface ProcessedResult {
  transcription: string;
  summary: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface FileData {
  file: File;
  base64: string;
  mimeType: string;
}
