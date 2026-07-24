import { AppError } from '../utils/error.util';

export class OCRProvider {
  private apiKey: string;
  private endpoint = 'https://api.ocr.space/parse/image';

  constructor() {
    // 'helloworld' is a default free testing key provided by OCR.space
    this.apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';
  }

  async extractText(imageBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      const base64Data = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      
      const formData = new URLSearchParams();
      formData.append('apikey', this.apiKey);
      formData.append('base64Image', base64Data);
      formData.append('OCREngine', '2'); // Engine 2 is generally better for numbers and special characters

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (!response.ok) {
        throw new AppError(`OCR API HTTP Error: ${response.status}`, 500);
      }

      const data = await response.json();
      
      if (data.IsErroredOnProcessing) {
        throw new AppError(`OCR API Error: ${data.ErrorMessage}`, 500);
      }

      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        return '';
      }

      return data.ParsedResults[0].ParsedText || '';
    } catch (error: any) {
      console.error('[OCRProvider] Failed to extract text:', error);
      throw new AppError('Failed to extract text from image', 500);
    }
  }
}

export const ocrProvider = new OCRProvider();
