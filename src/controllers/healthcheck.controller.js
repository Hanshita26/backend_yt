import mongoose from 'mongoose';
import {ApiError} from '../utils/appError.js';
import ApiResponse from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {User} from '../models/user.modal.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const healthcheck=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    if(!userId){
        throw new ApiError(404,"user id not foumd!");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{},"Everything is working perfectly!")
    )

})


export {healthcheck}
