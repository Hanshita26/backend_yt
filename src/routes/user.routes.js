import { Router } from "express"; // through express
import { registerUser } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js';

const router=Router();



// syntax goes like - router.route use karenge and then whatever the route path is , after that we have many methods
// like get,post,put,delete and you can call accordindly

router.route('/register').post(
    // also passing middleware
    upload.fields([
        {
            // during frontend also , name of file will be avatar and coverImage
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        },

    ]),
    registerUser)

// so what will happen finall is , you will go to - http://localhost:8000/users/register

export default router
