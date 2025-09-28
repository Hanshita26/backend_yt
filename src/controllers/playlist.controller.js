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
    // videos which are being added to the playlis

    // const {videoId}=req.body;
    // if(!videoId){
    //     throw new ApiError(400,"Video id not found!");
    // }

    const playlist=await PlayList.create(
        {
            owner:userId,
            // videos:[videoId], // multiple videos - so array
            name:name,
            description:description,
        }

    )

    const populatePlaylist=await PlayList.findById(playlist._id)
    .populate("owner","username email")
    .populate("videos","title description");

    return res.status(200)
    .json(
        new ApiResponse(200,{populatePlaylist},"Playlist created successfully!!")
    )
})

const getUsersPlaylist=asyncHandler(async(req,res)=>{
    // the user whose playlist I would like to show
   const {userId}=req.params;
   if(!isValidObjectId(userId) || !userId){
    throw new ApiError(400,"Invalid UserId!");
   }

   // join user and playlist -------
   const usersPlaylist=await PlayList.aggregate([
    {
        $match:{
            owner:new mongoose.Types.ObjectId(userId),
        },

    },{
        $lookup:{
            from:"users",
            localField:"owner", // playlist name
            foreignField:"_id", // 
            as:"usersPlaylist",
        }
    },{
        $unwind:"$usersPlaylist",
    },{
        $project:{
            name:1,
            description:1,
            username:"$usersPlaylist.username",
            email:"$usersPlaylist.email",
            avatar:"$usersPlaylist.avatar",
        },
    }
   ])

   if(!usersPlaylist || usersPlaylist.length===0){
    throw new ApiError(200,"User playlist not found!");
   }

   return res.status(200)
   .json(
    new ApiResponse(200,{usersPlaylist},"playlist fetched successfully!")
   )

})

const deletePlaylist=asyncHandler(async(req,res)=>{
    // id of playlist to delete
    const {playlistId}=req.params;
    if(!isValidObjectId(playlistId) || !playlistId){
        throw new ApiError(400,"Invalid playlistId!");
    }

    const owner=req.user._id;
    if(!owner){
        throw new ApiError(400,"You are not allowed to delete this playlist!");
    }

    // ensure only owner can delete
    const deletedPlaylist=await PlayList.findByIdAndDelete({
        _id:playlistId,
        owner:owner,
    
    });
    if(!deletedPlaylist){
        throw new ApiError(400,"playlist to delete not found!");
    }

    console.log(deletedPlaylist);

    return res.status(200)
    .json(
        new ApiResponse(200,{deletedPlaylist},"playlist deleted successfully!")
    )
    
})

// It will show the playlist alog with its owner detail
const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if(!playlistId){
        throw new ApiError(400,"Playlist id not found!");
    }

    // const playlistById=await PlayList.findById(playlistId);
    const result=await PlayList.aggregate([{
        $match:{
            _id:new mongoose.Types.ObjectId(playlistId)
        },

    },{
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"UserInfoFromPlaylist"
        }

    },{$unwind:"$UserInfoFromPlaylist"},
    {
        $project:{
            username:"$UserInfoFromPlaylist.username",
            fullName:"$UserInfoFromPlaylist.fullName",
            name:1,
            description:1,
        }
    }
])

    if(!result){
        throw new ApiError(400,"playlist by id not found!");
    }


    res.status(200)
    .json(
        new ApiResponse(200,{result},"Playlist by id fetched")
    )
})

const updatePlaylist=asyncHandler(async(req,res)=>{

    const {name,description}=req.body;
    if(!name || name.trim()===0){
        throw new ApiError(400,"Updated name is needed!");
    }

    if(!description || description.trim()===0){
        throw new ApiError(400,"Updated description is needed!");
    }

    const {playlistId}=req.params; // particular playlist I want to update
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist not found!");
    }

    const updatePlaylist=await PlayList.findByIdAndUpdate(
        playlistId,
        {
            name:name,
            description:description,

    })

    return res.status(200)
    .json(
        new ApiResponse(200,{updatePlaylist},"Playlist updated successfully!")
    )
})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    // the particular playlist I want to add to and the particular video to be added
    const {playlistId,videoId}=req.params;
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist id invalid!");
    }

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId not found or is invalid!");
    }


    // push - to insert value in existing array (here playlist)
    // push can be done at a specific position as well - 
    // give two parameters - $each, $position
    const pushingVideos=await PlayList.findByIdAndUpdate(
        playlistId,
        {
            $push:{
                videos:videoId
            },
        },
        {
            new:true,

        }
    ).populate("videos","title description");

    if(!pushingVideos){
        throw new ApiError(400,"no new video has been added!");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{pushingVideos},"Video successfully added to playlist!")
    )
    
})


const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params;

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist id invalid!");
    }

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId not found or is invalid!");
    }

    const removeVideo=await PlayList.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId
            }

        },{
            new:true
        }
    )

    if(!removeVideo){
        throw new ApiError(400,"Video not removed");
    }

    // check if video still exists in playlist
    if(removeVideo.videos.includes(videoId)){
        throw new ApiError(400,"Video couldnot be removed from the playlist!");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{removeVideo},"Video removed successfully from playlist")
    )
    
    // pull can be used to remove element from the array(here playlist)

})

export {
    createPlaylist,getUsersPlaylist,deletePlaylist,updatePlaylist,getPlaylistById, removeVideoFromPlaylist, addVideoToPlaylist
}