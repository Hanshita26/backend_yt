import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

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

export {app}