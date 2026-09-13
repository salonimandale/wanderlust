const User=require("../models/user.js");

//signupform route
module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
};

//signup route
module.exports.signup=async(req,res)=>{
    try{
        let {username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
       if(err){
         return next(err);
       }
       req.flash("success","Welcome to wanderlust");
    res.redirect("/listings");
    }
    
) }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

//render login form
module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
}

//login route
module.exports.login=async (req, res) => {

        req.flash("success", "You are logged in");

        // If redirectUrl exists, go there
        // Otherwise go to listings
        
        const redirectUrl = res.locals.redirectUrl || "/listings";

        res.redirect(redirectUrl);
    };

//logout route
module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
          return  next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/listings");
    })
};