import { AnalyzerResult } from './types';
import { VerificationResult, VerificationLog } from '../db/models';

export class DecisionEngine {
  async processResults(productId: string, results: AnalyzerResult[]) {
    const failures = results.filter(r => !r.passed);
    const overallPassed = failures.length === 0;

    let overallReason = 'Passed all verification checks.';
    if (!overallPassed) {
      overallReason = failures.map(f => `${f.moduleName}: ${f.reason}`).join(' | ');
    }

    // Save to Database
    const verificationRecord = await VerificationResult.create({
      productId,
      overallStatus: overallPassed ? 'PASSED' : 'FAILED',
      confidence: 1.0, // Base value for now
    });

    const logPromises = results.map(result => {
      return VerificationLog.create({
        verificationId: verificationRecord.id,
        module: result.moduleName,
        status: result.status,
        confidence: result.confidence || 1.0,
        reason: result.reason || 'OK'
      });
    });

    await Promise.all(logPromises);

    return {
      passed: overallPassed,
      reason: overallReason,
      results
    };
  }
}
