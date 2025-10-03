import mongoose from 'mongoose';
import {Video} from '../models/video.modal';
import {User} from '../models/user.modal';
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {filepath} from '../utils/cloudinary.js';


const getAllVideos = asyncHandler(async(req,res)=>{
    const {page=1,limit=10,query,sortBy,sortType,userId}=req.query;
    if(!userId){
        throw new ApiError(400,"UserId not found!");
    }
    // get all videos based on query,sort,pagination
    // creating dynamic variables:-
    const options = {
        limit:parseInt(limit),
        page:parseInt(page)

    }

    const sortField=['createdAt','views'];
    const sortOrder=[-1,-1];

    sortField.forEach((field,index)=>{
        sortOptions[field]=sortOptions[index];
    })

    const videos=await Video.find({userId}).toSorted(sortOptions);
})
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}








































