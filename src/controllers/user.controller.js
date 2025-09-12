import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/appError.js';
import {User }from '../models/user.modal.js';
import { filepath } from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js"


const registerUser=asyncHandler(async (req,res)=>{

    //steps to follow for registerations:-
    // 1. get user details from frontend-form 
    // 2. validation of each entity - not empty
    // check if user already exists - check from username nd email
    // 3. before processing storage - password - bcrypt and JWT usage
    // 4. store it in database - create object using .create
    // 5. send response acc to client

    const {fullName,username,email,password}=req.body
    console.log("email:",email, "password:",password,"username:",username,"fullName:",fullName);
    console.log(req.files);     
    if(fullName.trim()==="" || !fullName){
        throw new ApiError(400,"Full Name is required!");
    }

    if(username.trim()==="" || !username){
        throw new ApiError(400,"Email is required!");
    }

    if(password.trim()==="" || !password){
        throw new ApiError(400,"Password is required!");
    }

    if(email==="" || !email.includes("@") || !email){
        throw new ApiError(400,"Proper Email is required!");
    }

    // check if username already exists or not 

    // User.findOne({username})- this will check and match with the username - find or findOne method can be used
    // another method to check if username exists , check for mail or if mail exits , check for username 

    const existingUser=await User.findOne({
        $or:[{username},{email}]

    })

    if(existingUser){
        throw new ApiError(409,"User already exists");
    }

    //handling images - avatar 
    // optional chaining is used - if files exists, then gives first uploaded file and then give its path
    const avatarLocalPath=req.files?.avatar[0]?.path;

    // similarly for local image
    const coverImageLocalpath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is a mandatory field!");

    }

    if(!coverImageLocalpath){
        throw new ApiError(400,"Cover Image is a mandatory field!");
    }


    // cloudinary upload
console.log("control reached here1");

    const avatarCloudinaryPath=await filepath(avatarLocalPath); // await is mandatory
    const coverImageCloudinaryPath=await filepath(coverImageLocalpath);
    console.log("control reached here2");
    if(!avatarCloudinaryPath){
        throw new ApiError(404,"Avatar is required");
    }


    // DB entry
    // User is picked from UserModal- it interacts with database using .create method
    const user = await User.create({
        fullName,
        avatar:avatarCloudinaryPath.url,
        coverImage:coverImageCloudinaryPath?.url || "", // because coverImage is not a mandatory field
        email,
        password,
        username,

    })


    // it's a syntax where we put - in front of fields which are not required
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user!");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,createdUser,"User Registered successfully!"));


})

export {registerUser}