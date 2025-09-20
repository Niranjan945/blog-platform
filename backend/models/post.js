const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    
    title:{
        type:String,
        required:[true,'Title must be provided'],
        trim:true,
        minlength:[5,'Title should be greater than 5 valid characters'],
        maxlength:[100,'Title should not exceed 100 characters']
    },
    content : {
        type:String,
        required:[true,'content cant be empty.. '],
        trim:true,
        minlength :[10,"Minimum content should be 10 characters"],
        maxlength :[1000,"Cannot upload content of more than 1000 characters..."]
    },
    authorId :{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    authorName :{
        type:String,
        required:true,
        trim:true
    },
    tags:{
        type:[String],
        default:[],
        validate: 
        {
             validator: (arr) => arr.length <= 10,
             message: 'A post cannot have more than 10 tags'
        }
    },
    image: {
          type: String,
          default: '',
          validate: {
                  validator: val => {
                 // Allow empty string or valid URL
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

},{
    timestamps:true
}

);

module.exports=mongoose.model('Post',postSchema);