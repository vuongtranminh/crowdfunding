# ===============================
# Config
# ===============================

RPC_LOCAL=http://127.0.0.1:8545
CHAIN_ID_LOCAL=31337

RPC_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/igxy1deVF5dLeQ1QDtS8c
CHAIN_ID_SEPOLIA=11155111

ETHERSCAN_API_KEY=2TEA27KC9HBQQM6V78Z7A8WGY7P1TVNF9K

# Lấy PRIVATE_KEY từ env
# export PRIVATE_KEY=0x....
PRIVATE_KEY_LOCAL?=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
PRIVATE_KEY_SEPOLIA?=a1b1ac519267be79717a52e061bb3154119fc97ca993770241e9dbd47ac6ed4e

SCRIPT=script/Crowdfunding.s.sol:CrowdfundingScript

# ===============================
# Helpers
# ===============================

check-key-local:
	@if [ -z "$(PRIVATE_KEY_LOCAL)" ]; then \
		echo "❌ PRIVATE_KEY is not set"; \
		echo "👉 Run: export PRIVATE_KEY=0xYOUR_ANVIL_PRIVATE_KEY"; \
		exit 1; \
	fi

check-key-sepolia:
	@if [ -z "$(PRIVATE_KEY_SEPOLIA)" ]; then \
		echo "❌ PRIVATE_KEY is not set"; \
		echo "👉 Run: export PRIVATE_KEY=0xYOUR_ANVIL_PRIVATE_KEY"; \
		exit 1; \
	fi

# ===============================
# Anvil
# ===============================

anvil:
	anvil

# ===============================
# Build / Test
# ===============================

build:
	forge build

test:
	forge test -vv

clean:
	forge clean

# ===============================
# Deploy
# ===============================

deploy-local: check-key-local
	forge script $(SCRIPT) \
		--rpc-url $(RPC_LOCAL) \
		--chain-id $(CHAIN_ID_LOCAL) \
		--broadcast \
		--private-key $(PRIVATE_KEY_LOCAL) \
		-vvv

# ===============================
# Deploy + verify address
# ===============================

deploy-sepolia: check-key-sepolia
	forge script $(SCRIPT) \
		--rpc-url $(RPC_SEPOLIA) \
		--chain-id $(CHAIN_ID_SEPOLIA) \
		--broadcast \
		--private-key $(PRIVATE_KEY_SEPOLIA) \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvv

# ===============================
# Utilities
# ===============================

accounts:
	cast wallet list

balance:
	cast balance $(ADDRESS) --rpc-url $(RPC_URL)


balance-sepolia:
	cast balance $(ADDRESS) --rpc-url $(RPC_SEPOLIA)

