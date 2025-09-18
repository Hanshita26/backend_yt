import { Router } from "express";
import {createTweet, updateTweet, deleteTweet,getTweet} from '../controllers/tweet.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

// router.use(verifyJWT); - directly applies middleware to all the routes 

router.route('/createTweet').post(verifyJWT,createTweet);
router.route('/:_id').get(verifyJWT,getTweet);
router.route('/updateTweet/:tweetId').post(verifyJWT,updateTweet);
router.route('/delete/:id').delete(verifyJWT,deleteTweet);

export default router