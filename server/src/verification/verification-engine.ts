import { PipelineExecutor } from './pipeline-executor';
import { DecisionEngine } from './decision-engine';
import { VerificationContext } from './types';
import { Product } from '../db/models';

export class VerificationEngine {
  private pipeline: PipelineExecutor;
  private decisionEngine: DecisionEngine;

  constructor() {
    this.pipeline = new PipelineExecutor();
    this.decisionEngine = new DecisionEngine();
    
    // Phase 3-5 Analyzers will be registered here
  }

  async executeVerification(context: VerificationContext) {
    try {
      console.log(`[VerificationEngine] Initiating pipeline for product ${context.productId}`);
      
      const results = await this.pipeline.execute(context);
      const decision = await this.decisionEngine.processResults(context.productId, results);

      // Update product status based on decision
      const product = await Product.findByPk(context.productId);
      if (product) {
        await product.update({ status: decision.passed ? 'ACTIVE' : 'REJECTED' });
        console.log(`[VerificationEngine] Product ${context.productId} marked as ${product.status}`);
      }

      return decision;
    } catch (error) {
      console.error('[VerificationEngine] Critical engine failure', error);
      throw error;
    }
  }
}

export const verificationEngine = new VerificationEngine();
