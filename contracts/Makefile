-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil slither aderyn

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

all: remove install build

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

install :; forge install foundry-rs/forge-std --no-commit && forge install openzeppelin/openzeppelin-contracts --no-commit && forge install smartcontractkit/chainlink --no-commit

# Update Dependencies
update:; forge update

build:; forge build

test :; forge test -vvv

coverage :; forge coverage

snapshot :; forge snapshot

format :; forge fmt

anvil :; anvil -m 'test test test test test test test test test test test junk' --steps-tracing --block-time 1

slither :; slither . --config-file slither.config.json --checklist 

aderyn :; aderyn .

deploy :; forge script script/Deployer.s.sol --broadcast --rpc-url avalanche --verifier-url 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan' --etherscan-api-key 'verifyContract'

deployTest :; forge script script/DeployerTestnet.s.sol --broadcast --rpc-url avalanche_fuji --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' --etherscan-api-key 'verifyContract'

simulate :; forge script script/DeployerTestnet.s.sol --rpc-url avalanche_fuji

deploySimple :; forge script script/DeployerSimple.s.sol --broadcast --rpc-url avalanche_fuji