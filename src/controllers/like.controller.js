import mongoose,{isValidObjectId} from "mongoose";
import {Like} from '../models/likes.modal.js';
import {Video} from '../models/video.modal.js'
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';


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

export {
    toggleVideoLike

}