const asyncHandler = require("../middlewares/asyncHandler");
const Expense = require("../models/Expense");
const AppError = require("../utils/AppError");

exports.createExpense = asyncHandler(async(req, res)=>{

    const{id,amount, category, note} = req.body;

    if(!amount || !category){
        throw new AppError("Fill amount and category", 400);
    }

    const expense = await Expense.create({
        userId: req.user._id,
        amount,
        category,
        note
    });

    res.status(201).json(expense);

});

exports.getExpenses = asyncHandler(async (req, res) => {

    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });

    res.json({
        status: "success",
        count: expenses.length,
        data: expenses
    });

});

exports.deleteExpense = asyncHandler(async(req, res)=>{

    const expense = await Expense.findById(req.params.id);

    if(!expense){
        throw new AppError("Expense noty found",404);
    }

    if(req.user._id.toString() !== expense.userId.toString()){

        throw new AppError("You are not authorized user",403);
    }

    await expense.deleteOne();

    res.json({
        status:"Success",
        message: "expense Deleted"
    });

});