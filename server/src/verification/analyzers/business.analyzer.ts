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
      
      const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      
      const hasPhone = phoneRegex.test(textToAnalyze);
      const hasEmail = emailRegex.test(textToAnalyze);

      if (foundSpam.length > 0 || hasPhone || hasEmail) {
        const violations = [];
        if (foundSpam.length > 0) violations.push(`Prohibited keywords (${foundSpam.join(', ')})`);
        if (hasPhone) violations.push('Phone number detected');
        if (hasEmail) violations.push('Email detected');

        return {
          moduleName: this.name,
          passed: false,
          status: 'FAILED',
          reason: `Policy violation: ${violations.join('; ')}`
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
