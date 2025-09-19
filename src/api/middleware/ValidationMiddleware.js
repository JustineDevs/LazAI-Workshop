const Joi = require('joi');

class ValidationMiddleware {
    /**
     * Validate query parameters for pagination and filtering
     */
    static validateQueryParams(req, res, next) {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            sortBy: Joi.string().valid('createdAt', 'queryPrice', 'totalQueries', 'totalEarnings').default('createdAt'),
            sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
            status: Joi.string().valid('active', 'inactive', 'all').default('active'),
            minPrice: Joi.number().min(0),
            maxPrice: Joi.number().min(0),
            category: Joi.string().valid('dataset', 'model', 'api', 'documentation', 'media', 'code', 'other')
        });

        const { error, value } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid query parameters',
                details: error.details.map(detail => detail.message)
            });
        }

        req.query = value;
        next();
    }

    /**
     * Validate MongoDB ObjectId
     */
    static validateObjectId(req, res, next) {
        const { id } = req.params;
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;

        if (!objectIdRegex.test(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }

        next();
    }

    /**
     * Validate Ethereum address
     */
    static validateEthereumAddress(req, res, next) {
        const { address } = req.params;
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;

        if (!addressRegex.test(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address format'
            });
        }

        next();
    }

    /**
     * Validate DataStream creation data
     */
    static validateDataStreamCreation(req, res, next) {
        const schema = Joi.object({
            ipfsHash: Joi.string().required().messages({
                'string.empty': 'IPFS hash is required',
                'any.required': 'IPFS hash is required'
            }),
            metadataHash: Joi.string().required().messages({
                'string.empty': 'Metadata hash is required',
                'any.required': 'Metadata hash is required'
            }),
            queryPrice: Joi.number().positive().required().messages({
                'number.positive': 'Query price must be positive',
                'any.required': 'Query price is required'
            }),
            title: Joi.string().min(3).max(200).required().messages({
                'string.min': 'Title must be at least 3 characters',
                'string.max': 'Title must not exceed 200 characters',
                'any.required': 'Title is required'
            }),
            description: Joi.string().min(10).max(2000).required().messages({
                'string.min': 'Description must be at least 10 characters',
                'string.max': 'Description must not exceed 2000 characters',
                'any.required': 'Description is required'
            }),
            category: Joi.string().valid('dataset', 'model', 'api', 'documentation', 'media', 'code', 'other').required().messages({
                'any.only': 'Invalid category',
                'any.required': 'Category is required'
            }),
            tags: Joi.array().items(
                Joi.string().min(2).max(50)
            ).max(10).optional().messages({
                'array.max': 'Maximum 10 tags allowed',
                'string.min': 'Each tag must be at least 2 characters',
                'string.max': 'Each tag must not exceed 50 characters'
            })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        req.body = value;
        next();
    }

    /**
     * Validate query execution data
     */
    static validateQueryExecution(req, res, next) {
        const schema = Joi.object({
            queryData: Joi.object().optional().messages({
                'object.base': 'Query data must be an object'
            })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        req.body = value;
        next();
    }

    /**
     * Validate price update data
     */
    static validatePriceUpdate(req, res, next) {
        const schema = Joi.object({
            queryPrice: Joi.number().positive().required().messages({
                'number.positive': 'Query price must be positive',
                'any.required': 'Query price is required'
            })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        req.body = value;
        next();
    }

    /**
     * Validate status update data
     */
    static validateStatusUpdate(req, res, next) {
        const schema = Joi.object({
            isActive: Joi.boolean().required().messages({
                'any.required': 'Status is required'
            })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        req.body = value;
        next();
    }

    /**
     * Validate search parameters
     */
    static validateSearchParams(req, res, next) {
        const schema = Joi.object({
            q: Joi.string().min(2).max(100).optional().messages({
                'string.min': 'Search query must be at least 2 characters',
                'string.max': 'Search query must not exceed 100 characters'
            }),
            category: Joi.string().valid('dataset', 'model', 'api', 'documentation', 'media', 'code', 'other').optional(),
            minPrice: Joi.number().min(0).optional(),
            maxPrice: Joi.number().min(0).optional(),
            sortBy: Joi.string().valid('createdAt', 'queryPrice', 'totalQueries', 'totalEarnings', 'relevance').default('relevance'),
            sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10)
        });

        const { error, value } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid search parameters',
                details: error.details.map(detail => detail.message)
            });
        }

        req.query = value;
        next();
    }

    /**
     * Validate user registration data
     */
    static validateUserRegistration(req, res, next) {
        const schema = Joi.object({
            address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required().messages({
                'string.pattern.base': 'Invalid Ethereum address format',
                'any.required': 'Address is required'
            }),
            username: Joi.string().alphanum().min(3).max(30).required().messages({
                'string.alphanum': 'Username must contain only alphanumeric characters',
                'string.min': 'Username must be at least 3 characters',
                'string.max': 'Username must not exceed 30 characters',
                'any.required': 'Username is required'
            }),
            email: Joi.string().email().required().messages({
                'string.email': 'Invalid email format',
                'any.required': 'Email is required'
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Password must be at least 6 characters',
                'any.required': 'Password is required'
            }),
            profile: Joi.object({
                firstName: Joi.string().max(50).optional(),
                lastName: Joi.string().max(50).optional(),
                bio: Joi.string().max(500).optional(),
                avatar: Joi.string().uri().optional(),
                website: Joi.string().uri().optional(),
                socialLinks: Joi.object({
                    twitter: Joi.string().optional(),
                    github: Joi.string().optional(),
                    linkedin: Joi.string().optional(),
                    discord: Joi.string().optional()
                }).optional()
            }).optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        req.body = value;
        next();
    }

    /**
     * Validate user login data
     */
    static validateUserLogin(req, res, next) {
        const schema = Joi.object({
            identifier: Joi.alternatives().try(
                Joi.string().email(),
                Joi.string().alphanum().min(3).max(30),
                Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/)
            ).required().messages({
                'alternatives.match': 'Identifier must be a valid email, username, or Ethereum address',
                'any.required': 'Identifier is required'
            }),
            password: Joi.string().required().messages({
                'any.required': 'Password is required'
            })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        req.body = value;
        next();
    }

    /**
     * Validate file upload
     */
    static validateFileUpload(req, res, next) {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const allowedTypes = ['application/json', 'text/csv', 'application/zip', 'text/plain'];
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type. Allowed types: JSON, CSV, ZIP, TXT'
            });
        }

        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size: 100MB'
            });
        }

        next();
    }
}

module.exports = ValidationMiddleware;
