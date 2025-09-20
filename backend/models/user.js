const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [4, 'Name must be at least 4 characters'],
        maxlength: [25, 'Name cannot exceed 25 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    bio: {
        type: String,
        default: '',
        maxlength: [150, 'Bio cannot exceed 150 characters']
    },
     profilePic: {
        type: String,
        default: '' // URL to profile image
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true 
}
);

userSchema.methods.getPublicProfile = function() {
    // Return user info without sensitive data (for API responses)
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        bio: this.bio,
        profilePic: this.profilePic,
        createdAt: this.createdAt,
        lastLogin: this.lastLogin
    };
};

module.exports = mongoose.model('User', userSchema);