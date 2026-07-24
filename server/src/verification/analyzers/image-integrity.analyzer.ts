import sharp from 'sharp';
import { Analyzer, VerificationContext, AnalyzerResult } from '../types';
import { ProductImage } from '../../db/models';
import { Op } from 'sequelize';

export class ImageIntegrityAnalyzer implements Analyzer {
  name = 'ImageIntegrityAnalyzer';

  async execute(context: VerificationContext): Promise<AnalyzerResult> {
    if (!context.imageBuffer) {
      return {
        moduleName: this.name,
        passed: false,
        status: 'ERROR',
        reason: 'No image buffer provided for analysis',
      };
    }

    try {
      // 1. Basic Validation & Dimensions
      const metadata = await sharp(context.imageBuffer).metadata();
      if (!metadata.width || !metadata.height) {
        return {
          moduleName: this.name,
          passed: false,
          status: 'FAILED',
          reason: 'Corrupt or invalid image data',
        };
      }

      if (metadata.width < 500 || metadata.height < 500) {
        return {
          moduleName: this.name,
          passed: false,
          status: 'FAILED',
          reason: `Resolution too low (${metadata.width}x${metadata.height}). Minimum is 500x500.`,
        };
      }

      // 2. Generate aHash (Average Hash) for perceptual hashing
      // Resize to 8x8, convert to grayscale
      const buffer = await sharp(context.imageBuffer)
        .resize(8, 8, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer();
      
      const data = new Uint8Array(buffer);

      // Calculate average pixel intensity
      const total = data.reduce((sum: number, val: number) => sum + val, 0);
      const average = total / 64;

      // Generate 64-bit binary string
      let pHashBinary = '';
      for (let i = 0; i < 64; i++) {
        pHashBinary += data[i]! >= average ? '1' : '0';
      }

      // Convert binary string to hexadecimal for storage
      const pHashHex = BigInt('0b' + pHashBinary).toString(16).padStart(16, '0');

      // Update the current ProductImage with its pHash
      await ProductImage.update(
        { pHash: pHashHex },
        { where: { id: context.productImageId } }
      );

      // 3. Duplicate Detection (Strict exact match)
      const duplicateCount = await ProductImage.count({
        where: {
          pHash: pHashHex,
          id: { [Op.ne]: context.productImageId } // Exclude current image
        }
      });

      if (duplicateCount > 0) {
        return {
          moduleName: this.name,
          passed: false,
          status: 'FAILED',
          reason: 'Duplicate listing detected based on perceptual hash',
          metadata: { duplicateCount, pHash: pHashHex }
        };
      }

      return {
        moduleName: this.name,
        passed: true,
        status: 'PASSED',
        reason: 'Image integrity verified',
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          pHash: pHashHex
        }
      };

    } catch (error: any) {
      console.error('[ImageIntegrityAnalyzer] Error:', error);
      return {
        moduleName: this.name,
        passed: false,
        status: 'ERROR',
        reason: `Integrity check failed: ${error.message}`,
      };
    }
  }
}
