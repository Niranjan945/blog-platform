const express = require('express');
const Post = require('../models/post');
const {authenticateToken} = require('../middleware/auth');
const { mongo, default: mongoose } = require('mongoose');

const router = express.Router();

// GET /api/posts - Public: List all posts
router.get('/', async (req, res) => {
  try {
    // Extract and set defaults
    const page = parseInt(req.query.page) || 1;        
    const limit = parseInt(req.query.limit) || 10;     
    const search = req.query.search || '';             

    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // Get paginated posts
    const allposts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    return res.status(200).json({
      message: 'Posts retrieved successfully',
      posts: allposts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts: totalPosts,
        hasNextPage: page < Math.ceil(totalPosts / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error retrieving posts:', error);
    return res.status(500).json({
      error: 'Error while retrieving posts'
    });
  }
});

// GET /api/posts/:id - viewing single post - access:public
router.get('/:id', async (req, res) => {
  try {
    // Validating id 
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const userPost = await Post.findById(id);
    if (!userPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({
      message: 'Post retrieved successfully',
      userPost
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({
      error: 'Error while retrieving the post'
    });
  }
});


// POST /api/posts - Creating a new post - access:private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, image } = req.body;
    
    // Basic required field check
    if(!title || !content){
      return res.status(400).json({
        error:'Title and content are required'
      });
    }

    // Check if content has meaningful characters (not just spaces)
    if(content.trim().length < 5) {
      return res.status(400).json({
        error:'Content must contain at least 5 meaningful characters'
      });
    }

    // Process tags - handle string or array
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => tag && tag.trim());
      }
    }

    const newPost = new Post({
      title: title.trim(), 
      content, 
      authorId: req.user._id,
      authorName: req.user.name,
      tags: processedTags,
      image: image || '',
      likes: 0,
      views: 0  
    });

    const savePost = await newPost.save();

    return res.status(201).json({
      message: 'Post created successfully',
      post: savePost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        errors: error.errors
      });
    }

    return res.status(500).json({
      error: 'Error while creating post'
    });
  }
});


// PUT /api/posts/:id - route for editing the post - access:private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {id} = req.params;
    const {title, content, tags, image} = req.body;
    const userId = req.user._id; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Convert ObjectId to string for comparison
    if (existingPost.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        error: 'Forbidden: You can only edit your own posts' 
      });
    }

    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        content: content.trim(), 
        tags: tags || existingPost.tags,        // Keep old tags if none provided
        image: image !== undefined ? image : existingPost.image  // Keep old image if none provided
      },
      { 
        new: true,           // Return updated document
        runValidators: true  // Run schema validations
      }
    );

    return res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Error updating post:', error);
    
    // Handle validation errors - UPDATED TO RETURN PROPER FORMAT
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        errors: error.errors  // This will contain field-specific errors
      });
    }

    return res.status(500).json({
      error: 'Error while updating post'
    });
  }
});

// DELETE /api/posts/:id - deleting post - access: private
router.delete('/:id', authenticateToken, async(req, res) => {
  try {
    const {id} = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({
        error:"Invalid postID"
      });
    }

    const userId = req.user._id;
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        error: 'Forbidden: You can only delete your own posts' 
      });
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({
      message: 'Post deleted successfully'
    }); 
    
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({
      error: 'Error while deleting post'
    });
  }
});

module.exports = router;
