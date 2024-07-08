import express from 'express'
// import multer from 'multer'
import { Login, Logout, Signup, AllUsers, forgetPassowrd, ReceivedOtp, updatePassword, delete_User, update_user, Admins } from '../controllers/auth'
import { Auth } from '../middleware/checkToken'


const router = express.Router()


router.post("/signup", Signup);
router.post("/login", Login);
router.post("/logout", Auth, Logout);
router.delete("/delete-user/:id", Auth, delete_User);
router.put("/update-user/:id", Auth, update_user);
router.get("/admins", Auth, Admins);
router.get("/allusers", Auth, AllUsers);
router.post("/forget-password", forgetPassowrd);
router.post("/otp-send", ReceivedOtp);
router.post("/reset-password", updatePassword);

export default router;
