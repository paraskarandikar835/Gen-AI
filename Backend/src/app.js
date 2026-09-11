const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "https://gen-ai-1-urqw.onrender.com",
    credentials: true
}));

// Import routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// Use routes
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

app.get("/", (req, res) => {

    res.json({

        message:
            "Server is working"

    });

});

module.exports = app;