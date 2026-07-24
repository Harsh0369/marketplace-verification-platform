import { AppError } from '../utils/error.util';
import Tesseract from 'tesseract.js';

export class OCRProvider {
  constructor() {}

  async extractText(imageBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      // By using a local Tesseract worker, we completely bypass external API rate limits 
      // and network latency, preventing the 10-25s delays from free OCR endpoints.
      const result = await Tesseract.recognize(imageBuffer, 'eng');
      return result.data.text || '';
    } catch (error: any) {
      console.error('[OCRProvider] Failed to extract text:', error);
      throw new AppError('Failed to extract text from image locally', 500);
    }
  }
}

export const ocrProvider = new OCRProvider();
