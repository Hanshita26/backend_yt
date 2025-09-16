import mongoose from 'mongoose';

const tweetsSchema=new mongoose.Schema(
    {
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            required:"User",
        },
        content:{
            type:String,
            required:true,
        }

    },
    {
    timestamps:true, //created at,updated at
})


export const Tweet=mongoose.model('Tweet',tweetsSchema);