// it will only verify if user exists or not
// it will be used in almost every route 
// logic is ki tum kisi bhi page pe ho for instance you put something inside cart but in order to buy , you must login so it keeps a check of that
// import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.modal.js";
import { ApiError } from "../utils/appError.js";
export const verifyJWT= async(req,_,next)=>{
try{
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

if(!token){
    throw new ApiError(401,"Unauthorized request!");
}

const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRETKEY);
const user=await User.findById(decodedToken?._id).select("-password -refreshToken")

if(!user){
    // frontend discussion- 
    throw new ApiError(404,"Invalid access token");
}

req.user=user;
next();

}catch(err){
    throw new ApiError(404,err.message||"Not a valid user!");
    // process.exit(1);

}


}
