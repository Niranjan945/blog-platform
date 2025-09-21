const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title must be provided'],
        trim: true,
        minlength: [3, 'Title should be at least 3 characters'],
        maxlength: [100, 'Title should not exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Content cannot be empty'],
        minlength: [5, "Content should be at least 5 characters"],
        maxlength: [50000, "Content cannot exceed 50,000 characters"]
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
        default: [],
        validate: {
            validator: (arr) => arr.length <= 10,
            message: 'A post cannot have more than 10 tags'
        }
    },
    image: {
        type: String,
        default: '',
        validate: {
            validator: val => {
                return val === '' || /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(val);
            },
            message: 'Image must be a valid URL'
        }
    },
    likes: {
        type: Number,
        default: 0,
        validate: {
            validator: val => val >= 0,
            message: 'Likes cannot be negative'
        }
    },
    views: {
        type: Number,
        default: 0,
        validate: {
            validator: val => val >= 0,
            message: 'Views cannot be negative'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
