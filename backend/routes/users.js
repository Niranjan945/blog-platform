const { default: mongoose } = require('mongoose');

const express = require('express');
const User = require('../models/user');
const Post = require('../models/post');
const {authenticateToken}= require('../middleware/auth');
const router=express.Router();

router.get('/profile',authenticateToken, async(req , res)=>{
    try {
        const profile = req.user.getPublicProfile();

        const postsData = await Post.find({ authorId: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Profile retrieved successfully',
            profile: profile,
            posts: postsData,
            postsCount: postsData.length
        });

    } catch (error) {
        console.error('Error retrieving profile:', error);
        return res.status(500).json({
            error: 'Error while retrieving profile'
        });
    }
});

// NEW: Get any user by ID (public profile)
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userPosts = await Post.find({ authorId: userId })
            .sort({ createdAt: -1 });
            
        const publicProfile = user.getPublicProfile();
        
        return res.status(200).json({
            message: 'User profile retrieved successfully',
            user: publicProfile,
            posts: userPosts,
            postsCount: userPosts.length
        });
        
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        return res.status(500).json({
            error: 'Error while retrieving user profile'
        });
    }
});

// NEW: Get current user's posts only
router.get('/posts/me', authenticateToken, async (req, res) => {
    try {
        const userPosts = await Post.find({ authorId: req.user._id })
            .sort({ createdAt: -1 });
            
        return res.status(200).json({
            message: 'User posts retrieved successfully',
            posts: userPosts,
            postsCount: userPosts.length
        });
        
    } catch (error) {
        console.error('Error retrieving user posts:', error);
        return res.status(500).json({
            error: 'Error while retrieving user posts'
        });
    }
});

//editing profile
router.put('/profile', authenticateToken, async (req, res) => {
   try {
    let { name, email, bio, profilePic } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email fields are required!' });
    }
    name = name.trim();
    email = email.trim();

    // Prevent duplicate email
    const emailOwner = await User.findOne({ email, _id: { $ne: userId } });
    if (emailOwner) {
      return res.status(400).json({ error: 'Email already in use by another user' });
    }

    // Build update object
    const updateFields = { name, email };
    if (bio !== undefined) updateFields.bio = bio;
    if (profilePic !== undefined) updateFields.profilePic = profilePic;

    // Perform update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );

    const profileData = updatedUser.getPublicProfile();
    return res.status(200).json({
      message: 'Profile updated successfully!',
      profile: profileData
    });

   } catch (error) {
     
     console.error('Error updating profile:', error);
     
     if (error.name === 'ValidationError') {
       return res.status(400).json({
         error: 'Validation failed',
         details: error.message
       });
     }

     return res.status(500).json({
       error: 'Error while updating profile'
     }); 
   }
});

module.exports=router;
