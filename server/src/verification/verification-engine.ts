import { PipelineExecutor } from './pipeline-executor';
import { DecisionEngine } from './decision-engine';
import { VerificationContext } from './types';
import { Product } from '../db/models';
import { ImageIntegrityAnalyzer } from './analyzers/image-integrity.analyzer';
import { ContactDetectionAnalyzer } from './analyzers/contact-detection.analyzer';
import { ProductClassificationAnalyzer } from './analyzers/product-classification.analyzer';
import { BusinessAnalyzer } from './analyzers/business.analyzer';

export class VerificationEngine {
  private pipeline: PipelineExecutor;
  private decisionEngine: DecisionEngine;

  constructor() {
    this.pipeline = new PipelineExecutor();
    this.decisionEngine = new DecisionEngine();
    
    // Register Analyzers
    this.pipeline.registerAnalyzer(new ImageIntegrityAnalyzer());
    this.pipeline.registerAnalyzer(new ContactDetectionAnalyzer());
    this.pipeline.registerAnalyzer(new ProductClassificationAnalyzer());
    this.pipeline.registerAnalyzer(new BusinessAnalyzer());
  }

  async executeVerification(context: VerificationContext) {
    try {
      console.log(`[VerificationEngine] Starting full verification for Product ${context.productId}`);
      
      // 1. Run Pipeline (Concurrent Analyzers)
      const pipelineResults = await this.pipeline.execute(context);

      // 2. Aggregate Results via Decision Engine
      const finalDecision = await this.decisionEngine.evaluate(context.productId, pipelineResults);
      
      console.log(`[VerificationEngine] Product ${context.productId} resulted in: ${finalDecision.overallStatus}`);
      
      // Update the product status itself based on the decision
      const product = await Product.findByPk(context.productId);
      if (product) {
        const newStatus = finalDecision.overallStatus === 'PASSED' ? 'ACTIVE' : 'REJECTED';
        await product.update({ status: newStatus });
      }

      return finalDecision;
    } catch (error) {
      console.error('[VerificationEngine] Critical engine failure', error);
      throw error;
    }
  }
}

export const verificationEngine = new VerificationEngine();
