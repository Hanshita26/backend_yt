import Router from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {createPlaylist,getUsersPlaylist,deletePlaylist} from '../controllers/playlist.controller.js';

const router=Router();

// secured routes
router.use(verifyJWT);

router.route('/createPlaylist').post(createPlaylist);
router.route('/getusersplaylist').get(getUsersPlaylist);
router.route('/deletePlaylist').delete(deletePlaylist);

export default router;