import type { StrategySnapshot, ReinvestmentPlan } from './types.js';
import { computeHealthScore } from './health.js';

export function calculateReinvestment(
  strategies: StrategySnapshot[],
  profitAmount: number,
  reinvestmentPercent: number,
  minHealthScore: number,
): ReinvestmentPlan[] {
  const eligible = strategies.filter((s) => s.status === 'active' && computeHealthScore(s) >= minHealthScore);
  const totalHealth = eligible.reduce((sum, s) => sum + computeHealthScore(s), 0) || 1;
  const reinvestment = profitAmount * reinvestmentPercent;

  return eligible.map((strategy) => ({
    strategy: strategy.name,
    amount: (computeHealthScore(strategy) / totalHealth) * reinvestment,
    reason: 'healthy performance qualifies for reinvestment',
  }));
}

export function shouldReinvest(
  profitAmount: number,
  totalCapital: number,
  portfolioDrawdown: number,
  maxPortfolioDrawdown: number,
): boolean {
  const netProfit = profitAmount > 0;
  const drawdownSafe = portfolioDrawdown < maxPortfolioDrawdown;
  return netProfit && drawdownSafe && totalCapital > 0;
}
