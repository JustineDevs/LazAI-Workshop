const mongoose = require('mongoose');

const DataStreamSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    ipfsHash: {
        type: String,
        required: true,
        index: true
    },
    metadataHash: {
        type: String,
        required: true
    },
    queryPrice: {
        type: Number,
        required: true,
        min: 0
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    category: {
        type: String,
        required: true,
        enum: [
            'dataset',
            'model',
            'api',
            'documentation',
            'media',
            'code',
            'other'
        ]
    },
    tags: [{
        type: String,
        maxlength: 50
    }],
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    queryCount: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    transactionHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
DataStreamSchema.index({ creator: 1, createdAt: -1 });
DataStreamSchema.index({ category: 1, isActive: 1 });
DataStreamSchema.index({ queryPrice: 1, isActive: 1 });
DataStreamSchema.index({ tags: 1 });
DataStreamSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for formatted query price
DataStreamSchema.virtual('formattedQueryPrice').get(function() {
    return `${this.queryPrice} DAT`;
});

// Virtual for formatted total earnings
DataStreamSchema.virtual('formattedTotalEarnings').get(function() {
    return `${this.totalEarnings} DAT`;
});

// Pre-save middleware
DataStreamSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Static method to get active data streams
DataStreamSchema.statics.getActiveDataStreams = function(filters = {}) {
    return this.find({ isActive: true, ...filters });
};

// Static method to get data streams by creator
DataStreamSchema.statics.getByCreator = function(creatorId, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.find({ creator: creatorId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('creator', 'address username');
};

// Static method to search data streams
DataStreamSchema.statics.search = function(searchQuery, options = {}) {
    const {
        category,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options;

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

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    return this.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('creator', 'address username');
};

// Instance method to increment query count
DataStreamSchema.methods.incrementQueryCount = function() {
    this.queryCount += 1;
    return this.save();
};

// Instance method to add earnings
DataStreamSchema.methods.addEarnings = function(amount) {
    this.totalEarnings += amount;
    return this.save();
};

module.exports = mongoose.model('DataStream', DataStreamSchema);
