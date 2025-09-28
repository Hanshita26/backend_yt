import mongoose,{isValidObjectId} from "mongoose";
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {PlayList} from '../models/playlist.modal.js';
import {User} from '../models/user.modal.js';

const createPlaylist=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;

    if(!name || name.trim()===""){
        throw new ApiError(400,"name of playlist not found!");
    }

    if(!description || description.trim()===""){
        throw new ApiError(400,"description of playlist not found!");
    }

    // who is creating the playlist
    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"User not found!");
    }

    // UNCOMMENT IT ONCE VIDEO CONTROLLER IS READY ----------------------------------------

    // const {videoId}=req.params;
    // if(!videoId){
    //     throw new ApiError(400,"Video id not found!");
    // }

    // aggregation pipeline - user details who created the playlist

    const playlist=await PlayList.create(
        {
            owner:userId,
            // videos:[videoId], // multiple videos - so array
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

    const {playlistId}=req.params;
    if(!playlistId){
        throw new ApiError(400,"playlist id not found!");
    }

    const deletedPlaylist=await PlayList.findByIdAndDelete(playlistId);
    if(!deletedPlaylist){
        throw new ApiError(400,"playlist to delete not found!");
    }

    console.log(deletedPlaylist);

    return res.status(200)
    .json(
        new ApiResponse(200,{deletedPlaylist},"playlist deleted successfully!")
    )
    
})

const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if(!playlistId){
        throw new ApiError(400,"Playlist id not found!");
    }

    // const playlistById=await PlayList.findById(playlistId);
    const result=await PlayList.aggregate([{
        $match:{_id:new mongoose.Types.ObjectId(playlistId)},

    },{
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"UserInfoFromPlaylist"
        }

    },{$unwind:"$UserInfoFromPlaylist"},{
        $project:{
            username:"$UserInfoFromPlaylist.username",
            fullName:"$UserInfoFromPlaylist.fullName",
            name:1,
            description:1,
        }
    }])

    if(!result){
        throw new ApiError(400,"playlist by id not found!");
    }


    res.status(200)
    .json(
        new ApiResponse(200,{result},"Playlist by id fetched")
    )
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params; // particular playlist I want to update
    if(!playlistId){
        throw new ApiError(400,"Playlist id not found!");

    }
    const {name}=req.body;
    const {description}=req.body;
    if(!name || name.trim()===""){
        throw new ApiError(404,"name to update not found!");
    }

    if(!description || description.trim()===""){
        throw new ApiError(404,"description to update not found!");
    }


    const updatedPlaylist=await PlayList.findByIdAndUpdate(
        playlistId,
        {
        name:name,
        description:description,
    },{
        new:true,
    })

    if(!updatedPlaylist){
        throw new ApiError(400,"playlist not updated");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{updatedPlaylist},"PLaylist has been updated")
    )


})

export {
    createPlaylist,getUsersPlaylist,deletePlaylist,updatePlaylist,getPlaylistById
}