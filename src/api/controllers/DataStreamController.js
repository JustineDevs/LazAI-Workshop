const BlockchainService = require('../services/BlockchainService');
const IPFSService = require('../services/IPFSService');
const DataStreamModel = require('../../models/DataStreamModel');

class DataStreamController {
    constructor() {
        this.blockchainService = new BlockchainService();
        this.ipfsService = new IPFSService();
    }

    /**
     * Get all data streams with pagination and filtering
     */
    async getAllDataStreams(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                status = 'active',
                minPrice,
                maxPrice,
                category
            } = req.query;

            // Build filter object
            const filter = {};
            if (status) filter.isActive = status === 'active';
            if (minPrice || maxPrice) {
                filter.queryPrice = {};
                if (minPrice) filter.queryPrice.$gte = parseFloat(minPrice);
                if (maxPrice) filter.queryPrice.$lte = parseFloat(maxPrice);
            }
            if (category) filter.category = category;

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get data streams from database
            const dataStreams = await DataStreamModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('creator', 'address username')
                .lean();

            // Get total count for pagination
            const totalCount = await DataStreamModel.countDocuments(filter);

            // Get blockchain data for each data stream
            const enrichedDataStreams = await Promise.all(
                dataStreams.map(async (dataStream) => {
                    try {
                        const blockchainData = await this.blockchainService.getDataStream(dataStream.tokenId);
                        return {
                            ...dataStream,
                            ...blockchainData,
                            id: dataStream._id
                        };
                    } catch (error) {
                        console.error(`Failed to get blockchain data for token ${dataStream.tokenId}:`, error);
                        return {
                            ...dataStream,
                            id: dataStream._id,
                            error: 'Blockchain data unavailable'
                        };
                    }
                })
            );

