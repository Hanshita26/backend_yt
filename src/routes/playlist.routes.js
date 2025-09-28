import Router from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {createPlaylist,getUsersPlaylist,deletePlaylist,updatePlaylist,getPlaylistById, removeVideoFromPlaylist,addVideoToPlaylist} from '../controllers/playlist.controller.js';

const router=Router();

// secured routes
router.use(verifyJWT);

router.route('/createPlaylist').post(createPlaylist);
router.route('/getusersplaylist').get(getUsersPlaylist);
router.route('/deletePlaylist/:playlistId').delete(deletePlaylist);
router.route('/updateplaylist/:playlistId').patch(updatePlaylist);
router.route('/getplsylistbyid/:playlistId').get(getPlaylistById);
router.route('/removeVideo').get(removeVideoFromPlaylist);
router.route('/addVideo').get(addVideoToPlaylist);


export default router;