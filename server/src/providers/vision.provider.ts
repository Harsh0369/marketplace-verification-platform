import { HfInference } from '@huggingface/inference';
import { AppError } from '../utils/error.util';
import sharp from 'sharp';

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
      // The google/vit-base-patch16-224 model strictly expects 224x224 images.
      // By compressing and resizing locally, we drop a 5MB image to ~10KB, 
      // completely eliminating network bottleneck when calling the HF API.
      const aiBuffer = await sharp(imageBuffer)
        .resize(224, 224, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      const blob = new Blob([new Uint8Array(aiBuffer)], { type: 'image/jpeg' });

      // We use a robust general-purpose Vision Transformer model
      const result = await this.hf.imageClassification({
        data: blob,
        model: 'google/vit-base-patch16-224',
        provider: 'hf-inference' // Explicitly set provider to silence the "auto" warning log
      });

      return result.map((r: any) => ({ label: r.label, score: r.score }));
    } catch (error: any) {
      console.error('[VisionProvider] Classification failed:', error);
      throw new AppError('Failed to classify image', 500);
    }
  }
}

export const visionProvider = new VisionProvider();
