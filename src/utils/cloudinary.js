import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; // file system - already present in node.js package


// what strategy we are following is ki whatever user will upload will go to server as local storage 
// and then from local storage to cloudinary - professional setup(rest we can do directly also).

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME ,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
});

const filepath=async (localfilepath)=>{
    try{
        if(!localfilepath){
            return null;
        }

        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        });

        console.log("file has been uploaded successfully!");
        console.log("URL:",response.url);
        return response;

    }catch(err){
        fs.unlinkSync(localfilepath); // remove from server - so that malicious files are not stored
        console.log(err);
        process.exit(1);
    }

}

export {filepath}