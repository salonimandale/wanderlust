const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController=require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.renderSignupForm)//signupform route
    .post(wrapAsync(userController.signup));//signup route

router
    .route("/login")
    .get(userController.renderLoginForm) //loginform route
    .post(saveRedirectUrl,passport.authenticate("local", {failureRedirect: "/login",failureFlash: true}),userController.login);//login route

//logout route
router.get("/logout",userController.logout);
 
module.exports=router;