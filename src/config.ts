import 'dotenv/config';

export type OrchestratorEnv = {
  totalCapital: number;
  maxPortfolioDrawdown: number;
  maxStrategyExposure: number;
  minHealthScore: number;
  strategyHealthPath: string;
  allocationPath: string;
  portfolioStatePath: string;
  reinvestmentPercent: number;
  pollIntervalMs: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
};

export function readConfig(): OrchestratorEnv {
  return {
    totalCapital: Number(process.env.TOTAL_CAPITAL ?? '5000'),
    maxPortfolioDrawdown: Number(process.env.MAX_PORTFOLIO_DRAWDOWN ?? '0.25'),
    maxStrategyExposure: Number(process.env.MAX_STRATEGY_EXPOSURE ?? '0.55'),
    minHealthScore: Number(process.env.MIN_HEALTH_SCORE ?? '55'),
    strategyHealthPath: process.env.STRATEGY_HEALTH_PATH ?? '.state/strategy-health.json',
    allocationPath: process.env.ALLOCATION_PATH ?? '.state/allocations.json',
    portfolioStatePath: process.env.PORTFOLIO_STATE_PATH ?? '.state/portfolio-state.json',
    reinvestmentPercent: Number(process.env.REINVESTMENT_PERCENT ?? '0.6'),
    pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? '60000'),
    riskProfile: (process.env.RISK_PROFILE as 'conservative' | 'moderate' | 'aggressive') ?? 'moderate',
  };
}
