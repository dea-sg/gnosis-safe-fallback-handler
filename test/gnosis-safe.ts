import { expect, use } from 'chai'
import { ethers } from 'hardhat'
import { solidity } from 'ethereum-waffle'
import {
	makeSnapshot,
	resetChain,
	generateCustomFallbakHandler,
	generateDeapCoin,
	generateGnosysSafe,
	generateDummyFallbakHandler,
} from './utils'
import {
	CustomFallbakHandler,
	DummyDeap,
	GnosisSafe,
	DummyFallbakHandler,
} from '../typechain-types'

use(solidity)

describe('GnosisSafe', () => {
	let handler: CustomFallbakHandler
	let deap: DummyDeap
	let gnosis: GnosisSafe
	let dummyhandler: DummyFallbakHandler
	let snapshot: string
	before(async () => {
		handler = await generateCustomFallbakHandler()
		deap = await generateDeapCoin()
		gnosis = await generateGnosysSafe()
		dummyhandler = await generateDummyFallbakHandler()
	})
	beforeEach(async () => {
		snapshot = await makeSnapshot()
	})
	afterEach(async () => {
		await resetChain(snapshot)
	})
	describe('tokenFallback', () => {
		it('Nothing happens', async () => {
			const data = ethers.utils.arrayify('0x')
			await handler.tokenFallback(ethers.constants.AddressZero, 0, data)
			expect(true).to.equal(true)
		})
	})
	describe('transfer', () => {
		describe('success', () => {
			it('trasnfer is success.', async () => {
				await gnosis.setup(handler.address)
				const beforebalance = await deap.balanceOf(gnosis.address)
				expect(beforebalance.toString()).to.equal('0')
				await deap.transfer(gnosis.address, '1000000000000000000')
				const afterbalance = await deap.balanceOf(gnosis.address)
				expect(afterbalance.toString()).to.equal('1000000000000000000')
			})
		})
		describe('fail', () => {
			it('trasnfer is fail.', async () => {
				await gnosis.setup(dummyhandler.address)
				const beforebalance = await deap.balanceOf(gnosis.address)
				expect(beforebalance.toString()).to.equal('0')
				await expect(
					deap.transfer(gnosis.address, '1000000000000000000')
				).to.be.revertedWith('Transaction reverted without a reason string')
			})
		})
	})
})
