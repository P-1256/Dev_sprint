const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("./asyncHandler");

const protectRoutes = asyncHandler(async(req, res, next)=>{

    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        
        token =req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if(!user){
            throw new AppError("User not found", 401);
        }
        req.user = user;
        next();
    }
    else{
        throw new AppError("No token provided", 401);
    }
});

module.exports = protectRoutes;