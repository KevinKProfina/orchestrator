import fs from 'node:fs/promises';
import path from 'node:path';
import { readConfig } from './config.js';
import { computeHealthScore, shouldPauseStrategy, overallRiskScore } from './health.js';
import { allocateCapital, calculatePortfolioState } from './allocator.js';
import { calculateReinvestment, shouldReinvest } from './reinvestment.js';
import type { StrategySnapshot } from './types.js';

async function ensureFile(filePath: string, fallback: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
  }
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  await ensureFile(filePath, fallback);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

async function runCycle() {
  const config = readConfig();
  const strategyPath = config.strategyHealthPath;
  const allocationPath = config.allocationPath;
  const portfolioPath = config.portfolioStatePath;

  const strategies = await readJson<StrategySnapshot[]>(strategyPath, [
    {
      name: 'solana-trader',
      status: 'active',
      capital: 2000,
      totalReturn: 0.18,
      winRate: 0.68,
      avgProfit: 0.08,
      drawdown: 0.12,
      healthScore: 82,
      lastUpdated: new Date().toISOString(),
    },
    {
      name: 'liquidation-hunter',
      status: 'active',
      capital: 1800,
      totalReturn: 0.24,
      winRate: 0.8,
      avgProfit: 0.12,
      drawdown: 0.08,
      healthScore: 88,
      lastUpdated: new Date().toISOString(),
    },
    {
      name: 'arbitrage-bot',
      status: 'paused',
      capital: 500,
      totalReturn: 0.02,
      winRate: 0.5,
      avgProfit: 0.03,
      drawdown: 0.22,
      healthScore: 48,
      lastUpdated: new Date().toISOString(),
    },
  ]);

  const overallRisk = overallRiskScore(strategies);
  const paused = strategies.filter((s) => shouldPauseStrategy(s, config.minHealthScore));

  for (const strategy of paused) {
    console.log(`Pause: ${strategy.name} due to health gate`);
    strategy.status = 'paused';
  }

  const allocations = allocateCapital(strategies, config.totalCapital, config.riskProfile);
  const state = calculatePortfolioState(strategies, config.totalCapital, config.maxPortfolioDrawdown, config.maxStrategyExposure);
  const portfolioDrawdown = state.drawdown;

  const netProfit = 250;
  if (shouldReinvest(netProfit, config.totalCapital, portfolioDrawdown, config.maxPortfolioDrawdown)) {
    const reinvestment = calculateReinvestment(strategies, netProfit, config.reinvestmentPercent, config.minHealthScore);
    for (const item of reinvestment) {
      console.log(`Reinvest: ${item.strategy} +$${item.amount.toFixed(2)}`);
    }
  }

  console.log(`Portfolio risk: ${overallRisk.toFixed(2)}`);
  console.log(`Portfolio drawdown: ${portfolioDrawdown.toFixed(2)}`);
  console.log('Allocations:');
  for (const [name, amount] of Object.entries(allocations)) {
    console.log(`- ${name}: $${amount.toFixed(2)}`);
  }

  await writeJson(allocationPath, allocations);
  await writeJson(portfolioPath, state);

  const interval = config.pollIntervalMs;
  console.log(`Next cycle in ${interval} ms\n`);
  if (process.argv.includes('--once')) {
    return;
  }
  setTimeout(runCycle, interval);
}

await runCycle();
