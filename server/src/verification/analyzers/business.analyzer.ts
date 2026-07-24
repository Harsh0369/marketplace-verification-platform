import { Analyzer, VerificationContext, AnalyzerResult } from '../types';
import { Product } from '../../db/models';

export class BusinessAnalyzer implements Analyzer {
  name = 'BusinessAnalyzer';

  async execute(context: VerificationContext): Promise<AnalyzerResult> {
    try {
      const product = await Product.findByPk(context.productId);
      if (!product) {
        return { moduleName: this.name, passed: false, status: 'ERROR', reason: 'Product not found in database' };
      }

      // Concatenate title and description for keyword scanning
      const textToAnalyze = `${product.title} ${product.description}`.toLowerCase();
      
      // Typical spam / scam / off-platform transaction keywords
      const spamKeywords = [
        'whatsapp me', 'cash app', 'buy directly', 'wire transfer', 
        'venmo', 'zelle', 'fake', 'replica', 'copy', '1:1 quality'
      ];
      
      const foundSpam = spamKeywords.filter(keyword => textToAnalyze.includes(keyword));

      if (foundSpam.length > 0) {
        return {
          moduleName: this.name,
          passed: false,
          status: 'FAILED',
          reason: `Policy violation: Prohibited keywords detected in listing (${foundSpam.join(', ')})`
        };
      }

      return { 
        moduleName: this.name, 
        passed: true, 
        status: 'PASSED', 
        reason: 'Business rules passed' 
      };
    } catch (error: any) {
      console.error('[BusinessAnalyzer] Error:', error);
      return { 
        moduleName: this.name, 
        passed: false, 
        status: 'ERROR', 
        reason: `Business validation failed: ${error.message}` 
      };
    }
  }
}
