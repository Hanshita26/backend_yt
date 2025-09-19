import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const likeSchema=new mongoose.Schema(
    {

        comment:{
             type:mongoose.Schema.Types.ObjectId,
                        ref:"Comment",

        },
        video:{
             type:mongoose.Schema.Types.ObjectId,
                        ref:"Video",

        },
        likedBy:{ // user
            type:mongoose.Schema.Types.ObjectId,
                        ref:"User",
                        required:true,

        },
        tweet:{
            type:mongoose.Schema.Types.ObjectId,
                        ref:"Tweet",

        }
    },
    
    {timestamps:true});

likeSchema.plugin(mongooseAggregatePaginate);

export const Like=mongoose.model("Like",likeSchema);