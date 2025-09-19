import Router from 'express';
import {addComment,updateComment,deleteComment,getVideoComments} from '../controllers/comments.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router=Router();

router.use(verifyJWT); // all secured routes

// router.route('/addComment/:videoId').post(addComment);
router.route('/addComment').post(addComment);
router.route('/updatecomment/:commentId').put(updateComment);

export default router;