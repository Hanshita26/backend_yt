import dotenv from 'dotenv';

import mongoose from 'mongoose';
import {DB_NAME} from './constants.js'
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({path:"./.env"});
const PORT=process.env.PORT || 8000;


// approach 2 - a better professional approach

// because it is async await and returns a promise
connectDB()
.then((res)=>{
    console.log("it is running successfully!");
    app.on("error",(err)=>{
        console.log("there are some errors present!");
    })
    
    app.listen(PORT,()=>{
        console.log(`port is listening on: http://localhost:${PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO DB CONNECTED FAILED!!!",err)
});


// 1st approach but it pollutes the index.js file
/*
import express from 'express';
const app=express();
const PORT=process.env.PORT || 3000;


app.get('/',(req,res)=>{
    res.send("welcome to home page");
})


app.listen(PORT,()=>{
    console.log(`listening on port: http://localhost:${PORT}`);
})


// way 1---------------------------------------------------------------------------------------------
// function connectDB(){

// }

// connectDB();


// way2---------------------------------------------------------------------------------------
//IIFE approach - ki directly and turant hi implement karna start kardo
// immediately invoked function expression
// start with with semi colon - its a profesional approach , so that agar peechli line mai semi colon nahi bhi ho to it will not give any error


// database connection - always use try-catch - it throws good amount of error 
;( async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("application is not able to talk to database - express app");
            throw error
            

        }); // the express ap we initialised can use event listeners and listen to a lot of things
        app.listen(PORT,()=>{
    console.log(`listening on port: http://localhost:${PORT}`);
})

    }catch(err){
        console.log('I will print the error related to database');
        console.log(err);
        throw err;
    }

})


*/