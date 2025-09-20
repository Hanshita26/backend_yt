import Router from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {toggleSubcription,getUserChannelSubscribers,getSubscribedChannel} from '../controllers/subscription.controller.js';

const router=Router();
router.use(verifyJWT);

router.route('/togglesubscription/:channelId').post(toggleSubcription);
router.route('/userList/:channelId').get(getUserChannelSubscribers);
router.route('/UserHaveSubscribedTo').get(getSubscribedChannel);

export default router;