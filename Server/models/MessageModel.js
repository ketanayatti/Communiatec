const mongoose = require('mongoose');
const { encrypt, decrypt, legacyDecrypt } = require('../utils/simpleEncryption');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: false
    },
    messageType: {
        type: String,
        enum: ['text', 'file', 'code'],
        required: true
    },
    content: {
        type: String,
        required: function() {
            return this.messageType === 'text';
        }
    },
    fileUrl: {
        type: String,
        required: function() {
            return this.messageType === 'file';
        }
    },
    timeStamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    reactions: [
        {
            emoji: String,
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ]
});

// Encrypt content before saving
messageSchema.pre('save', function(next) {
    if ((this.isModified('content') || this._needsReencryption) && this.content && this.messageType === 'text') {
        try {
            this.content = encrypt(this.content);
            
            // Clear the re-encryption flag
            this._needsReencryption = undefined;
            
            if (this._needsReencryption) {
                console.log(`Re-encrypted message ${this._id} with new secure encryption`);
            }
        } catch (error) {
            console.error('Encryption failed for message:', this._id, error.message);
            return next(error);
        }
    }
    next();
});

// Decrypt content after loading from DB with backward compatibility
messageSchema.post('init', function(doc) {
    if (doc.content && doc.messageType === 'text') {
        try {
            // Try new encryption first
            doc.content = decrypt(doc.content);
        } catch (e) {
            try {
                // Fallback to legacy encryption for existing data
                doc.content = legacyDecrypt(doc.content);
                
                // Mark for re-encryption on next save
                doc._needsReencryption = true;
            } catch (legacyError) {
                console.error('Failed to decrypt message content with both methods:', {
                    messageId: doc._id,
                    newError: e.message,
                    legacyError: legacyError.message
                });
                // Leave content as-is if both methods fail
            }
        }
    }
});

// Instagram/WhatsApp-style: Only one reaction per user per message, clicking again removes it
messageSchema.methods.toggleReaction = function(emoji, userId) {
    // Find existing reaction by this user
    const existing = this.reactions.find(
        r => r.user.toString() === userId.toString()
    );
    // If user already reacted with this emoji, remove it (unreact)
    if (existing && existing.emoji === emoji) {
        this.reactions = this.reactions.filter(
            r => r.user.toString() !== userId.toString()
        );
    } else {
        // Otherwise, replace or add the reaction
        this.reactions = this.reactions.filter(
            r => r.user.toString() !== userId.toString()
        );
        if (emoji) {
            this.reactions.push({ emoji, user: userId });
        }
    }
    return this.save();
};

module.exports = mongoose.model('Message', messageSchema);