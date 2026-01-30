# 🎬 Cult Film Curtis

> A movie-loving connoisseur that provides cult film recommendations for a small USDC payment.

Curtis is an x402 payment-enabled agent built on the Daydreams stack. Pay 0.01 USDC on Base and receive a curated cult movie recommendation, weighted by what's currently being discussed in film circles.

## Features

- **20+ Cult Films**: Hand-curated database from The Room to Eraserhead
- **Discourse Weighting**: Recommendations favor films currently in conversation
- **x402 Payments**: Micropayments via Base mainnet USDC
- **Production Ready**: Full error handling, CORS, health checks

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime
- Ethereum wallet with private key
- xGate account (optional, for facilitator)

### Installation

```bash
# Clone or download the project
cd cult-film-curtis-agent

# Install dependencies
bun install

# Configure environment
cp .env.example .env
```

### Configuration

Edit `.env` with your values:

```env
PORT=8090
EVM_PRIVATE_KEY=0x_your_private_key_here
EVM_RPC_URL=https://mainnet.base.org
```

⚠️ **Never commit your `.env` file or share your private key!**

### Running

```bash
# Development (with hot reload)
bun run dev

# Production
bun run start

# Run tests
bun run test
```

## Deployment

### Getting Your Server IP

```bash
# Get your public IP
curl ifconfig.me

# Or
curl ip.me
```

### Firewall Setup

```bash
# Allow your chosen port (example: 8090)
sudo ufw allow 8090

# Verify
sudo ufw status
```

### Choosing a Port

Default port is `8090`. To use a different port:

1. Check if port is available:
   ```bash
   sudo lsof -i :8090
   # No output = port is free
   ```

2. Update `.env`:
   ```env
   PORT=8091
   ```

3. Update firewall:
   ```bash
   sudo ufw allow 8091
   ```

### Running in Production

```bash
# Using screen (persists after SSH disconnect)
screen -S curtis
bun run start
# Press Ctrl+A then D to detach

# Using pm2
pm2 start "bun run start" --name curtis

# Using systemd (create service file)
sudo systemctl start curtis
```

### Testing External Access

```bash
# From another machine
curl http://YOUR_SERVER_IP:8090/health

# Expected response:
# {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

## API Reference

### GET `/`
Agent info and pricing.

**Response:**
```json
{
  "name": "Cult Film Curtis",
  "description": "...",
  "version": "1.0.0",
  "endpoints": {
    "main": {
      "path": "/cultmovieidea",
      "method": "POST",
      "price": { "amount": "0.01", "currency": "USDC", "network": "base" }
    }
  }
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-30T00:00:00.000Z",
  "version": "1.0.0"
}
```

### GET `/x402/supported`
Payment capabilities.

**Response:**
```json
{
  "supported": true,
  "version": "v2",
  "network": "base",
  "token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "schemes": ["exact"]
}
```

### POST `/x402/verify`
Verify a payment payload.

**Request:**
```json
{
  "payload": "<x402 payment payload>"
}
```

### POST `/x402/settle`
Settle a verified payment.

**Request:**
```json
{
  "payload": "<x402 payment payload>"
}
```

### POST `/cultmovieidea`
Get a cult film recommendation (requires payment).

**Headers:**
- `x402`: Payment payload from xGate

**Response (with valid payment):**
```json
{
  "recommendation": {
    "id": "the-room",
    "title": "The Room",
    "year": 2003,
    "director": "Tommy Wiseau",
    "genre": ["drama", "romance", "unintentional-comedy"],
    "runtime_min": 99,
    "rating": 3.9,
    "synopsis": "...",
    "why_cult": "...",
    "viewing_tips": "...",
    "availability": ["Amazon Prime", "Vudu", "YouTube"]
  },
  "metadata": {
    "source": "cult-film-curtis",
    "version": "1.0.0",
    "timestamp": "2025-01-30T00:00:00.000Z",
    "discourse_score": 9,
    "curator": "Curtis"
  },
  "payment": {
    "status": "settled",
    "amount": "0.01",
    "currency": "USDC",
    "transaction_hash": "0x..."
  }
}
```

**Response (without payment):**
```json
{
  "error": "Payment Required",
  "code": "PAYMENT_REQUIRED",
  "details": {
    "message": "This endpoint requires payment of 0.01 USDC",
    "price": "0.01",
    "currency": "USDC",
    "network": "base",
    "protocol": "x402"
  }
}
```

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :8090

# Kill it (if safe to do so)
kill -9 <PID>

# Or choose a different port in .env
```

### Connection Refused from External

1. Check firewall: `sudo ufw status`
2. Verify the app is running: `curl localhost:8090/health`
3. Check if port is open: `sudo netstat -tlnp | grep 8090`
4. Check cloud firewall (AWS Security Groups, etc.)

### Private Key Issues

- Ensure key starts with `0x`
- Check for extra spaces or newlines
- Verify wallet has Base ETH for gas

### Payment Not Working

1. Verify xGate MCP URL is correct
2. Check wallet has sufficient USDC
3. Ensure you're on Base mainnet (chain ID 8453)
4. Check facilitator logs for errors

## Film Catalog

Curtis knows 20+ cult classics including:

| Film | Year | Director | Discourse Score |
|------|------|----------|-----------------|
| The Room | 2003 | Tommy Wiseau | 9/10 |
| Eraserhead | 1977 | David Lynch | 8/10 |
| Videodrome | 1983 | David Cronenberg | 9/10 |
| Mandy | 2018 | Panos Cosmatos | 9/10 |
| Hausu | 1977 | Nobuhiko Obayashi | 8/10 |
| ... and more! | | | |

## License

MIT

## Credits

Built with:
- [Elysia](https://elysiajs.com/) - Fast Bun web framework
- [Bun](https://bun.sh/) - JavaScript runtime
- [@daydreamsai/facilitator](https://github.com/daydreamsai) - x402 payment facilitation
- [viem](https://viem.sh/) - Ethereum interactions
