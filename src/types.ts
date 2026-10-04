export type StrategyStatus = 'active' | 'paused' | 'failed';

export type StrategySnapshot = {
  name: string;
  status: StrategyStatus;
  capital: number;
  totalReturn: number;
  winRate: number;
  avgProfit: number;
  drawdown: number;
  healthScore: number;
  lastUpdated: string;
};

export type PortfolioState = {
  totalCapital: number;
  freeCapital: number;
  allocatedCapital: number;
  totalExposure: number;
  activeStrategies: string[];
  pausedStrategies: string[];
  portfolioReturn: number;
  riskScore: number;
  drawdown: number;
  timestamp: string;
};

export type AllocationDecision = {
  strategy: string;
  targetCapital: number;
  reason: string;
  action: 'increase' | 'decrease' | 'pause' | 'hold';
  riskAdjustment: number;
  confidence: number;
};

export type ReinvestmentPlan = {
  strategy: string;
  amount: number;
  reason: string;
};

export type OrchestratorConfig = {
  totalCapital: number;
  maxPortfolioDrawdown: number;
  maxStrategyExposure: number;
  minHealthScore: number;
  reinvestmentPercent: number;
  pollIntervalMs: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
};
