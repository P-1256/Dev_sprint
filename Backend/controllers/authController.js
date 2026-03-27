const asyncHandler = require("../middlewares/asyncHandler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generatetoken");


exports.registerUser = asyncHandler(async(req, res)=>{
    const {name, email, password, budget} = req.body;

    if(!email || !password || !name || !budget){
        throw new AppError("All Fileds are mandatory!", 400);
    }

    const userExist = await User.findOne({email});

    if (userExist) {
        throw new AppError("User already exist", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        budget
    });

    res.status(201).json({
        _id: user._id,
        email:user.email,
        name: user.name,
        budget: user.budget,
        token: generateToken(user._id)
    });
});

exports.loginUser = asyncHandler(async(req, res)=>{

    const{email, password} = req.body;

    if(!email || !password){
        throw new AppError("All fields are Mandatory!", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("Invalid email or password", 400);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw new AppError("Invalid email or password", 400);
    }

    res.status(201).json({
        _id: user._id,
        email:user.email,
        name: user.name,
        budget: user.budget,
        token: generateToken(user._id)
    });

});