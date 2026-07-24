import { Analyzer, VerificationContext, AnalyzerResult } from '../types';
import { ocrProvider } from '../../providers/ocr.provider';

export class ContactDetectionAnalyzer implements Analyzer {
  name = 'ContactDetectionAnalyzer';

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
      // Extract text from the image using OCR.space
      // Assuming a generic image/jpeg for the base64 conversion is safe for their engine
      const extractedText = await ocrProvider.extractText(context.imageBuffer, 'image/jpeg');
      
      if (!extractedText) {
        return {
          moduleName: this.name,
          passed: true,
          status: 'PASSED',
          reason: 'No text detected in image',
        };
      }

      // Regex patterns to detect prohibited contact info
      // Phone: Matches various formats, allowing for extra spaces often introduced by OCR
      const phoneRegex = /(?:\+?\d{1,3}[\s-]*)?(?:\(?\d{2,4}\)?[\s-]*)?\d{3,4}[\s-]*\d{3,4}(?:[\s-]*\d{1,4})?/g;
      
      // Secondary check: look for 10 digits in close proximity even with OCR artifacts mixed in (e.g., spaces, letter 'O')
      const denseDigitsRegex = /(?:\d[^\d]{0,2}){10,}/;
      
      // Email: Standard email validation
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      
      // Social Handle: basic @username check (ignoring single words that might be legitimate)
      const socialRegex = /@([a-zA-Z0-9_]{4,})/g;

      // Ensure we don't accidentally match on standard sizes or codes as phones
      // But for this strict MVP, we will flag it if it heavily resembles contact info
      const hasPhone = phoneRegex.test(extractedText) || denseDigitsRegex.test(extractedText);
      const hasEmail = emailRegex.test(extractedText);
      const hasSocial = socialRegex.test(extractedText);

      if (hasPhone || hasEmail || hasSocial) {
        const violations = [];
        if (hasPhone) violations.push('phone number');
        if (hasEmail) violations.push('email address');
        if (hasSocial) violations.push('social media handle');

        return {
          moduleName: this.name,
          passed: false,
          status: 'FAILED',
          reason: `Prohibited contact info detected: ${violations.join(', ')}`,
          metadata: { textSample: extractedText.substring(0, 100) } // Store a snippet for auditing
        };
      }

      return {
        moduleName: this.name,
        passed: true,
        status: 'PASSED',
        reason: 'No contact information detected in image',
      };
    } catch (error: any) {
      console.error('[ContactDetectionAnalyzer] Error:', error);
      return {
        moduleName: this.name,
        passed: false,
        status: 'ERROR',
        reason: `OCR extraction failed: ${error.message}`,
      };
    }
  }
}
