const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        validate: {
            validator: function(v) {
                return /^0x[a-fA-F0-9]{40}$/.test(v);
            },
            message: 'Invalid Ethereum address format'
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
        index: true,
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9_]+$/.test(v);
            },
            message: 'Username can only contain letters, numbers, and underscores'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Invalid email format'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profile: {
        firstName: {
            type: String,
            maxlength: 50
        },
        lastName: {
            type: String,
            maxlength: 50
        },
        bio: {
            type: String,
            maxlength: 500
        },
        avatar: {
            type: String,
            validate: {
                validator: function(v) {
                    return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
                },
                message: 'Invalid avatar URL format'
            }
        },
        website: {
            type: String,
            validate: {
                validator: function(v) {
                    return !v || /^https?:\/\/.+/.test(v);
                },
                message: 'Invalid website URL format'
            }
        },
        socialLinks: {
            twitter: String,
            github: String,
            linkedin: String,
            discord: String
        }
    },
    stats: {
        totalDataStreams: {
            type: Number,
            default: 0
        },
        totalQueries: {
            type: Number,
            default: 0
        },
        totalEarnings: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        }
    },
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            marketing: {
                type: Boolean,
                default: false
            }
        },
        privacy: {
            showEarnings: {
                type: Boolean,
                default: true
            },
            showActivity: {
                type: Boolean,
                default: true
            }
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLoginAt: {
        type: Date
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
UserSchema.index({ address: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'stats.totalEarnings': -1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

// Virtual for formatted total earnings
UserSchema.virtual('formattedTotalEarnings').get(function() {
    return `${this.stats.totalEarnings} DAT`;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to update timestamps
UserSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
UserSchema.methods.updateLastLogin = function() {
    this.lastLoginAt = new Date();
    return this.save();
};

// Instance method to increment stats
UserSchema.methods.incrementStat = function(statName, amount = 1) {
    if (this.stats[statName] !== undefined) {
        this.stats[statName] += amount;
        return this.save();
    }
    throw new Error(`Invalid stat name: ${statName}`);
};

// Static method to find by address
UserSchema.statics.findByAddress = function(address) {
    return this.findOne({ address: address.toLowerCase() });
};

// Static method to find by username
UserSchema.statics.findByUsername = function(username) {
    return this.findOne({ username: username.toLowerCase() });
};

// Static method to get top earners
UserSchema.statics.getTopEarners = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ 'stats.totalEarnings': -1 })
        .limit(limit)
        .select('username profile stats.totalEarnings stats.totalDataStreams');
};

// Static method to search users
UserSchema.statics.search = function(searchQuery, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = {
        isActive: true,
        $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { 'profile.firstName': { $regex: searchQuery, $options: 'i' } },
            { 'profile.lastName': { $regex: searchQuery, $options: 'i' } }
        ]
    };

    return this.find(filter)
        .sort({ 'stats.totalEarnings': -1 })
        .skip(skip)
        .limit(limit)
        .select('username profile stats');
};

module.exports = mongoose.model('User', UserSchema);
