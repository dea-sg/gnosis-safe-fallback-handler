/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers, upgrades } from 'hardhat'

async function main() {
	const handler = await ethers.getContractFactory('FallbakHandler')
	const proxy = await upgrades.deployProxy(handler, [], { kind: 'uups' })
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
