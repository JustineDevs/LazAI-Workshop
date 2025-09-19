const BlockchainService = require('../services/BlockchainService');
const { ethers } = require('ethers');

class BlockchainController {
    constructor() {
        this.blockchainService = new BlockchainService();
    }

    /**
     * Get blockchain network information
     */
    async getNetworkInfo(req, res, next) {
        try {
            const networkInfo = await this.blockchainService.getNetworkInfo();

            res.json({
                success: true,
                data: networkInfo
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get ETH balance for an address
     */
    async getBalance(req, res, next) {
        try {
            const { address } = req.params;
            const balance = await this.blockchainService.getWalletBalance(address);

            res.json({
                success: true,
                data: {
                    address,
                    balance: balance,
                    unit: 'LAZAI'
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get contract information
     */
    async getContractInfo(req, res, next) {
        try {
            const contractInfo = await this.blockchainService.getContractInfo();

            res.json({
                success: true,
                data: contractInfo
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get Data NFT information
     */
    async getDataNFT(req, res, next) {
        try {
            const { tokenId } = req.params;
            const dataNFT = await this.blockchainService.getDataNFT(tokenId);

            res.json({
                success: true,
                data: dataNFT
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Check if address owns a token
     */
    async checkOwnership(req, res, next) {
        try {
            const { tokenId, address } = req.params;
            const isOwner = await this.blockchainService.isOwner(tokenId, address);

            res.json({
                success: true,
                data: {
                    tokenId,
                    address,
                    isOwner
                }
            });

        } catch (error) {
            next(error);
        }
    }


    /**
     * Get transaction details
     */
    async getTransaction(req, res, next) {
        try {
            const { hash } = req.params;

            if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid transaction hash format'
                });
            }

            const provider = this.blockchainService.getProvider();
            const transaction = await provider.getTransaction(hash);
            const receipt = await provider.getTransactionReceipt(hash);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    error: 'Transaction not found'
                });
            }

            res.json({
                success: true,
                data: {
                    hash: transaction.hash,
                    from: transaction.from,
                    to: transaction.to,
                    value: transaction.value.toString(),
                    gasLimit: transaction.gasLimit.toString(),
                    gasPrice: transaction.gasPrice?.toString(),
                    nonce: transaction.nonce,
                    blockNumber: transaction.blockNumber,
                    blockHash: transaction.blockHash,
                    status: receipt?.status,
                    gasUsed: receipt?.gasUsed?.toString(),
                    effectiveGasPrice: receipt?.effectiveGasPrice?.toString()
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get block information
     */
    async getBlock(req, res, next) {
        try {
            const { number } = req.params;
            const blockNumber = parseInt(number);

            if (isNaN(blockNumber)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid block number'
                });
            }

            const provider = this.blockchainService.getProvider();
            const block = await provider.getBlock(blockNumber);

            if (!block) {
                return res.status(404).json({
                    success: false,
                    error: 'Block not found'
                });
            }

            res.json({
                success: true,
                data: {
                    number: block.number,
                    hash: block.hash,
                    parentHash: block.parentHash,
                    timestamp: block.timestamp,
                    gasLimit: block.gasLimit.toString(),
                    gasUsed: block.gasUsed.toString(),
                    miner: block.miner,
                    difficulty: block.difficulty.toString(),
                    totalDifficulty: block.totalDifficulty?.toString(),
                    transactionCount: block.transactions.length
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current gas price
     */
    async getGasPrice(req, res, next) {
        try {
            const provider = this.blockchainService.getProvider();
            const feeData = await provider.getFeeData();

            res.json({
                success: true,
                data: {
                    gasPrice: feeData.gasPrice?.toString() || '0',
                    gasPriceGwei: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0',
                    gasPriceEther: feeData.gasPrice ? ethers.formatEther(feeData.gasPrice) : '0',
                    maxFeePerGas: feeData.maxFeePerGas?.toString(),
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Estimate gas for a transaction
     */
    async estimateGas(req, res, next) {
        try {
            const { to, data, value, from } = req.body;

            if (!to) {
                return res.status(400).json({
                    success: false,
                    error: 'To address is required'
                });
            }

            const provider = this.blockchainService.getProvider();
            const gasEstimate = await provider.estimateGas({
                to,
                data: data || '0x',
                value: value || '0x0',
                from: from || undefined
            });

            res.json({
                success: true,
                data: {
                    gasEstimate: gasEstimate.toString(),
                    gasEstimateHex: gasEstimate.toHexString()
                }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = BlockchainController;
