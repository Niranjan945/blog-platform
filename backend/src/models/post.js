const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title must be provided'],
        trim: true,
        minlength: [1, 'Title cannot be empty'],
        maxlength: [200, 'Title should not exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Content cannot be empty'],
        // Remove all validation except required
        minlength: [1, "Content cannot be empty"]
        // Remove maxlength temporarily to test
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    authorName: {
        type: String,
        required: true,
        trim: true
    },
    tags: {
        type: [String],
        default: []
        // Remove validation temporarily
    },
    image: {
        type: String,
        default: ''
        // Remove validation temporarily
    },
    likes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
