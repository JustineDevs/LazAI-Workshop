const mongoose = require('mongoose');

class DatabaseService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/datastreamnft';
            
            this.connection = await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            this.isConnected = true;
            console.log('Connected to MongoDB successfully');
            
            // Handle connection events
            mongoose.connection.on('error', (error) => {
                console.error('MongoDB connection error:', error);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected');
                this.isConnected = true;
            });

        } catch (error) {
            console.error('MongoDB connection failed:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.connection) {
                await mongoose.disconnect();
                this.isConnected = false;
                console.log('Disconnected from MongoDB');
            }
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    getConnection() {
        return this.connection;
    }

    isDatabaseConnected() {
        return this.isConnected && mongoose.connection.readyState === 1;
    }

    async healthCheck() {
        try {
            if (!this.isDatabaseConnected()) {
                return {
                    status: 'unhealthy',
                    message: 'Database not connected'
                };
            }

            // Ping the database
            await mongoose.connection.db.admin().ping();
            
            return {
                status: 'healthy',
                message: 'Database connected and responsive'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: `Database health check failed: ${error.message}`
            };
        }
    }
}

module.exports = DatabaseService;
