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

catapulta :; npx catapulta script scripts/DeployerTestnet.s.sol --network avalanche_fuji

verify :; forge verify-contract 0xa1940Ac51C7bF051dD63edC1Fcb01c05a1E65c5A src/Racing.sol:Racing --chain-id 43113 --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan' --etherscan-api-key 'verifyContract' --num-of-optimizations 1000 --compiler-version 0.8.24 --constructor-args $(cast abi-encode 'constructor( address _router, address _vrfCoordinator, uint256 _vrfSubscriptionId, uint64 _functionSubscriptionId, bytes32 _keyHash, bytes32 _donID)' 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE 4734827867964001365405830055140988844088387107361042566903892685164165989088 8170 0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887 'fun-avalanche-fuji-1')