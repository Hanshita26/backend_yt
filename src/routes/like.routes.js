import { Router } from "express";
import {toggleVideoLike} from '../controllers/like.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router=Router();

router.use(verifyJWT);// all the below routes will be secured



// 4 routes-
router.route('/videoLike/:videoId').post(toggleVideoLike);


export default router