const express = require("express");
const router = express.Router();
const protectRoutes = require("../middlewares/authMiddleware");

const{
    getExpenses,
    createExpense,
    deleteExpense
}=require("../controllers/expenseController");

router.post("/",protectRoutes, createExpense);
router.get("/", protectRoutes, getExpenses);
router.delete("/:id", protectRoutes, deleteExpense);

module.exports = router;