/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers, upgrades } from 'hardhat'

async function main() {
	const handler = await ethers.getContractFactory('CustomFallbakHandler')
	const proxy = await upgrades.deployProxy(handler, [], {
		kind: 'uups',
		initializer: 'initialize',
	})
	await proxy.deployed()
	console.log('proxy was deployed to:', proxy.address)
	const filter = proxy.filters.Upgraded()
	const events = await proxy.queryFilter(filter)
	console.log('logic was deployed to:', events[0].args!.implementation)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Rinkeby
// npx hardhat run dist/scripts/deploy.js --network rinkeby
// proxy was deployed to: 0xDAe19904c72b8ca4054D975c64FEDa01cD0b11a3
// logic was deployed to: 0x4A70C7Ffe39bC1289598aF2Fb78CF15e502b7660

// 2回目
// logic 0xE0CC1E92a56cfc561e5e6826dBbE2153125d5914
// proxy 0xCF3C44649Ae829DF9805961b934E0ba17F453bA8
