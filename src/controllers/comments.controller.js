import mongoose from 'mongoose';
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {Comment} from '../models/comments.modal.js';


// first there is a connection between comment and user and then connected with video
const getVideoComments=asyncHandler(async(req,res)=>{
    // get all commments for a video - is particular video ke sare comments
    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(404,"VideoId not found");
    }

    const{page=1,limit=10}=req.query; // default values
    const skip=(page-1)*limit; // consistent formula for skip

    // const videoDetail=await Comment.findById(videoId).select("title description");
    // if(!videoDetail){
    //     throw new ApiError(400,"Video details not found!");
    // }


    const listOfComments=await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
            
        },{
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
            }

        },{
            $unwind:"$ownerDetails", // user model connected

        }, // connecting it with video model
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoDetail",
            }

        },{
            $unwind:"$videoDetail",

        },
        {
            $project:{
                content:1,
                "ownerDetails.username":1,
                "ownerDetails.avatar":1,
                "videoDetail.title":1,
                "videoDetail.description":1,
            }


        },
            {$skip:skip},
            {$limit:parseInt(limit)},
        
    ])

    const countOfComments=await Comment.countDocuments({
        video:new mongoose.Types.ObjectId(videoId)
    });

    if(!listOfComments){
        throw new ApiError(400,"Comments not found!")
    }

    if(countOfComments===0){
        return res.status(200)
        .json(
            new ApiResponse(200,{},"No comment on this video yet!")
        )
        
    }

    return res.status(200)
    .json(
        new ApiResponse(200,
            {listOfComments,countOfComments,page:Number(page),limit:Number(limit)}
            ,"All comments of this video fetched")
    )
});

const addComment=asyncHandler(async(req,res)=>{
    // on which video it is being commented and by which user
    // if all verified, we can create a comment and add it in database and send response

    const {content}=req.body;
    if(!content){
        throw new ApiError(404,"Content not found");
    }

    // on the video where I want to comment-----------------
    // const {videoId}=req.params;
    // if(!videoId){
    //     throw new ApiError(404,"Video not found");
    // }


    // for authentication purpose
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
        throw new ApiError(404,"userid not found!");
    }

    const {commentId}=req.params;
    if(!commentId){
        throw new ApiError(404,"Comment id not found!");
    }

    const {Updatedcontent}=req.body;
    if(!Updatedcontent){
        throw new ApiError(404,"Comment-to-update not found!")
    }

    // only authenticated user will be allowed to update the comment, not everybody can update someone's else comment
    // checking ownership -----------------------------------------
    const comment=await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(400,"Comment not found!");
    }

    if(comment.owner.toString()!==userId.toString()){
        throw new ApiError(400,"you are not a validated user to update the comment");
    }


    const updatedcomment=await Comment.findByIdAndUpdate(
        commentId,
        
        {
        $set:{
            content:Updatedcontent,
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


    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(404,"Video not found");
    }

    const {commentId}=req.params;
    if(!commentId){
        throw new ApiError(404,"Comment not found")

    }

    const userId=req.user._id;
    if(!userId){
        throw new ApiError(404,"Userid not found");
    }

    // checking ownership
    const comment =await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"Comment not found!");
    }

    if(comment.owner.toString()!==userId.toString()){
        throw new ApiError(403,"You are not allowed to delete this comment");
    }

    if(comment.video.toString()!==videoId.toString()){
        throw new ApiError(404,"comment does not belong to this video!")
    }

    const deletedComment= await Comment.findByIdAndDelete(commentId);

    return res.status(200)
    .json(
        new ApiResponse(200,{deletedComment},"Comment deleted")
    )
    

})


export {addComment,updateComment,deleteComment,getVideoComments};