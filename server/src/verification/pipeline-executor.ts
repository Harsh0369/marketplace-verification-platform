import { Analyzer, VerificationContext, AnalyzerResult } from './types';

export class PipelineExecutor {
  private analyzers: Analyzer[] = [];

  registerAnalyzer(analyzer: Analyzer) {
    this.analyzers.push(analyzer);
  }

  async execute(context: VerificationContext): Promise<AnalyzerResult[]> {
    console.log(`[Pipeline] Starting verification for product ${context.productId}`);
    
    // Execute all registered analyzers concurrently
    const promises = this.analyzers.map(async (analyzer) => {
      try {
        console.log(`[Pipeline] Executing analyzer: ${analyzer.name}`);
        return await analyzer.execute(context);
      } catch (error: any) {
        console.error(`[Pipeline] Analyzer ${analyzer.name} failed with error:`, error);
        return {
          moduleName: analyzer.name,
          passed: false,
          status: 'ERROR',
          reason: `Internal failure: ${error.message}`
        } as AnalyzerResult;
      }
    });

    return await Promise.all(promises);
  }
}
