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
      
      const FASHION_KEYWORDS = [
        'shirt', 'skirt', 'pant', 'jean', 'suit', 'coat', 'jacket', 'dress', 'gown',
        'shoe', 'sneaker', 'boot', 'sandal', 'slipper', 'sock', 'hat', 'cap', 'beanie',
        'glove', 'scarf', 'tie', 'belt', 'bag', 'purse', 'wallet', 'backpack',
        'necklace', 'ring', 'bracelet', 'earring', 'watch', 'glass', 'sunglass',
        'sweater', 'hoodie', 'cardigan', 'vest', 'bra', 'underwear', 'swim',
        'bikini', 't-shirt', 'sweatshirt', 'cloak', 'abaya', 'jersey', 'poncho', 'bowtie',
        'kimono', 'maillot', 'sarong', 'sombrero', 'bandanna', 'stole', 'apparel', 
        'clothing', 'garment', 'attire', 'outfit', 'wear', 'accessories', 'fashion', 
        'jewelry', 'footwear', 'headwear', 'activewear', 'perfume', 'fragrance',
        'miniskirt', 'trench', 'sweatpants', 'leggings', 'blouse', 'tunic', 'tuxedo'
      ];

      // We strictly require that the #1 top prediction from the AI is a fashion item.
      // This prevents logos/memes that happen to contain a minor fashion element (like sunglasses) from passing.
      const isTopFashion = FASHION_KEYWORDS.some(keyword => 
        topPrediction.label.toLowerCase().includes(keyword)
      );

      if (!isTopFashion) {
         return {
           moduleName: this.name,
           passed: false,
           status: 'FAILED',
           reason: `Image does not appear to be a primary fashion product. AI classified it as: ${topPrediction.label}. We only accept images where clothing, footwear, or fashion accessories are the main subject.`,
           metadata: { predictions: predictions.slice(0, 3) }
         };
      }

      if (topPrediction.score < 0.15) {
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
