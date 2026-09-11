const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");

const interviewController = require(
    "../controllers/interviewControllers"
);

const upload = require(
    "../middlewares/file.middleware"
);

const interviewRouter = express.Router();


interviewRouter.post("/",authMiddleware.authUser, upload.single("resume"),interviewController.generateInterviewReportController);

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */

interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)


module.exports = interviewRouter;