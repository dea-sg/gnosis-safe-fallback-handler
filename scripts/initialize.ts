import { ethers } from 'hardhat'
import { CustomFallbakHandler } from '../typechain-types'

async function main() {
	/// ////////////////////////////////////////////
	const fallBackHandler = '0xCF3C44649Ae829DF9805961b934E0ba17F453bA8'
	/// ////////////////////////////////////////////

	const handler = await ethers.getContractFactory('CustomFallbakHandler')
	const instance = handler.attach(fallBackHandler) as CustomFallbakHandler
	await instance.initialize()
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Memo
// npx hardhat run dist/scripts/initialize.js --network rinkeby
