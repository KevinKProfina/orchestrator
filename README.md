# Orchestrator

The orchestrator is the master control layer that coordinates all strategy engines, capital allocation, health checks, and reinvestment loops.

## Goal

The orchestrator turns a collection of isolated strategies into a single adaptive capital system:

- monitor strategy health
- evaluate risk
- rebalance capital
- pause weak strategies
- reinvest only healthy profit
- keep the portfolio resilient under drawdown

## Architecture

```text
Strategy Engines
  ├─ solana-trader
  ├─ liquidation-hunter
  ├─ arbitrage-bot
  └─ other risk-aware modules
          │
          ▼
  Strategy Health + Metrics
          │
          ▼
  Orchestrator
  ├─ score strategy quality
  ├─ compute portfolio risk
  ├─ rebalance allocations
  ├─ pause weak strategies
  ├─ reinvest profits into strong strategies
  └─ write portfolio state snapshot
```

## Responsibilities

### 1. Portfolio health
The orchestrator keeps track of:

- total capital
- allocated capital
- free capital
- active strategies
- total drawdown
- max strategy exposure
- health score
- reinvestment opportunity

### 2. Strategy health
Each strategy reports:

- name
- status
- capital
- totalReturn
- winRate
- avgProfit
- drawdown
- healthScore
- lastUpdated

### 3. Capital allocation
The orchestrator uses:

- strategy score
- strategy risk
- capital efficiency
- drawdown exposure
- diversification

### 4. Risk controls
The orchestrator will:

- pause any strategy with poor health
- cap portfolio drawdown
- cap max exposure per strategy
- reduce capital to failed strategies
- block new allocations if risk is too high

### 5. Reinvestment loop
Healthy strategies receive profits automatically. The orchestrator keeps a reserve and only reinvests the safe portion of net profit.

## Core files

- `src/types.ts` — shared domain types
- `src/config.ts` — environment configuration
- `src/health.ts` — health scoring and kill switches
- `src/scoring.ts` — strategy quality scoring and portfolio risk calculation
- `src/allocator.ts` — capital allocation logic
- `src/reinvestment.ts` — profit distribution and reinvestment
- `src/orchestrator.ts` — main runtime loop
- `src/index.ts` — execution entrypoint

## Key environment variables

```bash
TOTAL_CAPITAL=5000
MAX_PORTFOLIO_DRAWDOWN=0.25
MAX_STRATEGY_EXPOSURE=0.55
MIN_HEALTH_SCORE=55
STRATEGY_HEALTH_PATH=.state/strategy-health.json
ALLOCATION_PATH=.state/allocations.json
PORTFOLIO_STATE_PATH=.state/portfolio-state.json
REINVESTMENT_PERCENT=0.6
POLL_INTERVAL_MS=60000
```

## Operational loop

Pseudo-flow:

1. Load strategy health snapshot
2. Evaluate each strategy
3. Compute overall portfolio risk
4. Apply kill-switch conditions
5. Allocate capital
6. Rebalance if needed
7. Reinvest profit to strong strategies
8. Persist state snapshot
9. Wait for next cycle

## Long-term target

This layer is what turns multiple strategies into one adaptive, self-optimizing capital engine. Once this system is in place, the next evolution is the agent marketplace and revenue-sharing layer.
