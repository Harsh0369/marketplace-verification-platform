export interface VerificationContext {
  productId: string;
  userId: string;
  imageUrl: string;
  imageBuffer?: Buffer; 
}

export interface AnalyzerResult {
  moduleName: string;
  passed: boolean;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  reason?: string;
  confidence?: number;
  metadata?: any;
}

export interface Analyzer {
  name: string;
  execute(context: VerificationContext): Promise<AnalyzerResult>;
}

export interface Provider {
  name: string;
}
