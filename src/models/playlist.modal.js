import mongoose from 'mongoose';


const playListSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            index:true,
            trim:true,
        },
        description:{
            type:String,
            lowercase:true,
            required:true,
        
        },
        videos:{ // multiple videos - apply aggregation pipelines
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",

        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",

        }


},{
    timestamps:true
});

export const PlayList=mongoose.model("PlayList",playListSchema);