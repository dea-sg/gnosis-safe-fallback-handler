/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ethers } from 'hardhat'
import { Contract, Wallet, Signer, BigNumber, BigNumberish } from 'ethers'
import { TypedDataSigner } from '@ethersproject/abstract-signer'
import { AddressZero } from '@ethersproject/constants'
import { abi } from './GnosisSafe.json'

async function main() {
	/// ////////////////////////////////////////////
	const safeAddress = '0x2d1224DB2D7a226430203Ac3Da45Bb231837EF11'
	const fallBackHandler = '0x71383d65426aa62c0a17617bBFC64E3Cf50F8970'
	/// ////////////////////////////////////////////
	const [owner] = await ethers.getSigners()
	const wallet = new Wallet(process.env.PRIVATE_KEY!, owner.provider)
	const safe = new Contract(safeAddress, abi, owner)
	const beforeFallbackHandlerAddress = await ethers.provider.getStorageAt(
		safe.address,
		'0x6c9a6c4a39284e37ed1cf53d337577d14212a4870fb976a4366c693b939918d5'
	)
	console.log(`before fall back handler:${beforeFallbackHandlerAddress}`)
	await executeContractCallWithSigners(
		safe,
		safe,
		'setFallbackHandler',
		[fallBackHandler],
		[wallet]
	)
}

const EIP712_SAFE_TX_TYPE = {
	// "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
	SafeTx: [
		{ type: 'address', name: 'to' },
		{ type: 'uint256', name: 'value' },
		{ type: 'bytes', name: 'data' },
		{ type: 'uint8', name: 'operation' },
		{ type: 'uint256', name: 'safeTxGas' },
		{ type: 'uint256', name: 'baseGas' },
		{ type: 'uint256', name: 'gasPrice' },
		{ type: 'address', name: 'gasToken' },
		{ type: 'address', name: 'refundReceiver' },
		{ type: 'uint256', name: 'nonce' },
	],
}

interface MetaTransaction {
	to: string
	value: string | number | BigNumber
	data: string
	operation: number
}

interface SafeTransaction extends MetaTransaction {
	safeTxGas: string | number
	baseGas: string | number
	gasPrice: string | number
	gasToken: string
	refundReceiver: string
	nonce: number
}

interface SafeSignature {
	signer: string
	data: string
}

const buildContractCall = (
	contract: Contract,
	method: string,
	params: any[],
	nonce: number,
	delegateCall?: boolean,
	overrides?: Partial<SafeTransaction>
): SafeTransaction => {
	const data = contract.interface.encodeFunctionData(method, params)
	return buildSafeTransaction({
		to: contract.address,
		data,
		operation: delegateCall ? 1 : 0,
		nonce,
		...overrides,
	})
}

const executeContractCallWithSigners = async (
	safe: Contract,
	contract: Contract,
	method: string,
	params: any[],
	signers: Wallet[],
	delegateCall?: boolean,
	overrides?: Partial<SafeTransaction>
) => {
	const tx = buildContractCall(
		contract,
		method,
		params,
		await safe.nonce(),
		delegateCall,
		overrides
	)
	return executeTxWithSigners(safe, tx, signers)
}

const safeSignTypedData = async (
	signer: Signer & TypedDataSigner,
	safe: Contract,
	safeTx: SafeTransaction,
	chainId?: BigNumberish
): Promise<SafeSignature> => {
	if (!chainId && !signer.provider)
		throw Error('Provider required to retrieve chainId')
	const cid = chainId || (await signer.provider!.getNetwork()).chainId
	const signerAddress = await signer.getAddress()
	return {
		signer: signerAddress,
		data: await signer._signTypedData(
			{ verifyingContract: safe.address, chainId: cid },
			EIP712_SAFE_TX_TYPE,
			safeTx
		),
	}
}

const buildSignatureBytes = (signatures: SafeSignature[]): string => {
	signatures.sort((left, right) =>
		left.signer.toLowerCase().localeCompare(right.signer.toLowerCase())
	)
	let signatureBytes = '0x'
	for (const sig of signatures) {
		signatureBytes += sig.data.slice(2)
	}

	return signatureBytes
}

const executeTx = async (
	safe: Contract,
	safeTx: SafeTransaction,
	signatures: SafeSignature[],
	overrides?: any
): Promise<any> => {
	const signatureBytes = buildSignatureBytes(signatures)
	return safe.execTransaction(
		safeTx.to,
		safeTx.value,
		safeTx.data,
		safeTx.operation,
		safeTx.safeTxGas,
		safeTx.baseGas,
		safeTx.gasPrice,
		safeTx.gasToken,
		safeTx.refundReceiver,
		signatureBytes,
		overrides || {}
	)
}

const executeTxWithSigners = async (
	safe: Contract,
	tx: SafeTransaction,
	signers: Wallet[],
	overrides?: any
) => {
	const sigs = await Promise.all(
		signers.map(async (signer) => safeSignTypedData(signer, safe, tx))
	)
	return executeTx(safe, tx, sigs, overrides)
}

const buildSafeTransaction = (template: {
	to: string
	value?: BigNumber | number | string
	data?: string
	operation?: number
	safeTxGas?: number | string
	baseGas?: number | string
	gasPrice?: number | string
	gasToken?: string
	refundReceiver?: string
	nonce: number
}): SafeTransaction => ({
	to: template.to,
	value: template.value || 0,
	data: template.data || '0x',
	operation: template.operation || 0,
	safeTxGas: template.safeTxGas || 0,
	baseGas: template.baseGas || 0,
	gasPrice: template.gasPrice || 0,
	gasToken: template.gasToken || AddressZero,
	refundReceiver: template.refundReceiver || AddressZero,
	nonce: template.nonce,
})

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Memo
// npx hardhat run dist/scripts/update-fall-back.js --network mainnet