            res.json({
                success: true,
                data: enrichedDataStreams,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
                    hasPrev: parseInt(page) > 1
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a specific data stream by ID
     */
    async getDataStreamById(req, res, next) {
        try {
            const { id } = req.params;

            // Get data stream from database
            const dataStream = await DataStreamModel.findById(id)
                .populate('creator', 'address username')
                .lean();

            if (!dataStream) {
                return res.status(404).json({
                    success: false,
                    error: 'DataStream not found'
                });
            }

            // Get blockchain data
            try {
                const blockchainData = await this.blockchainService.getDataStream(dataStream.tokenId);
                const enrichedDataStream = {
                    ...dataStream,
                    ...blockchainData,
                    id: dataStream._id
                };

                res.json({
                    success: true,
                    data: enrichedDataStream
                });
            } catch (blockchainError) {
                console.error('Blockchain data unavailable:', blockchainError);
                res.json({
                    success: true,
                    data: {
                        ...dataStream,
                        id: dataStream._id,
                        error: 'Blockchain data unavailable'
                    }
                });
            }

        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new data stream NFT
     */
    async createDataStream(req, res, next) {
        try {
            const {
                ipfsHash,
                metadataHash,
                queryPrice,
                title,
                description,
                category,
                tags
            } = req.body;

            const creatorAddress = req.user.address;

            // Mint NFT on blockchain
            const mintResult = await this.blockchainService.mintDataStream(
                ipfsHash,
                metadataHash,
                queryPrice,
                creatorAddress
            );

            // Save to database
            const dataStream = new DataStreamModel({
                tokenId: mintResult.tokenId,
                ipfsHash,
                metadataHash,
                queryPrice: parseFloat(queryPrice),
                creator: req.user.id,
                title,
                description,
                category,
                tags: tags || [],
                isActive: true,
                transactionHash: mintResult.transactionHash
            });

            await dataStream.save();

            res.status(201).json({
                success: true,
                data: {
                    id: dataStream._id,
                    tokenId: dataStream.tokenId,
                    transactionHash: mintResult.transactionHash,
                    message: 'DataStream created successfully'
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Execute a query on a data stream
     */
    async executeQuery(req, res, next) {
        try {
            const { id } = req.params;
            const { queryData } = req.body;

            // Get data stream from database
            const dataStream = await DataStreamModel.findById(id);
            if (!dataStream) {
                return res.status(404).json({
                    success: false,
                    error: 'DataStream not found'
                });
            }

            // Execute query on blockchain
            const queryResult = await this.blockchainService.executeQuery(
                dataStream.tokenId,
                req.user.address
            );

            // Update query count in database
            await DataStreamModel.findByIdAndUpdate(id, {
                $inc: { queryCount: 1 }
            });

            res.json({
                success: true,
                data: {
                    transactionHash: queryResult.transactionHash,
                    message: 'Query executed successfully',
                    queryData
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Update query price for a data stream
     */
    async updateQueryPrice(req, res, next) {
        try {
            const { id } = req.params;
            const { queryPrice } = req.body;

            // Get data stream from database
            const dataStream = await DataStreamModel.findById(id);
            if (!dataStream) {
                return res.status(404).json({
                    success: false,
                    error: 'DataStream not found'
                });
            }

            // Check ownership
            if (dataStream.creator.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to update this DataStream'
                });
            }

            // Update price in database
            dataStream.queryPrice = parseFloat(queryPrice);
            await dataStream.save();

            res.json({
                success: true,
                data: {
                    id: dataStream._id,
                    queryPrice: dataStream.queryPrice,
                    message: 'Query price updated successfully'
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Update data stream status (activate/deactivate)
     */
    async updateDataStreamStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            // Get data stream from database
            const dataStream = await DataStreamModel.findById(id);
            if (!dataStream) {
                return res.status(404).json({
                    success: false,
                    error: 'DataStream not found'
                });
            }

            // Check ownership
            if (dataStream.creator.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to update this DataStream'
                });
            }

            // Update status in database
            dataStream.isActive = isActive;
            await dataStream.save();

            res.json({
                success: true,
                data: {
                    id: dataStream._id,
                    isActive: dataStream.isActive,
                    message: `DataStream ${isActive ? 'activated' : 'deactivated'} successfully`
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all data streams created by a specific address
     */
    async getDataStreamsByCreator(req, res, next) {
        try {
            const { address } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Find user by address
            const UserModel = require('../../models/UserModel');
            const user = await UserModel.findOne({ address });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Get data streams
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const dataStreams = await DataStreamModel.find({ creator: user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('creator', 'address username')
                .lean();

            const totalCount = await DataStreamModel.countDocuments({ creator: user._id });

            res.json({
                success: true,
                data: dataStreams,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get statistics for a specific data stream
     */
    async getDataStreamStats(req, res, next) {
        try {
            const { id } = req.params;

            // Get data stream from database
            const dataStream = await DataStreamModel.findById(id);
            if (!dataStream) {
                return res.status(404).json({
                    success: false,
                    error: 'DataStream not found'
                });
            }

            // Get blockchain data for stats
            try {
                const blockchainData = await this.blockchainService.getDataStream(dataStream.tokenId);
                
                res.json({
                    success: true,
                    data: {
                        totalQueries: blockchainData.totalQueries,
                        totalEarnings: blockchainData.totalEarnings,
                        queryPrice: blockchainData.queryPrice,
                        isActive: blockchainData.isActive,
                        createdAt: blockchainData.createdAt
                    }
                });
            } catch (blockchainError) {
                res.json({
                    success: true,
                    data: {
                        totalQueries: dataStream.queryCount || 0,
                        queryPrice: dataStream.queryPrice,
                        isActive: dataStream.isActive,
                        createdAt: dataStream.createdAt,
                        error: 'Blockchain stats unavailable'
                    }
                });
            }

        } catch (error) {
            next(error);
        }
    }

    /**
     * Search data streams by various criteria
     */
    async searchDataStreams(req, res, next) {
        try {
            const {
                q: searchQuery,
                category,
                minPrice,
                maxPrice,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                page = 1,
                limit = 10
            } = req.query;

            // Build search filter
            const filter = { isActive: true };
            
            if (searchQuery) {
                filter.$or = [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                    { tags: { $in: [new RegExp(searchQuery, 'i')] } }
                ];
            }

            if (category) filter.category = category;
            if (minPrice || maxPrice) {
                filter.queryPrice = {};
                if (minPrice) filter.queryPrice.$gte = parseFloat(minPrice);
                if (maxPrice) filter.queryPrice.$lte = parseFloat(maxPrice);
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Execute search
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const dataStreams = await DataStreamModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('creator', 'address username')
                .lean();

            const totalCount = await DataStreamModel.countDocuments(filter);

            res.json({
                success: true,
                data: dataStreams,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount
                }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = DataStreamController;
