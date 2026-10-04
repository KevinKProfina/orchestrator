import type { StrategySnapshot } from './types.js';

export function computeHealthScore(strategy: StrategySnapshot): number {
  let score = 0;

  if (strategy.totalReturn > 0.25) score += 35;
  else if (strategy.totalReturn > 0.1) score += 20;
  else if (strategy.totalReturn > 0.02) score += 10;

  if (strategy.winRate > 0.7) score += 25;
  else if (strategy.winRate > 0.55) score += 15;
  else if (strategy.winRate > 0.45) score += 8;

  if (strategy.drawdown < 0.15) score += 20;
  else if (strategy.drawdown < 0.25) score += 10;
  else if (strategy.drawdown < 0.35) score -= 10;

  if (strategy.status === 'failed') score = 0;
  if (strategy.status === 'paused') score *= 0.5;

  return Math.max(0, Math.min(100, score));
}

export function overallRiskScore(strategies: StrategySnapshot[]): number {
  if (strategies.length === 0) return 0;

  const drawdownAvg = strategies.reduce((sum, s) => sum + s.drawdown, 0) / strategies.length;
  const healthAvg = strategies.reduce((sum, s) => sum + computeHealthScore(s), 0) / strategies.length;
  return Math.max(0, Math.min(100, (drawdownAvg * 100) + (100 - healthAvg)));
}

export function shouldPauseStrategy(strategy: StrategySnapshot, minHealthScore: number): boolean {
  const currentScore = computeHealthScore(strategy);
  return currentScore < minHealthScore || strategy.status === 'failed';
}

export function shouldReduceExposure(strategy: StrategySnapshot): boolean {
  return strategy.drawdown > 0.3 || strategy.totalReturn < -0.05;
}
