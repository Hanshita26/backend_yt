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
    if(!isValidObjectId(channelId)){
        throw new ApiError(404,"ChannelId is not found!");
    }
  console.log(channelId);
    // I am subscribing a particular channel so I am the subscriber
    const subscriber=req.user._id;
    if(!isValidObjectId(subscriber)){
        throw new ApiError(404,'Subscriber/user not found!');
    }

    let message; 

    const subscribedAlready=await subscription.findOne({
        subscriber:subscriber,
        channel:channelId,
    });
    console.log(subscribedAlready)

    if(subscribedAlready){
        await subscription.findOneAndDelete({
            subscriber:subscriber,
            channel:channelId,
        })
        message="already subscribed channel has been unsubscribed!"
    }else{
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
    if(!isValidObjectId(channelId)){
        throw new ApiError(404,"channelId not found!");
    }

    if(!channelId){
        throw new ApiError(400,"Invalid id!");
    }

// detail of users - aggregation pipelines
// using .countDocuments to count no. of users

const userDetails=await subscription.aggregate([
    {
        $match:{
            channel:new mongoose.Types.ObjectId(channelId)
        }


},
{
    $lookup:{
        from:"users", // make first letter small and make it plural
        localField:"subscriber",
        foreignField:"_id",
        as:"ListOfUsers"
    }

},
{
    $unwind:"$ListOfUsers"

},{
    $project:{
        username:"$ListOfUsers.username",
        email:"$ListOfUsers.email",
        channelId:1,
    }
}
])  

if(userDetails.length===0){
    throw new ApiError(400,"User details not available");
}

const countUsers=userDetails.length;
return res.status(200)
.json
    (new ApiResponse(200,{userDetails,countUsers },"Here is the list of users who subscribed this channel!"));



})

const getSubscribedChannel=asyncHandler(async(req,res)=>{
    // here I need to count the no. of channels that I have subscibed to
    const subscriberId=req.user._id; // userid
    if(!subscriberId){
        throw new ApiError(404,"SubscriberId not found");
    }
    console.log(subscriberId)

    const channelDetails=await subscription.aggregate
      (  [{
        $match:{
            subscriber:new mongoose.Types.ObjectId(subscriberId)
        }

        },{
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"Ihavesubscribedthese",
            }

        },{
            $unwind:"$Ihavesubscribedthese"

        },{
            $project:{
                username:"$Ihavesubscribedthese.username",
                email:"$Ihavesubscribedthese.email"
               

            }
        }])
            console.log(channelDetails)

        if(!channelDetails){
            throw new ApiError(400,"Channel details not available")
        }

        if(channelDetails.length===0){
            new ApiResponse(200,"You have not subscribed any channel yet!")
        }

        const count=channelDetails.length;
    
    return res.status(200)
    .json(
        new ApiResponse(200,{
            channelDetails,
            count
        },"Here is a list of channels that I have subscribed on this platform!")
    )
})


export {
    toggleSubcription,
    getUserChannelSubscribers,
    getSubscribedChannel
    
}