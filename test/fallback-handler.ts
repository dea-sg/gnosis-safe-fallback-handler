import { expect, use } from 'chai'
import { ethers } from 'hardhat'
import { solidity } from 'ethereum-waffle'
import {
	makeSnapshot,
	resetChain,
	generateCustomFallbakHandler,
	generateDeapCoin,
	generateTestContract,
} from './utils'
import { CustomFallbakHandler, DummyDeap } from '../typechain-types'

use(solidity)

describe('FallbakHandler', () => {
	let handler: CustomFallbakHandler
	let deap: DummyDeap
	let snapshot: string
	before(async () => {
		handler = await generateCustomFallbakHandler()
		deap = await generateDeapCoin()
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
			it('deap coins can be transferred(not contract).', async () => {
				const user = ethers.Wallet.createRandom()
				const beforebalance = await deap.balanceOf(user.address)
				expect(beforebalance.toString()).to.equal('0')
				await deap.transfer(user.address, '1000000000000000000')
				const afterbalance = await deap.balanceOf(user.address)
				expect(afterbalance.toString()).to.equal('1000000000000000000')
			})
			it('deap coins can be transferred(contract).', async () => {
				const beforebalance = await deap.balanceOf(handler.address)
				expect(beforebalance.toString()).to.equal('0')
				await deap.transfer(handler.address, '1000000000000000000')
				const afterbalance = await deap.balanceOf(handler.address)
				expect(afterbalance.toString()).to.equal('1000000000000000000')
			})
		})
		describe('fail', () => {
			it('deap coins can not be transferred(contract).', async () => {
				const testContract = await generateTestContract()
				const beforebalance = await deap.balanceOf(testContract.address)
				expect(beforebalance.toString()).to.equal('0')
				const message =
					"function selector was not recognized and there's no fallback function"
				await expect(
					deap.transfer(testContract.address, '1000000000000000000')
				).to.be.revertedWith(message)
			})
		})
	})
})
