const BlockchainService = require('../services/BlockchainService');

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
                    unit: 'ETH'
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get DAT token balance for an address
     */
    async getDATBalance(req, res, next) {
        try {
            const { address } = req.params;
            const balance = await this.blockchainService.getDATTokenBalance(address);

            res.json({
                success: true,
                data: {
                    address,
                    balance: balance,
                    unit: 'DAT'
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
            const { address } = req.params;
            
            // Get basic contract info
            const provider = this.blockchainService.getProvider();
            const code = await provider.getCode(address);
            
            const contractInfo = {
                address,
                isContract: code !== '0x',
                codeSize: code.length,
                network: await this.blockchainService.getNetworkInfo()
            };

            res.json({
                success: true,
                data: contractInfo
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Approve DAT tokens for spending
     */
    async approveTokens(req, res, next) {
        try {
            const { spender, amount } = req.body;

            if (!spender || !amount) {
                return res.status(400).json({
                    success: false,
                    error: 'Spender address and amount are required'
                });
            }

            const datToken = this.blockchainService.getDATTokenContract();
            if (!datToken) {
                return res.status(500).json({
                    success: false,
                    error: 'DAT token contract not available'
                });
            }

            // This would require wallet integration for actual transaction
            // For now, return the approval data
            res.json({
                success: true,
                data: {
                    spender,
                    amount,
                    message: 'Approval transaction data generated. Use MetaMask to sign the transaction.'
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get token allowance
     */
    async getAllowance(req, res, next) {
        try {
            const { owner, spender } = req.params;

            const datToken = this.blockchainService.getDATTokenContract();
            if (!datToken) {
                return res.status(500).json({
                    success: false,
                    error: 'DAT token contract not available'
                });
            }

            const allowance = await datToken.allowance(owner, spender);

            res.json({
                success: true,
                data: {
                    owner,
                    spender,
                    allowance: allowance.toString(),
                    formattedAllowance: ethers.utils.formatEther(allowance)
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
            const gasPrice = await provider.getGasPrice();

            res.json({
                success: true,
                data: {
                    gasPrice: gasPrice.toString(),
                    gasPriceGwei: ethers.utils.formatUnits(gasPrice, 'gwei'),
                    gasPriceEther: ethers.utils.formatEther(gasPrice)
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
