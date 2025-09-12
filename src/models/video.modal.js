import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema=new mongoose.Schema(
    {
        id:{
            type:Number,
            unique:true,
        },
        videoFile:{
            type:String, // cloudinary url
            required:true,

        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",

        },
        title:{
            type:Number,
            required:true,
            unique:true,

        },
        description:{
            type:String,
            required:true,


        },
        thumbnail:{  // cloudinary url
            type:String,
            required:true,


        },
        duration:{  // cloudinary url  
            type:Number,
            required:true,

        },
        views:{
            type:Number,
            required:true,

        },
        isPublished:{
            type:boolean,
            required:true,

        },



    },
    
    {timestamps:true});


videoSchema.plugin(mongooseAggregatePaginate) // we can aggregate pipelines through this


export const Video=mongoose.model("Video",videoSchema);