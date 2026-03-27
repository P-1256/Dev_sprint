const express = require("express");
const router = express.Router();

const{
    getExpenses,
    createExpense,
    deleteExpense
}=require("../controllers/expenseController");

router.post("/", createExpense);
router.get("/", getExpenses);
router.delete("/:id", deleteExpense);

module.exports = router;