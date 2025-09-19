import { Router } from "express";
import {toggleVideoLike,toogleTweetLike,toogleCommentLike,getLikedVideos} from '../controllers/like.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router=Router();

router.use(verifyJWT);// all the below routes will be secured



// 4 routes-
router.route('/videoLike/:videoId').post(toggleVideoLike);
router.route('/tweetLike/:tweetId').post(toogleTweetLike);
router.route('/commentLike/:commentId').post(toogleCommentLike);
router.route('/getlikedvideos').get(getLikedVideos);


export default router;