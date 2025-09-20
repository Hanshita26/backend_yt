import Router from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {healthcheck} from '../controllers/healthcheck.controller.js';

const router=Router();


// router.use(verifyJWT);

// acts like some home page just to check is everything is working fine or not
router.route('/allokay').get(verifyJWT,healthcheck);

export default router;