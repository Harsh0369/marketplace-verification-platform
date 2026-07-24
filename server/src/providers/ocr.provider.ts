import { AppError } from '../utils/error.util';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export class OCRProvider {
  constructor() {}

  async extractText(imageBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      // 1. Try OCR.space API first (much better for scene text like jeans/clothing)
      const apiKey = process.env.OCR_API_KEY;
      if (apiKey) {
        try {
          const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
          const formData = new FormData();
          formData.append('apikey', apiKey);
          formData.append('base64Image', base64Image);
          formData.append('OCREngine', '2'); // Engine 2 is vastly superior for numbers and receipts
          formData.append('scale', 'true');
          
          const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          if (data && data.ParsedResults && data.ParsedResults.length > 0) {
            const extracted = data.ParsedResults[0].ParsedText || '';
            if (extracted.trim().length > 0) {
              console.log('[OCRProvider] Successfully extracted text via OCR.space');
              return extracted;
            }
          }
        } catch (apiError) {
          console.warn('[OCRProvider] OCR.space API failed, falling back to local Tesseract:', apiError);
        }
      }

      // 2. Fallback: Local Tesseract worker
      console.log('[OCRProvider] Using local Tesseract fallback...');
      const processedImage = await sharp(imageBuffer)
        .grayscale()
        .normalize()
        .toBuffer();

      const result = await Tesseract.recognize(processedImage, 'eng');
      return result.data.text || '';
    } catch (error: any) {
      console.error('[OCRProvider] Failed to extract text:', error);
      throw new AppError('Failed to extract text from image locally', 500);
    }
  }
}

export const ocrProvider = new OCRProvider();
