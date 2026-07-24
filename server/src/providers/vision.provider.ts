import { HfInference } from '@huggingface/inference';
import { AppError } from '../utils/error.util';

export class VisionProvider {
  private hf: HfInference;

  constructor() {
    if (!process.env.HF_TOKEN) {
      console.warn('⚠️ HF_TOKEN not set in environment. Vision Provider may fail if rate limited.');
    }
    this.hf = new HfInference(process.env.HF_TOKEN);
  }

  async classifyImage(imageBuffer: Buffer): Promise<{ label: string; score: number }[]> {
    try {
      // Convert Buffer to Uint8Array to satisfy Blob constructor typings
      const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' });

      // We use a robust general-purpose Vision Transformer model
      const result = await this.hf.imageClassification({
        data: blob,
        model: 'google/vit-base-patch16-224'
      });

      return result.map((r: any) => ({ label: r.label, score: r.score }));
    } catch (error: any) {
      console.error('[VisionProvider] Classification failed:', error);
      throw new AppError('Failed to classify image', 500);
    }
  }
}

export const visionProvider = new VisionProvider();
