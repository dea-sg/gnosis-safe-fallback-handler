import { expect, use } from 'chai'
import { ethers } from 'hardhat'
import { solidity } from 'ethereum-waffle'
import {
	makeSnapshot,
	resetChain,
	generateFallbackhandler,
	generateDeapCoin,
	generateGnosysSafe,
} from './utils'
import { FallbakHandler, DummyDeap, GnosisSafe } from '../typechain-types'

use(solidity)

describe('GnosisSafe', () => {
	let handler: FallbakHandler
	let deap: DummyDeap
	let gnosis: GnosisSafe
	let snapshot: string
	before(async () => {
		handler = await generateFallbackhandler()
		deap = await generateDeapCoin()
		gnosis = await generateGnosysSafe()
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
			it('trasnfer is success.', async () => {
				await gnosis.setup(ethers.constants.AddressZero)
				const beforebalance = await deap.balanceOf(gnosis.address)
				expect(beforebalance.toString()).to.equal('0')
				// TODO
				await deap.transfer(gnosis.address, '1000000000000000000')
			})
		})
	})
})
