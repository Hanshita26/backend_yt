import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// import userRouter from './routes/user.routes.js'

import express from 'express';
const app=express();

// cors settings
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

// security practises
app.use(express.json({
    limit:"16kb",
}))

// url settings , urls comes in diff format so standardize that so that express can understand
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

// to keep images,fevicon which is accessible to all
app.use(express.static("public"))

// cookieparser
app.use(cookieParser())

// routes imported
import userRouter from './routes/user.routes.js'

// so earlier we were simply using - app.get('/',(req,res)=.{
// res.send("this is a home page")}) but now controllers and routes are separted
// so we need to follow a diff syntax
// routes declaration:-


// go to users section and there /register is defined
// http://localhost:8000/api/v1/users/register

app.use('/api/v1/users',userRouter)
// console.log(`app is listening on: http://localhost:${process.env.PORT}/api/v1/users/register`);
// app.get("/",(req,res)=>{
//     res.send("API is working!");
// })



export {app}