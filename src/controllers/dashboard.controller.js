import mongoose from 'mongoose';
import {ApiError} from '../utils/appError.js'
import ApiResponse from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {Video} from '../models/video.modal.js'
import {Like} from '../models/likes.modal.js';
import {subscription} from '../models/subscription.modal.js';


const getChannelStats=asyncHandler(async(req,res)=>{
    // ek particular channel - 
    // total video views , total subscriber - count, total videos-count , total likes- count
    const {channelId}=req.params;
    if(!channelId){
        throw new ApiError(400,"channel not found!")
    }

    // total video views -----------------------------------------------------
    // owner of video is also the owner of channel
    const totalViews=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(channelId)
            }

        },{
            $group:{
                _id:null,
                totalViews:{
                    $sum:"$views"
                }
            }

        }
    ]);

    const totalViewsCount=totalViews[0]?.totalViews||0; // validation

    // total subscriber -----------------------------------------------------------
    const totalSubscriber=await subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }

        },{
            $group:{
                _id:null,
                totalSubscriber:{
                 $sum:1  
                }
            }

        },{

        }
    ])

    const totalSubscriberCount=totalSubscriber[0]?.totalSubscriber||0;

    // total videos --------------------------------------------
    // in mongoose(if using aggregation pipelines), total count of document as calculated using $group function alogn with $sum:1, it keeps adding 1 for each document
    const totalVideos=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(channelId)
            }

        },{
            _id:null,
            totalVideos:{
                $sum:1
            }
        }
    ]);

    const totalVideosCount=totalVideos[0]?.totalVideos|| 0;


    const totalLikes=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(channelId)
            }

        },{
            $group:{
                _id:null,
                totalLikes:{
                    $sum:1
                }

            }

        }
    ]);

    const totalLikesCount=totalLikes[0]?.totalLikes||0;

    return res.status(200)
    .json(
        new ApiResponse(200,{

        totalViews:totalViewsCount,
        totalSubscriber:totalSubscriberCount,
        totalVideos:totalVideosCount,
        totalLikes:totalLikesCount,
    }, "Here is the statistics of this channel")
)

})

const getChannelVideos=asyncHandler(async(req,res)=>{
    // get all videos uploaded by that channel
    const {channelId}=req.params;
    if(!channelId){
        throw new ApiError(200,"channelId not found!");
    }

    // by defualt values

    const {page=1,total=6}=req.query;
    const pageNum=Number(page);
    const totalNum=Number(total);
    const skip=(pageNum-1)*totalNum;

    const Videos=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(channelId)
            }

        },
        // newly created
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $skip:skip
        },
        {
            $limit:totalNum,

        },
        {
            $project:{
                title:1,
                description:1,
                owner:1,
                thumbnail:1,
                duration:1,
                views:1
            }
        }
    ]);

    return res.status(200)
    .json(
        new ApiResponse(200,{Videos},"All fetched successfully!")
    )

})

export {
    getChannelStats,getChannelVideos
}