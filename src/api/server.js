const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Import routes
const dataStreamRoutes = require('./routes/dataStreamRoutes');
const userRoutes = require('./routes/userRoutes');
const ipfsRoutes = require('./routes/ipfsRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// Import services
const DatabaseService = require('./services/DatabaseService');
const BlockchainService = require('./services/BlockchainService');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.logger = this.setupLogger();
        this.databaseService = new DatabaseService();
        this.blockchainService = new BlockchainService();
    }

    setupLogger() {
        return winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                new winston.transports.File({ 
                    filename: process.env.LOG_FILE || 'logs/error.log',
                    level: 'error'
                }),
                new winston.transports.File({ 
                    filename: process.env.LOG_FILE || 'logs/combined.log'
                })
            ]
        });
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        
        // CORS configuration
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true
        }));

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use(requestLogger(this.logger));

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development'
            });
        });
    }

    setupRoutes() {
        // API routes
        this.app.use('/api/v1/datastreams', dataStreamRoutes);
        this.app.use('/api/v1/users', userRoutes);
        this.app.use('/api/v1/ipfs', ipfsRoutes);
        this.app.use('/api/v1/blockchain', blockchainRoutes);

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
                timestamp: new Date().toISOString()
            });
        });

        // Error handling middleware
        this.app.use(errorHandler(this.logger));
    }

    async connectDatabase() {
        try {
            await this.databaseService.connect();
            this.logger.info('Database connected successfully');
        } catch (error) {
            this.logger.error('Database connection failed:', error);
            throw error;
        }
    }

    async initializeBlockchain() {
        try {
            await this.blockchainService.initialize();
            this.logger.info('Blockchain service initialized successfully');
        } catch (error) {
            this.logger.error('Blockchain initialization failed:', error);
            throw error;
        }
    }

    async start() {
        try {
            // Setup middleware
            this.setupMiddleware();

            // Connect to database
            await this.connectDatabase();

            // Initialize blockchain service
            await this.initializeBlockchain();

            // Setup routes
            this.setupRoutes();

            // Start server
            this.app.listen(this.port, () => {
                this.logger.info(`Server running on port ${this.port}`);
                this.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
                this.logger.info(`Health check: http://localhost:${this.port}/health`);
            });

        } catch (error) {
            this.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    async stop() {
        try {
            await this.databaseService.disconnect();
            this.logger.info('Server stopped gracefully');
        } catch (error) {
            this.logger.error('Error stopping server:', error);
        }
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    if (server) {
        await server.stop();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    if (server) {
        await server.stop();
    }
    process.exit(0);
});

// Start server
const server = new Server();
server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

module.exports = Server;
