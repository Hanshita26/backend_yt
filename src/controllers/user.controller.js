import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/appError.js';
import {User}from '../models/user.modal.js';
import { filepath } from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js"
import { application } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const generateAccessTokenAndRefereshToken = async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken= User.generateAccessToToken();
        const refreshToken=User.generateRefreshToken();

        // refersh token should be stored in database 

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}


    }catch(err){
        throw new ApiError(500,"something went wrong while generating refersh and access token");
    }

}


// REGISTER PAGE -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
        // STATUS CODE AND MESSAGE
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
    // use of operators

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

// from cloudinary.js
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


    // it's a syntax where we put '-' in front of fields which are not required
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



// LOGIN PAGE -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const loginUser= asyncHandler(async (req,res)=>{
    // all the data is stored in a database
    // when user will try to login , it will enter 2 or more required fields(email,password or phone number,password)
    // it will use that and if that is expired , use referesh token to login 
    // check if what user entered and what is saved in memory matches or not
    // send response to user accordingly


    // deconstructor
    const {email,password}=req.body;

    if(email==="" || !email ){
        throw new ApiError(400,"Email is required!");
    }

    if(password==="" || !password){
        throw new ApiError(400,"password is required!");
    }

    const user=await User.findOne({email})
    if(!user){
        throw new ApiError(400,"User must register first!");
    }

    // isPasswordCorrect from userModal - bcrypt.compare
    const isValidPassword = await user.isPasswordCorrect(password);
    if(!isValidPassword){
        throw new ApiError(400,"password is incorrect!");
    }

    // access and refresh token:-
    // we have created a function because it will be used multiple times

    const {accessToken,refreshToken}=await generateAccessTokenAndRefereshToken(user._id);

    
    const loggedInUser =await User.findById(user._id)
    .select("-password -refershToken")

    // cookies - storage
    const options={
        httpOnly:true, // frontend cannot modify it with this option
        secure:true,
        sameSite: "strict",

    }

    return res.status(200)
    // key,value,options
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
           "User logged In successfully!",

        )
    )


})

// LOGOUT ---------------------------------------------------------------------------------------------------------------------------------------------------------

const userLoggedout=asyncHandler(async(req,res)=>{

    // clicks on logout button in frontend
    // clear cookies
    // access token and refersh token -
    // get back to previous or home page/ end the session cleanly
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }

        },
        {
            new:true

        }

    )

    const options={
        httpOnly:true, // frontend cannot modify it with this option
        secure:true,
        sameSite: "strict",

    }

    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully!")); 



})



export {registerUser,loginUser,userLoggedout}