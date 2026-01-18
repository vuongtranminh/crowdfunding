# ===============================
# Config
# ===============================

RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337

# Lấy PRIVATE_KEY từ env
# export PRIVATE_KEY=0x....
PRIVATE_KEY?=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

SCRIPT=script/Crowdfunding.s.sol:CrowdfundingScript

# ===============================
# Helpers
# ===============================

check-key:
	@if [ -z "$(PRIVATE_KEY)" ]; then \
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

deploy: check-key
	forge script $(SCRIPT) \
		--rpc-url $(RPC_URL) \
		--chain-id $(CHAIN_ID) \
		--broadcast \
		--private-key $(PRIVATE_KEY) \
		-vvv

# ===============================
# Deploy + verify address
# ===============================

deploy-trace: check-key
	forge script $(SCRIPT) \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--private-key $(PRIVATE_KEY) \
		--slow \
		--verbosity 4

# ===============================
# Utilities
# ===============================

accounts:
	cast wallet list

balance:
	cast balance $(ADDRESS) --rpc-url $(RPC_URL)

