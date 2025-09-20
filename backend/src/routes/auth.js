const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const User = require('../models/user');
const {authenticateToken} = require('../middleware/auth');

const router = express.Router();

const createToken = (userId, userName, userEmail)=>{
    return jwt.sign(
        { 
            id: userId, 
            name: userName,
            email: userEmail 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working!' });
});

router.post('/register',async (req,res)=>{

   try {
     const {name, email, password, bio}=req.body;

    if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Name, email and password are required' 
            });
    };


    const existingUser= await  User.findOne({email:email.toLowerCase()});
    if(existingUser){
        return res.status(400).json({
            error:'User already exists'
        });
    }

    const saltrounds=10;
    const hashedPassword= await bcrypt.hash(password , saltrounds);

    const newUser = new User({
        name:name.trim(),
        email:email.toLowerCase().trim(),
        password:hashedPassword,
        bio:bio || ''
    });

    const savedUser = await newUser.save();

    const token = createToken(savedUser._id , savedUser.name ,savedUser.email);

     res.status(201).json({
            message: 'User registered successfully',
            token: token,
            user: savedUser.getPublicProfile()
                
            
        });
    
   } catch (error) {

    if (error.name === 'ValidationError')
         {
            return res.status(400).json({ 
                error: error.message 
            });
        }

    if (error.code === 11000)
         {
            return res.status(400).json({ 
                error: 'Email already registered' 
            });
        }
    
    console.log('Registration error:', error);
        res.status(500).json({ 
            error: 'Something went wrong during registration' 
        });


   }


});

//login route

router.post('/login',async (req,res)=>{
    try {

        const{email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({
                error:"Both fields are required"
            })
        }

        const userInfo= await User.findOne({email: email.toLowerCase()})
        if(!userInfo){
            return res.status(400).json({
                error:"Invalid Credentials"
            });
        }

        const passcompare= await  bcrypt.compare(password,userInfo.password);
        if(!passcompare){
            return res.status(400).json({
                error:"Invalid Credentials"
            });
        }

        const jwtToken= createToken(userInfo._id , userInfo.name , userInfo.email);

        console.log("new login detected for the user :",userInfo.name)
        console.log(jwtToken);

        res.status(200).json({
            message: 'Login successfull',
            token: jwtToken,
            user: userInfo.getPublicProfile()
            
                
            
        });
       
        
        
    } catch (error) {
        console.log('Login error:', error);
        res.status(500).json({ 
         error: 'Something went wrong during Login' 
        });
        
    }
})

router.get('/me',authenticateToken,(req,res)=>{

    try {

        if (!req.user) {
            return res.status(500).json({ 
                error: 'Authentication succeeded but user not found' 
            });
        }

        const userProfile = req.user.getPublicProfile();

         res.status(200).json({
            message: 'User profile retrieved successfully',
            user: userProfile
        });


    } catch (error) {
       console.log('Get profile error:', error);
        res.status(500).json({ 
            error: 'Server error while retrieving profile' 
        });
    }
})

module.exports = router