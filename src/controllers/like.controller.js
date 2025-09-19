import mongoose,{isValidObjectId} from "mongoose";
import {Like} from '../models/likes.modal.js';
import {Video} from '../models/video.modal.js'
import {Tweet} from '../models/tweets.modal.js';
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {Comment} from '../models/comments.modal.js';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


// function1-
const toggleVideoLike= asyncHandler(async(req,res)=>{
    // if I am authenticated user which will be checked via verifyJwt, then I can like any video and then will be saved in database 
    // toggle option - like-unlike

    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(400,"Video to-like not found!");
    }

    const userId=req.user._id; // user is created in verifyJWT
    if(!userId){
        throw new ApiError(404,"User not found!");
    }

    // find video from video database 
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not in database");
    }

    let message,like;

    const existingLike=await Like.findOne({video:videoId,likedBy:userId})
    if(existingLike){
        await Like.deleteOne({_id:existingLike._id});
        message="Video unliked successfully!";
        like=null;
    }else{
        like =await Like.create({
        likedBy:userId,
        video:videoId,
        
    })
    message="Video liked successfully!";
        
    }

    

    return res.status(200).json(
        new ApiResponse(200,like,message)
    )

})

const toogleTweetLike=asyncHandler(async(req,res)=>{
    // verified user and tweet id needed
    // which tweet is being liked
    // toggle tweet

    const userId=req.user._id;
    if(!userId){
        throw new ApiError(404,"User not found!");
    }

    const {tweetId}=req.params;
    if(!tweetId){
        throw new ApiError(404,"TweetId not found!");
    }

    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet not found!");
    }

    let like,message;

    const existingLike=await Like.findOne({tweet:tweetId,likedBy:userId});
    if(existingLike){
        await Like.deleteOne({_id:existingLike._id});
        message="liked tweet untoggled"
        like=null;
    }
    
    if(!existingLike){
        like=await Like.create({
        likedBy:userId,
        tweet:tweetId,
    })
    message="tweet liked"

    }

    return res.status(200)
    .json(
        new ApiResponse(200,tweet,message)
    )

    

})

const toogleCommentLike=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    if(!userId){
        throw new ApiError(404,"User Id not found!");
    }

    const {commentId}=req.params;
    if(!commentId){
        throw new ApiError(404,"Comment Id not found!");
    }

    const comment=Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"comment not found!");
    }

    let message,like;

    const existingLike=await Like.findOne({likedBy:userId, comment:commentId})
    if(existingLike){
        await Like.deleteOne({_id:existingLike._id});
        like:null;
        message="Unliked comment successfully!";

    }else{
        await Like.create({
        likedBy:userId,
        comment:comment,

    });
    message="Liked comment!";
    }

    return res.status(200)
    .json(
        new ApiResponse(200,comment,message)
    )

    


})

const getLikedVideos=asyncHandler(async(req,res)=>{

    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"User id is not found!");
    }


    const likedVideo=await Like.find({likedBy:userId}).populate({video:"video"});



    return res.status(200)
    .json(
        new ApiResponse(200,likedVideo,"all liked videos extracted successfully!")
    )
})

export {
    toggleVideoLike,
    toogleTweetLike,
    toogleCommentLike,
    getLikedVideos

}

