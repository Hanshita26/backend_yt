import mongoose,{isValidObjectId} from 'mongoose';
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {subscription} from '../models/subscription.modal.js';
import {User} from '../models/user.modal.js';

// here channel and subsciber both are important- works hand in hand
const toggleSubcription=asyncHandler(async(req,res)=>{
    // channel(channel which we are subscribing) id is being subscribed
    const {channelId}=req.params; // from user controller
    if(!channelId){
        throw new ApiError(404,"ChannelId is not found!");
    }

    // I am subscribing a particular channel so I am the subscriber
    const subscriber=req.user._id;
    if(!subscriber){
        throw new ApiError(404,'Subscriber/user not found!');
    }

    let message; 

    const subscribedAlready=await subscription.findOne({
        subscriber:subscriber,
        channel:channelId,
    });

    if(subscribedAlready){
        await subscription.findOneAndDelete({
            subscriber:subscriber,
            channel:channelId,
        })
        message="already subscribed channel has been unsubscribed!"
    }
    if(!subscribedAlready){
        await subscription.create({
            subscriber:subscriber,
            channel:channelId,
        });
        message="Channel was unsubscribed, so I have subscribed it!";
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{},message)
    )

})

// subscriber list of channel
// user list - all users who have subscribed to that channel
const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
    const {channelId}=req.params; // is particular channel ko kitne logon nai subscribe kiya hai
    if(!channelId){
        throw new ApiError(404,"channelId not found!");
    }

    // const userId=req.user._id;
    // if(!userId){
    //     throw new ApiError(404,"Userid not found!");
    // }

// using .countDocuments to count no. of users
    const whohavesubscribedme=await subscription.find({
        channel:channelId,
    }).populate(
        "subscriber");// list of users

    const totalsubscribers=await subscription.countDocuments({
        channel:channelId
    });

    if(!whohavesubscribedme.length){
        return res.status(200)
        .json(
            new ApiResponse(200,{
                subscriber:[],
                totalsubscribers:0
            },"No subscribers found for this channel!")
        )
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{
            subscribersDetail:whohavesubscribedme,
            totalsubscribers:totalsubscribers },"Here is the list of users who have subscribed to this particular channel")
    )


    
})

const getSubscribedChannel=asyncHandler(async(req,res)=>{
    // here I need to count the no. of channels that I have subscibed to
    const subscriberId=req.user._id; // userid
    if(!subscriberId){
        throw new ApiError(404,"SubscriberId not found");
    }

    const channels=await subscription.find({
        subscriber:subscriberId,
// every channel will have its unqiue channel id
    })
    .select("-password -refreshToken")
    .populate("channel",null,{strictPopulate:false});

    const count=await subscription.countDocuments({
        subscriber:subscriberId,
    })





    return res.status(200)
    .json(
        new ApiResponse(200,{
            channel:channels,
            count:count
        },"Here is a list of channels that I have subscribed on this platform!")
    )
})





export {
    toggleSubcription,
    getUserChannelSubscribers,
    getSubscribedChannel
    
}