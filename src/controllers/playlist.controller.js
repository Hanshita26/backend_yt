import mongoose,{isValidObjectId} from "mongoose";
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {PlayList} from '../models/playlist.modal.js';
import { Tweet } from "../models/tweets.modal.js";

const createPlaylist=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;

    if(!name || name.trim()===""){
        throw new ApiError(400,"name of playlist not found!");
    }

    if(!description || description.trim()===""){
        throw new ApiError(400,"description of playlist not found!");
    }

    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"User not found!");
    }

    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(400,"Video id not found!");
    }

    const playlist=await PlayList.create(
        {
            owner:userId,
            videos:[videoId], // multiple videos - so array
            name:name,
            description:description,
        }

    )

    return res.status(200)
    .json(
        new ApiResponse(200,{playlist},"Playlist created successfully!!")
    )
})

const getUsersPlaylist=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"userId not found");
    }

    const usersPlaylist=await PlayList.find({
        owner:userId,
        
    }).populate("videos"); // populate always takes fields from modal , not entire model

    if(!usersPlaylist || usersPlaylist.length===0){
        throw new ApiError(400,"no playlist found for this user");
    }

    const numberofvideos=await PlayList.countDocuments({
        owner:userId,
    })


    return res.status(200)
    .json(
        new ApiResponse(200,{usersPlaylist,
            numberofvideos

        },"Users playlist fetched successfully!")
    )

})

const deletePlaylist=asyncHandler(async(req,res)=>{
    
    
})


export {
    createPlaylist,getUsersPlaylist,deletePlaylist
}