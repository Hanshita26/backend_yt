import mongoose from 'mongoose';
// import constants from "../constants.js";
import {DB_NAME} from '../constants.js'

// If your app cannot connect to the database, it’s useless to keep running (routes will break).
// process.exit(1) immediately shuts down the app instead of keeping a “half-dead” server running.

const connectDB= async ()=>{
    try{
        console.log("MONGODB_URL from env:", process.env.MONGODB_URL);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n mongodb connected !! DB HOST:${connectionInstance.connection.host}`);

    }catch(err){
        console.log(err);
        process.exit(1);
    }
};

export default connectDB;