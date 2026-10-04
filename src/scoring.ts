import type { StrategySnapshot, AllocationDecision } from './types.js';
import { computeHealthScore } from './health.js';

export function strategyWeight(strategy: StrategySnapshot): number {
  const health = computeHealthScore(strategy);
  const winWeight = strategy.winRate * 100;
  const returnWeight = strategy.totalReturn * 100;
  const drawdownPenalty = strategy.drawdown * 100;
  return health + winWeight + returnWeight - drawdownPenalty;
}

export function evaluateStrategies(strategies: StrategySnapshot[], riskProfile: 'conservative' | 'moderate' | 'aggressive'): AllocationDecision[] {
  const riskFactors = {
    conservative: 0.8,
    moderate: 1,
    aggressive: 1.2,
  };

  const factor = riskFactors[riskProfile];

  return strategies.map((strategy) => {
    const score = strategyWeight(strategy) * factor;
    const base = strategy.capital;
    const target = Math.max(0, score * 10);

    let action: AllocationDecision['action'] = 'hold';
    let reason = 'stable';

    if (target > base * 1.2) {
      action = 'increase';
      reason = 'strong performance';
    } else if (target < base * 0.8) {
      action = 'decrease';
      reason = 'underperformance';
    } else if (computeHealthScore(strategy) < 55 || strategy.status === 'failed') {
      action = 'pause';
      reason = 'health gate failed';
    }

    return {
      strategy: strategy.name,
      targetCapital: target,
      reason,
      action,
      riskAdjustment: strategy.drawdown,
      confidence: Math.max(0, Math.min(1, score / 200)),
    };
  });
}
