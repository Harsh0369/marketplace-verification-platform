import { Analyzer, VerificationContext, AnalyzerResult } from '../types';
import { visionProvider } from '../../providers/vision.provider';
import { Product } from '../../db/models';

export class ProductClassificationAnalyzer implements Analyzer {
  name = 'ProductClassificationAnalyzer';

  async execute(context: VerificationContext): Promise<AnalyzerResult> {
    if (!context.imageBuffer) {
      return { moduleName: this.name, passed: false, status: 'ERROR', reason: 'No image buffer' };
    }

    try {
      // 1. Fetch the product to know its declared category
      const product = await Product.findByPk(context.productId);
      if (!product) {
        return { moduleName: this.name, passed: false, status: 'ERROR', reason: 'Product not found' };
      }

      // 2. Ask Vision Provider to classify
      const predictions = await visionProvider.classifyImage(context.imageBuffer);

      if (!predictions || predictions.length === 0) {
        return { 
          moduleName: this.name, 
          passed: false, 
          status: 'FAILED', 
          reason: 'Could not classify image contents' 
        };
      }

      // Top prediction
      const topPrediction = predictions[0]!;

      // Since we are using an ImageNet classifier (google/vit-base-patch16-224), 
      // the output will be highly specific (e.g. "miniskirt", "stole", "T-shirt").
      // For this engine, we will require the AI to be at least mildly confident (10%)
      // that this is a recognized object rather than random noise or a blank background.
      
      if (topPrediction.score < 0.1) {
         return {
           moduleName: this.name,
           passed: false,
           status: 'FAILED',
           reason: `Low confidence in product classification. Top AI guess: ${topPrediction.label} (${(topPrediction.score * 100).toFixed(1)}%). Image may not contain a clear product.`,
           metadata: { predictions: predictions.slice(0, 3) }
         };
      }

      return {
        moduleName: this.name,
        passed: true,
        status: 'PASSED',
        reason: `Product classification passed (Detected: ${topPrediction.label} - ${(topPrediction.score * 100).toFixed(1)}%)`,
        metadata: { predictions: predictions.slice(0, 3) }
      };

    } catch (error: any) {
      console.error('[ProductClassificationAnalyzer] Error:', error);
      return { 
        moduleName: this.name, 
        passed: false, 
        status: 'ERROR', 
        reason: error.message || 'Vision classification failed' 
      };
    }
  }
}
