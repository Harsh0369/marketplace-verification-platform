import { AnalyzerResult } from './types';
import { VerificationResult } from '../db/models';

export class DecisionEngine {
  /**
   * Aggregates the results from all analyzers and generates the final decision.
   * Creates a VerificationResult record in the database.
   */
  async evaluate(productId: string, results: AnalyzerResult[]) {
    let overallStatus: 'PASSED' | 'FAILED' | 'PENDING' | 'MANUAL_REVIEW' = 'PASSED';
    const reasons: string[] = [];
    let confidence = 1.0;

    for (const result of results) {
      if (result.status === 'ERROR') {
        // If an API went down or an error occurred, we flag for manual review,
        // UNLESS the item was already FAILED by a deterministic rule.
        if (overallStatus !== 'FAILED') {
          overallStatus = 'MANUAL_REVIEW';
          confidence = 0.5; // Uncertain due to error
        }
        reasons.push(`[${result.moduleName} Error]: ${result.reason}`);
      } else if (result.status === 'FAILED') {
        // A FAILED status immediately ruins the listing. It overrides MANUAL_REVIEW.
        overallStatus = 'FAILED';
        confidence = 0.0;
        reasons.push(result.reason || 'Unknown failure reason');
      }
    }

    // Save the final decision to the database
    const verificationRecord = await VerificationResult.create({
      productId,
      overallStatus,
      confidence,
      reasons,
      verifiedAt: new Date()
    });

    return verificationRecord;
  }
}
