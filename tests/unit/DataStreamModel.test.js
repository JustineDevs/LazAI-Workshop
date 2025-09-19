const mongoose = require('mongoose');
const DataStreamModel = require('../../src/models/DataStreamModel');
const UserModel = require('../../src/models/UserModel');

// Mock database connection
beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/datastreamnft_test';
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await DataStreamModel.deleteMany({});
    await UserModel.deleteMany({});
});

describe('DataStreamModel', () => {
    let testUser;
    let testDataStream;

    beforeEach(async () => {
        // Create test user
        testUser = new UserModel({
            address: '0x1234567890123456789012345678901234567890',
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        await testUser.save();

        // Create test data stream
        testDataStream = new DataStreamModel({
            tokenId: '1',
            ipfsHash: 'QmTestHash123456789',
            metadataHash: 'QmMetadataHash123456789',
            queryPrice: 10.5,
            creator: testUser._id,
            title: 'Test Dataset',
            description: 'A test dataset for unit testing',
            category: 'dataset',
            tags: ['test', 'sample'],
            transactionHash: '0xTransactionHash123456789'
        });
    });

    describe('DataStream Creation', () => {
        test('should create a valid data stream', async () => {
            const savedDataStream = await testDataStream.save();
            
            expect(savedDataStream._id).toBeDefined();
            expect(savedDataStream.tokenId).toBe('1');
            expect(savedDataStream.queryPrice).toBe(10.5);
            expect(savedDataStream.isActive).toBe(true);
            expect(savedDataStream.queryCount).toBe(0);
        });

        test('should require all mandatory fields', async () => {
            const invalidDataStream = new DataStreamModel({
                tokenId: '2'
            });

            await expect(invalidDataStream.save()).rejects.toThrow();
        });

        test('should validate query price is positive', async () => {
            testDataStream.queryPrice = -5;
            await expect(testDataStream.save()).rejects.toThrow();
        });
    });

    describe('DataStream Methods', () => {
        test('should increment query count', async () => {
            await testDataStream.save();
            await testDataStream.incrementQueryCount();
            
            const updatedDataStream = await DataStreamModel.findById(testDataStream._id);
            expect(updatedDataStream.queryCount).toBe(1);
        });

        test('should add earnings', async () => {
            await testDataStream.save();
            await testDataStream.addEarnings(25.5);
            
            const updatedDataStream = await DataStreamModel.findById(testDataStream._id);
            expect(updatedDataStream.totalEarnings).toBe(25.5);
        });
    });

    describe('DataStream Statics', () => {
        beforeEach(async () => {
            await testDataStream.save();
        });

        test('should get active data streams', async () => {
            const activeDataStreams = await DataStreamModel.getActiveDataStreams();
            expect(activeDataStreams).toHaveLength(1);
        });

        test('should get data streams by creator', async () => {
            const creatorDataStreams = await DataStreamModel.getByCreator(testUser._id);
            expect(creatorDataStreams).toHaveLength(1);
        });

        test('should search data streams', async () => {
            const searchResults = await DataStreamModel.search('test', {
                page: 1,
                limit: 10
            });
            expect(searchResults).toHaveLength(1);
        });
    });

    describe('DataStream Virtuals', () => {
        test('should format query price', async () => {
            await testDataStream.save();
            expect(testDataStream.formattedQueryPrice).toBe('10.5 DAT');
        });

        test('should format total earnings', async () => {
            testDataStream.totalEarnings = 100;
            await testDataStream.save();
            expect(testDataStream.formattedTotalEarnings).toBe('100 DAT');
        });
    });

    describe('DataStream Indexes', () => {
        test('should find by tokenId', async () => {
            await testDataStream.save();
            const found = await DataStreamModel.findOne({ tokenId: '1' });
            expect(found).toBeDefined();
        });

        test('should find by creator', async () => {
            await testDataStream.save();
            const found = await DataStreamModel.find({ creator: testUser._id });
            expect(found).toHaveLength(1);
        });

        test('should find by category', async () => {
            await testDataStream.save();
            const found = await DataStreamModel.find({ category: 'dataset' });
            expect(found).toHaveLength(1);
        });
    });
});
