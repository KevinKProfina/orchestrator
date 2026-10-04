import type { StrategySnapshot, AllocationDecision, PortfolioState } from './types.js';
import { evaluateStrategies } from './scoring.js';

export function allocateCapital(
  strategies: StrategySnapshot[],
  totalCapital: number,
  riskProfile: 'conservative' | 'moderate' | 'aggressive',
): Record<string, number> {
  const decisions = evaluateStrategies(strategies, riskProfile);
  const sum = decisions.reduce((acc, decision) => acc + Math.max(0, decision.targetCapital), 0) || 1;

  const allocations: Record<string, number> = {};
  for (const decision of decisions) {
    const proportion = Math.max(0, decision.targetCapital) / sum;
    allocations[decision.strategy] = totalCapital * proportion;
  }

  return allocations;
}

export function calculatePortfolioState(
  strategies: StrategySnapshot[],
  totalCapital: number,
  maxPortfolioDrawdown: number,
  maxStrategyExposure: number,
): PortfolioState {
  const active = strategies.filter((s) => s.status === 'active');
  const paused = strategies.filter((s) => s.status !== 'active').map((s) => s.name);
  const allocatedCapital = active.reduce((sum, strategy) => sum + strategy.capital, 0);
  const freeCapital = Math.max(0, totalCapital - allocatedCapital);
  const totalExposure = active.reduce((sum, strategy) => sum + Math.min(strategy.capital / totalCapital, maxStrategyExposure), 0);
  const portfolioReturn = active.reduce((sum, strategy) => sum + strategy.totalReturn, 0) / Math.max(active.length, 1);
  const drawdown = Math.max(...active.map((s) => s.drawdown), 0);

  return {
    totalCapital,
    freeCapital,
    allocatedCapital,
    totalExposure,
    activeStrategies: active.map((s) => s.name),
    pausedStrategies: paused,
    portfolioReturn,
    riskScore: drawdown > maxPortfolioDrawdown ? 100 : Math.min(100, drawdown * 100 + totalExposure * 25),
    drawdown,
    timestamp: new Date().toISOString(),
  };
}

export function decideRebalances(
  strategies: StrategySnapshot[],
  allocations: Record<string, number>,
  totalCapital: number,
): AllocationDecision[] {
  const decisions = evaluateStrategies(strategies, 'moderate');
  return decisions.map((decision) => {
    const current = allocations[decision.strategy] ?? 0;
    const delta = decision.targetCapital - current;
    const changePct = current === 0 ? 0 : (delta / current) * 100;

    return {
      ...decision,
      targetCapital: Math.min(totalCapital, Math.max(0, decision.targetCapital)),
      reason: changePct > 10 ? 'strong performance' : changePct < -10 ? 'underperformance' : 'stable',
    };
  });
}
