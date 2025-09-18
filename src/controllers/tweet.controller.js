// Tweet controller - 
// tweet dal sakti hu, delete,update/edit, watch other tweets

// all are secured routes , so verify JWT is important 
// create tweet-
// space milega tweet page pe - vahan pe I have posted a tweet - req.body - tweet ko mai launfi 
// validations lgaungi , if tweet exists or not and if its empty
// agar tweet hai to I have to make it visible and store it in a database , send response to client


// deletion logic 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/appError.js";
import ApiResponse from "../utils/apiResponse.js";
import { Tweet } from "../models/tweets.modal.js";
import {User} from '../models/user.modal.js'
import mongoose, {isValidObjectId} from 'mongoose';

//1st method

const createTweet=asyncHandler(async(req,res)=>{

    // from fontend
    const {content}=req.body;

    if(!content || content.trim()===""){
        throw new ApiError(404,"Tweet not found!");
    }

    const userId=req.user?._id; // owner can only access it
    if(!userId){
        throw new ApiError(404,"User not authenticated");
    }

    // save in database
    const tweet=await Tweet.create({
        owner:userId,
        content
    })

    return res.status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet uploaded successfully!")
    )


})

// not working properly - I need id to match in deletion case
const getTweet=asyncHandler(async(req,res)=>{
    const tweetId = req.params._id;
    if(!tweetId){
        throw new ApiError(404,"tweet id not found!");
    }

    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweets not found!");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{tweetId},"Current id found!")
    )

})

const updateTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body;
    const {tweetId}=req.params;

    if(!content || content.trim()===""){
        throw new ApiError(404,"Old Tweet not found!");
    }

    if(!tweetId){
        throw new ApiError(404,"Tweet id is required");
    }

    const currUser=req.user?._id;
    if(!currUser){
        throw new ApiError(404,"User not found")
    }

    // remove previous one from database and add new/updated one
    const tweet=await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== currUser.toString()) {
        throw new ApiError(403, "You cannot update someone else’s tweet");
    }

    const updatedTweet=await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },{
            new:true,
        }
    );

    return res.status(200)
    .json(200,{},"Tweet updated successfully!")



})

const deleteTweet=asyncHandler(async(req,res)=>{

    // if tweet exists - put validation first
    // if exists, only its owner can delete it
    // remove it from database

    const tweetId=req.params.id;
    if(!tweetId){
        throw new ApiError(404,"TweetId is required");
    }

    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet not found!");
    }

    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError("You cannot delete someone eles's tweet!")
    }

    const deletion=await Tweet.findByIdAndDelete(tweetId);

    if(!deletion){
        throw new ApiError(500,"Tweet not deleted!");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{tweetId},`${tweetId} Tweet deleted successfully!`)
    )





})



export {
    createTweet,getTweet,updateTweet, deleteTweet
}