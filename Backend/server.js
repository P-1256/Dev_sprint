const express = require("express");
const dotenv = require("dotenv");
const errorHandler = require("./middlewares/errorHandler");
const connectDb = require("./configs/db");
const authRouter = require("./router/authRouter");
const expenseRouter = require("./router/expenseRouter");
const cors = require("cors");

const app = express();
dotenv.config();
app.use(express.json());

app.use(
  cors({
    origin: "https://smart-exp-tracker.vercel.app",
    credentials: true
  })
);

connectDb();

app.use("/smarttracker/auth", authRouter);
app.use("/smarttracker/expenses", expenseRouter);


app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
});
