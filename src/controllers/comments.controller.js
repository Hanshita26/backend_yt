import mongoose from 'mongoose';
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {Comment} from '../models/comments.modal.js';

const getVideoComments=asyncHandler(async(req,res)=>{

})

const addComment=asyncHandler(async(req,res)=>{
    // on which video it is being commnted and by which user
    // if all verified, we can create a comment and add it in database and send response

    const {content}=req.body;
    if(!content){
        throw new ApiError(404,"Content not found");
    }
    // const {videoId}=req.params;
    // if(!videoId){
    //     throw new ApiError(404,"Video not found");
    // }

    const userId=req.user._id;
    if(!userId){
        throw new ApiError(404,"UserId not found!");
    }

    // in database
    const comment=await Comment.create({
            content:content,
            owner:userId,
            // video:videoId,

        
    })

    console.log("comment saved");

    return res.status(200)
    .json(
        new ApiResponse(200,comment,"Commented created successfully")
    )



})

const updateComment=asyncHandler(async(req,res)=>{
    // update comment mai user and video pe jake , I can update - findbyidandupdate

    // const {videoId}=req.params;
    // if(!videoId){
    //     throw new ApiError(404,"Video not found");
    // }
    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"userid not found!");
    }

    const {commentId}=req.params;
    if(!commentId){
        throw new ApiError("Comment id not found!");
    }

    const {content}=req.body;
    if(!content){
        throw new ApiError(404,"Comment-to-update not found!")
    }

    const updatedcomment=await Comment.findByIdAndUpdate(
        commentId,
        
        {
        $set:{
            content,
        },

    },{
            new:true
        })

        if(!updatedcomment){
            throw new ApiError(404,"Comment not updated!");
        }

    return res.status(200)
    .json(
        new ApiResponse(200,updatedcomment,"Comment updated successfully!")
    )

    

})

const deleteComment=asyncHandler(async(req,res)=>{
    

})

export {addComment,updateComment,deleteComment,getVideoComments};