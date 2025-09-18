import mongoose from 'mongoose';

const tweetsSchema=new mongoose.Schema(
    {
        // id is generated automatically
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
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