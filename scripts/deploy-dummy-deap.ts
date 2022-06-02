import { ethers } from 'hardhat'
import { DummyDeap } from '../typechain-types'

async function main() {
	const factory = await ethers.getContractFactory('DummyDeap')
	const deap = (await factory.deploy()) as DummyDeap
	console.log(deap.address)
	await deap.deployed()
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Rinkeby
// 0x0A15B4be23A38bF0162BE6cF6B2a6fab34488c83
