# Ajo — Consumer DeFi Savings Circles on Flow

> The oldest coordination primitive, rebuilt as an intuitive, trust-minimized financial app.

Ajo is a decentralized rotating savings circle (ROSCA/tontine) built on **Flow EVM Testnet**.  
It turns a community savings behavior people already understand into a modern on-chain experience with real-time visibility, automated round logic, and strong default handling.

---

## Why this project is strong for Consumer DeFi

Consumer DeFi should feel like everyday finance: simple, reliable, and habit-forming.

Ajo is designed around exactly that:

- **Clear mental model:** users join a circle, contribute each round, and receive payouts in rotation.
- **Automation-first behavior:** rounds auto-progress and payouts auto-trigger when contributions are complete.
- **Invisible coordination overhead:** no admin trust assumptions, no manual spreadsheet reconciliation.
- **Safety without complexity:** late fees + grace windows + defaulter resolution to keep circles healthy.
- **Accessible UX:** live status, countdown timers, contribution progress, and member visibility.

This is DeFi as a practical financial routine—not speculative complexity.

---

## Alignment with the Flow Consumer DeFi Challenge

### 1) Intuitive UX over crypto jargon
- Human-readable circle model (contribution, round duration, members)
- Guided create/join/track workflow in the frontend
- Real-time dashboard for round state and next recipient

### 2) Automation and reliability
- Auto-start when a circle fills
- Auto-payout when required contributions are complete
- `resolveLateRound()` to recover stalled rounds after grace period

### 3) Security that stays in the background
- Reentrancy protection on critical external functions
- Recipient-exempt contribution model (recipient does not pay in own round)
- Defaulter removal after grace period to protect active participants

### 4) Built for high-volume user-facing apps on Flow
- Deployed on **Flow EVM Testnet**
- EVM-native Solidity stack for fast builder iteration
- Frontend architecture prepared for frequent state updates

### Example: Flow is seamless for EVM builders (not only Cadence)

Ajo is a practical example of this:

- We wrote the core protocol in **Solidity** (`contracts/Ajo.sol`), tested with **Hardhat**, and deployed to **Flow EVM Testnet**.
- The frontend uses standard EVM tooling (**wagmi + viem**) exactly like an Ethereum-style app.
- Users connect with MetaMask to Flow RPC (`chainId 545`) and interact with the contract with no Cadence-specific setup required.

This shows Flow is not limited to Cadence-only development paths. Teams can ship consumer DeFi quickly with familiar EVM workflows, while still having the option to expand into Cadence-based capabilities when needed.

---

## Core Features

- Create a savings circle with:
	- fixed contribution amount
	- round duration
	- maximum members
- Join existing circles
- Automatic status transitions: Open → Active → Completed
- Round-by-round rotating payouts
- Late fee mechanics for delayed contributions
- Grace-period-based defaulter resolution
- Recipient exemption in their payout round
- Real-time frontend polling and round countdown

---

## Smart Contract Highlights

`contracts/Ajo.sol` includes:

- Circle lifecycle management
- Per-round accounting (`roundCollected`)
- Late fee configuration (`LATE_FEE_BPS`)
- Grace period enforcement (`GRACE_PERIOD`)
- Recovery function for stalled rounds (`resolveLateRound`)
- Recipient-aware contribution rules

Test coverage validates circle creation, payouts, round advancement, late fee behavior, and defaulter handling.

---

## Live Deployment

- **Network:** Flow EVM Testnet
- **Contract:** `0x8a1515Bce4Fb424343E8187959dF197cB33Fc1b9`
- **Explorer:** https://evm-testnet.flowscan.io
- **RPC:** https://testnet.evm.nodes.onflow.org
- **Chain ID:** 545

---

## Project Structure

- `contracts/` — Solidity smart contracts
- `test/` — Hardhat test suite
- `deploy/` — deployment scripts
- `frontend/` — React + Vite dApp UI

---

## Tech Stack

- Solidity `^0.8.24`
- Hardhat
- OpenZeppelin
- React + Vite + TypeScript
- wagmi + viem
- Three.js / React Three Fiber (UI experience layer)
- Framer Motion (interaction + motion)

---

## Quick Start

### Prerequisites
- Node.js v20 LTS
- MetaMask (or compatible EVM wallet)
- Flow EVM Testnet FLOW (for gas)

### Install and run

```bash
# install root deps
npm install

# compile contracts
npm run build

# run tests
npm test

# run frontend/dev stack
npm run dev
```

### Environment

Root `.env`:

```bash
PRIVATE_KEY=0x... 
VITE_RPC_URL=https://testnet.evm.nodes.onflow.org
```

`frontend/.env`:

```bash
VITE_CONTRACT_ADDRESS=0x8a1515Bce4Fb424343E8187959dF197cB33Fc1b9
VITE_RPC_URL=https://testnet.evm.nodes.onflow.org
```

---

## Hackathon Submission Checklist

- [ ] Summary
- [ ] Demo video
- [ ] GitHub repository
- [ ] Live demo
- [ ] Documentation

---

## Roadmap (Consumer DeFi Enhancements)

- Walletless onboarding (email/passkeys)
- Sponsored gas for first-time users
- Rule-based autopilot contributions
- Natural-language transaction intents
- Advanced trust scoring and reminders

---

## License

ISC
