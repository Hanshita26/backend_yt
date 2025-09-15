import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/appError.js';
import {User}from '../models/user.modal.js';
import { filepath, deleteOldPath} from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js"
import { application } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from 'jsonwebtoken';


// import dotenv from './.env'

const generateAccessTokenAndRefereshToken = async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken= user.generateAccessToToken();
        const refreshToken=user.generateRefreshToken();

        // refresh token should be stored in database - user.save()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}


    }catch(err){
        throw new ApiError(500,"something went wrong while generating refresh and access token");
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
    console.log("call returned from filepath function and response saved in avatar cloudinary path variable",avatarCloudinaryPath);
    console.log("control reached here2");
    if(!avatarCloudinaryPath){
        throw new ApiError(404,"Avatar is required");
    }


    // DB entry
    // User is picked from UserModal- it interacts with database using .create method
    const user = await User.create({
        fullName,
        avatar:avatarCloudinaryPath.url,
        avatar_publicId:avatarCloudinaryPath.public_id,
        coverImage:coverImageCloudinaryPath?.url || "", // because coverImage is not a mandatory field
        coverImage_publicId:avatarCloudinaryPath.public_id,
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
    console.log("Login initiated")
    const {email,password}=req.body;

    if(!email ){
        throw new ApiError(400,"Email is required!");
    }

    if(!password){
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


    console.log("reached here ----");

    const {accessToken,refreshToken}=await generateAccessTokenAndRefereshToken(user._id);
    console.log(accessToken,refreshToken);
    console.log("couldn't reach here");

    
    const loggedInUser =await User.findById(user._id)
    .select("-password -refershToken")

    // cookies - storage
    const options={
        httpOnly:true, // frontend cannot modify it with this option
        secure:true,
        // sameSite: "strict",

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
        // sameSite: "strict",

    }

    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully!")); 



})

// TOKEN ENDPOINTS ----------------------------------------------------------------------------------------------------------------------------------------------
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh token not found");
    }

    try{
        const decodedToken=jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    if(!decodedToken){
        throw new ApiError(401,"token not found!");
    }

    const user=await User.findById(decodedToken?._id);

    if(!user){
        throw new ApiError(401,"Invalid refresh token")
    }


    // when we created refreshToken-it was saved in database as well 
    // if they match , means its valid

    if(user?.refreshToken!==incomingRefreshToken){
        throw new ApiError(404,"Tokens not matched")
    }

    const options={
        httpOnly:true,
        secure:true,
    }

    const {accessToken,refreshToken:newRefreshToken}=await generateAccessTokenAndRefereshToken(user._id);

    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", newRefreshToken,options)
    .json(
        new ApiResponse(
            200,{
                accessToken,refreshToken:newRefreshToken
            },"Refresh Token created again!"
        )
    )  
    }catch(err){
        console.log(err || "There is some error generating the tokens");
    }

})

// video related logic

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldpassword,newPassword,confirmNewPassword}=req.body;

    if(!(newPassword===confirmNewPassword)){
        throw new ApiError(400,"New password and confirmed passwords not matched!");
    }

    console.log(req);

//     if (!User.findById(user?._id)) {
//     throw new ApiError(401, "Unauthorized. Please login again.");
//   }

    const user=await User.findById(req.user?._id).select("+password")
    if(!user){
        throw new ApiError(401,"user not found!");
    }
    const checking=await user.isPasswordCorrect(oldpassword);

    if(!checking){
        throw new ApiError(401,"password not matched!");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"password changed successfull!")
    )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(200,req.user,"Current user found!");
    
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {email,fullName}=req.body;

    if(!fullName || !email){
        throw new ApiError(400,"Fields required!")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {$set:{ // used set operator
            fullName,
            email
        }},
        {new:true},
        ).select("-password -refreshToken")

        return res.status(200).json(
            new ApiResponse(200,{},"Account details updated successfully!")
        )

    
})

const updateAvatar=asyncHandler(async(req,res)=>{
    // file - from multer
    const avatarLocalPath=req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar not found!")
    }

    // file path is a method in cloudinay.js - that helps to upload 
    console.log(req.user);
     const deleted=await deleteOldPath(req.user.avatar_publicId);
    if(!deleted){
        throw new ApiError(404,"old avatar not deleted");
    }

    const newAvatar=await filepath(avatarLocalPath)
    if(!newAvatar.url){
        throw new ApiError(404,'Error while uploading on cloudinary')
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:newAvatar.url,
                avatar_publicId:newAvatar.public_id
            },
        },{
            new:true,
        }
    ).select("-password");

    console.log("reached till here ----");
    console.log(req.user.avatar_publicId);

    // delete old avatar

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Avatar updated successfully!")
    )
    




})


const updateCoverImage=asyncHandler(async(req,res)=>{
    const coverImagePath=req.file?.path;

    if(!coverImagePath){
        throw new ApiError(401,"CoverImage is required");
    }
    // const oldImagePublicId=req.user?.coverImage_publicId

    // if(oldImagePublicId){
    //     await deleteOldPath(user.coverImage_publicId);
    // }


    const coverImage=await filepath(coverImagePath)
    if(!coverImage.url){
        throw new ApiError(401,"coverImage is missing");
    }


    const user=await User.findByIdAndUpdate(req.file?._id,{
        $set:{
            coverImage:coverImage.url
        }

    },{
        new:true,
    }).select("-password");


    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"CoverImage updated successfully!")
    )
})


export {registerUser,loginUser,userLoggedout,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateAvatar,updateCoverImage}