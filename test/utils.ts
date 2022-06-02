import { ethers, network } from 'hardhat'
import {
	CustomFallbakHandler,
	TestProxy,
	DummyDeap,
	TestContract,
	GnosisSafe,
	DummyFallbakHandler,
} from '../typechain-types'

export const makeSnapshot = async (): Promise<string> => {
	const snapshot = await network.provider.request({ method: 'evm_snapshot' })
	return typeof snapshot === 'string' ? snapshot : ''
}

export const resetChain = async (snapshot: string): Promise<void> => {
	await network.provider.request({
		method: 'evm_revert',
		params: [snapshot],
	})
}

export const generateCustomFallbakHandler =
	async (): Promise<CustomFallbakHandler> => {
		const handlerFactory = await ethers.getContractFactory(
			'CustomFallbakHandler'
		)
		const hander_ = (await handlerFactory.deploy()) as CustomFallbakHandler
		await hander_.deployed()
		const proxyFactory = await ethers.getContractFactory('TestProxy')
		const data = ethers.utils.arrayify('0x')
		const proxy = (await proxyFactory.deploy(
			hander_.address,
			data
		)) as TestProxy
		await proxy.deployed()
		const handler = hander_.attach(proxy.address)
		await handler.initialize()
		return handler
	}

export const generateDeapCoin = async (): Promise<DummyDeap> => {
	const factory = await ethers.getContractFactory('DummyDeap')
	const instance = (await factory.deploy()) as DummyDeap
	await instance.deployed()
	return instance
}

export const generateTestContract = async (): Promise<TestContract> => {
	const factory = await ethers.getContractFactory('TestContract')
	const instance = (await factory.deploy()) as TestContract
	await instance.deployed()
	return instance
}

export const generateGnosysSafe = async (): Promise<GnosisSafe> => {
	const factory = await ethers.getContractFactory('GnosisSafe')
	const instance = (await factory.deploy()) as GnosisSafe
	await instance.deployed()
	return instance
}

export const generateDummyFallbakHandler =
	async (): Promise<DummyFallbakHandler> => {
		const factory = await ethers.getContractFactory('DummyFallbakHandler')
		const instance = (await factory.deploy()) as DummyFallbakHandler
		await instance.deployed()
		return instance
	}
