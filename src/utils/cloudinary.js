import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; // file system - already present in node.js package

import dotenv from 'dotenv';
dotenv.config({path:"./.env"});
// what strategy we are following is ki whatever user will upload will go to server as local storage 
// and then from local storage to cloudinary - professional setup(rest we can do directly also).



const filepath=async (localfilepath)=>{
    try{
        console.log(process.env.CLOUDINARY_API_KEY);
        console.log("util");
        if(!localfilepath){
            return null;
        }
        console.log("herer2")

        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        });
        console.log(response);

        fs.unlinkSync(localfilepath); // when updated on cloudinary, delete it from local storage
        console.log("control never reached here");

        console.log("file has been uploaded successfully!");
        console.log("URL:",response.url);
        return response;

    }catch(err){
        fs.unlinkSync(localfilepath); // remove from server - so that malicious files are not stored
        console.log(err);
        process.exit(1);
    }

}

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME ,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

export {filepath}