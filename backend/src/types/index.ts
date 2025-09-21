export interface Image {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  uploadedAt: string;
  description?: string;
  tags?: string[];
}

export interface ImageUpload {
  description?: string;
  tags?: string[];
}