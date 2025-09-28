import mongoose,{isValidObjectId} from "mongoose";
import {Like} from '../models/likes.modal.js';
import {Video} from '../models/video.modal.js'
import {Tweet} from '../models/tweets.modal.js';
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {Comment} from '../models/comments.modal.js';

// function1
const toggleVideoLike= asyncHandler(async(req,res)=>{
    // if I am authenticated user which will be checked via verifyJwt, then I can like any video and then will be saved in database 
    // toggle option - like-unlike

    const {videoId}=req.params;
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Video to-like not found!");
    }

    const userId=req.user._id; // user is created in verifyJWT
    if(!userId){
        throw new ApiError(404,"User not found!");
    }

    let message,like;

    const existingLike=await Like.findOne({video:videoId,likedBy:userId})
    if(existingLike){
        await Like.deleteOne({_id:existingLike._id});
        message="Video unliked successfully!";
        like=null;
    }else{
        like=await Like.create({
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
    if(!tweetId || !isValidObjectId(tweetId)){
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

// get all liked videos 
const getLikedVideos=asyncHandler(async(req,res)=>{

    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"User id is not found!");
    }

    const likedVideos=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videosData",
            }

        },
        {
            $unwind:"$videosData",

        },{
            $project:{
                _id:0,
                owner:"$videosData.owner",
                title:"$videosData.title",
                description:"$videosData.description",
                video:1,
                likedBy:1

            }

        }
    ])

    if(!likedVideos){
        throw new ApiError(200,"Videos not found!");
    }

    if(likedVideos.length===0){
        new ApiResponse(200,{},"Playlist is empty!")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,likedVideos,"all liked videos extracted successfully!")
    )
})

export {
    toggleVideoLike,
    toogleTweetLike,
    toogleCommentLike,
    getLikedVideos

}

