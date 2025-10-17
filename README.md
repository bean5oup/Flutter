# Flutter ❤️

This project reuses frontend and backend components from Uniswap’s Autocater codebase to build a workers’ health survey system with EAS.

<img width="2220" height="1875" alt="image" src="https://github.com/user-attachments/assets/3658e1dd-3d68-44f0-9e7d-a32bd67e4d9f" />

## Deployment

### Attesters

| Network | Attester Name | Attester Address |
| --- | --- | --- |
| OP Sepolia | Flutter | [`0xDa6c22e078D1bE1C5c2DE44e84C93B5e34F93388`](https://sepolia-optimism.etherscan.io/address/0xda6c22e078d1be1c5c2de44e84c93b5e34f93388) |

### Schemas

| Network | Schema Content | Schema UID |
| --- | --- | --- |
| OP Sepolia | `bytes32 answer, uint256 timestamp, uint256 score` | [`0xc36b95afaab96f9462cea8071c5484d8c3677b0d76e0a6135dcc0dfdd3c15004`](https://optimism-sepolia.easscan.org/schema/view/0xc36b95afaab96f9462cea8071c5484d8c3677b0d76e0a6135dcc0dfdd3c15004) |


## Development

```bash
### Configuration & Installation ###
# 1. Clone this repo and enter cloned directory
git clone https://github.com/bean5oup/Flutter.git && cd Flutter

# 2. Copy example environment file (modify as needed)
cp .env.example .env

# 3. Install frontend and backend dependencies
pnpm install:all

### Usage ###
# Run both frontend and backend in development mode with hot reload
pnpm dev:all
```
