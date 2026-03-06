# Injective CLI Skill for Aab.Engineering

## Overview

Use the `injectived` binary to query and transact against the Injective chain with consistent wallet handling, endpoint selection, and gas configuration.

## Installation

```bash
npm i -g injective-core@latest
```

Or use directly: `npx injective-core --version`

## Configuration

### Endpoints

| Network | Endpoint | Chain ID |
|---------|----------|----------|
| **Mainnet** | `https://sentry.tm.injective.network:443` | `injective-1` |
| **Testnet** | `https://testnet.sentry.tm.injective.network:443` | `injective-888` |

### Keyring Setup

- **Default:** Passphrase-protected file keyring at `~/.injectived/`
- **Passphrase handling:**
  ```bash
  # Store passphrase (optional, opt-in)
  echo "your-passphrase" > ~/.injectived/keystore_password.txt
  chmod 600 ~/.injectived/keystore_password.txt
  
  # Use stored passphrase
  cat ~/.injectived/keystore_password.txt | injectived tx ... --yes
  ```

### Gas Configuration

```bash
--gas auto --gas-adjustment 1.5 --gas-prices 160000000inj
```

---

## Commands

### Query Commands

| Command | Description |
|---------|-------------|
| `injectived q bank balances <address>` | Check token balances |
| `injectived q account <address>` | Check account info |
| `injectived q auction auction-params` | Auction parameters |
| `injectived q exchange spot markets` | Spot markets |
| `injectived q oracle price <symbol>` | Oracle prices |

### Transaction Commands

| Command | Description |
|---------|-------------|
| `injectived tx bank send <from> <to> <amount> --yes` | Send tokens |
| `injectived tx exchange spot <subcmd>` | Spot trading |
| `injectived tx wasm execute <contract> <msg> --yes` | Execute contract |

### Key Management

| Command | Description |
|---------|-------------|
| `injectived keys list` | List wallets |
| `injectived keys add <name>` | Add new wallet |
| `injectived keys show <name>` | Show wallet address |

### Ledger Support

```bash
injectived tx bank send --ledger --sign-mode amino-ledger --chain-id injective-1 --gas auto --gas-prices 160000000inj --yes
```

---

## Integration with Aab.Engineering

### Injective Support in API

The API already supports Injective:

```javascript
// Get Injective rates
await rates.all('injective');

// Bridge to Injective
await bridge.quote('ethereum', 'injective', 'ETH', 'WETH', amount);

// Swap on Injective
await swap.quote('injective', 'INJ', 'USDT', amount);
```

### CLI Usage in Agents

```javascript
// Query balance
exec('injectived q bank balances inj1... --node https://sentry.tm.injective.network:443');

// Send transaction
exec('cat ~/.injectived/keystore_password.txt | injectived tx bank send <from> <to> 1000000inj --chain-id injective-1 --gas auto --gas-prices 160000000inj --yes');
```

---

## Common Use Cases

### 1. Check INJ Balance

```bash
injectived q bank balances $INJECTIVE_ADDRESS --node https://sentry.tm.injective.network:443
```

### 2. Send INJ

```bash
cat ~/.injectived/keystore_password.txt | injectived tx bank send \
  $FROM $TO 1000000inj \
  --chain-id injective-1 \
  --gas auto --gas-adjustment 1.5 --gas-prices 160000000inj \
  --yes
```

### 3. Query Spot Markets

```bash
injectived q exchange spot markets --node https://sentry.tm.injective.network:443
```

### 4. Execute WASM Contract

```bash
injectived tx wasm execute $CONTRACT '{"swap":{"token_in":"usdt","token_out":"inj"}}' \
  --amount 1000000 \
  --from $KEY_NAME \
  --chain-id injective-1 \
  --gas auto --yes
```

---

## Safety Notes

- **Never** share raw private keys in open channels
- **Use** `--keyring-backend file` (default) for security
- **Avoid** `--keyring-backend test` (unsafe, leaves keys exposed)
- **Keep** timeout 10s on keyring commands to prevent hangs
