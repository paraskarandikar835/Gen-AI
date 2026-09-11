const { PDFParse } = require("pdf-parse");

const {
    generateInterviewReport,
    generateResumePdf
} = require("../services/ai.service");

const interviewReportModel =
    require("../models/interviewReport.model");


// GENERATE INTERVIEW REPORT

async function generateInterviewReportController(req, res) {

    try {

        const resumeFile = req.file;

        const {
            selfDescription,
            jobDescription
        } = req.body;


        // VALIDATION

        if (!resumeFile) {

            return res.status(400).json({
                message: "Resume PDF is required"
            });

        }


        if (!selfDescription?.trim()) {

            return res.status(400).json({
                message: "Self description is required"
            });

        }


        if (!jobDescription?.trim()) {

            return res.status(400).json({
                message: "Job description is required"
            });

        }


        // EXTRACT RESUME TEXT

        console.log(
            "Extracting resume content..."
        );


        const parser = new PDFParse({

            data: resumeFile.buffer

        });


        const parsedPdf =
            await parser.getText();


        const resumeContent =
            parsedPdf.text;


        await parser.destroy();


        if (
            !resumeContent ||
            !resumeContent.trim()
        ) {

            return res.status(400).json({

                message:
                    "Could not extract text from resume PDF"

            });

        }


        // GENERATE AI REPORT

        console.log(
            "Generating AI report..."
        );


        const interviewReportByAi =
            await generateInterviewReport({

                resume: resumeContent,

                selfDescription,

                jobDescription

            });


        console.log(
            "AI report generated successfully"
        );

        console.log(
            JSON.stringify(
                interviewReportByAi,
                null,
                2
            )
        );


        // VALIDATE MAIN AI DATA

        if (!interviewReportByAi) {

            throw new Error(
                "AI did not generate a report"
            );

        }


        if (
            !interviewReportByAi.title ||
            interviewReportByAi.matchScore === undefined
        ) {

            throw new Error(
                "AI generated incomplete report data"
            );

        }


        // NORMALIZE AI DATA

        const technicalQuestions =
            Array.isArray(
                interviewReportByAi.technicalQuestions
            )
                ? interviewReportByAi.technicalQuestions
                : [];


        const behavioralQuestions =
            Array.isArray(
                interviewReportByAi.behavioralQuestions
            )
                ? interviewReportByAi.behavioralQuestions
                : [];


        const skillGaps =
            Array.isArray(
                interviewReportByAi.skillGaps
            )
                ? interviewReportByAi.skillGaps
                : [];


        const preparationPlan =
            Array.isArray(
                interviewReportByAi.preparationPlan
            )
                ? interviewReportByAi.preparationPlan
                : [];


        // CHECK REQUIRED QUESTIONS

        if (technicalQuestions.length === 0) {

            throw new Error(
                "AI did not generate technical questions"
            );

        }


        if (behavioralQuestions.length === 0) {

            throw new Error(
                "AI did not generate behavioral questions"
            );

        }


        // SAVE TO DATABASE

        console.log(
            "Saving interview report to database..."
        );


        const interviewReport =
            await interviewReportModel.create({

                user: req.user._id,


                title:
                    String(
                        interviewReportByAi.title
                    ).trim(),


                resume:
                    resumeContent,


                selfDescription:
                    selfDescription.trim(),


                jobDescription:
                    jobDescription.trim(),


                matchScore:
                    Math.min(
                        100,
                        Math.max(
                            0,
                            Number(
                                interviewReportByAi.matchScore
                            )
                        )
                    ),


                technicalQuestions,


                behavioralQuestions,


                skillGaps,


                preparationPlan

            });


        console.log(
            "Interview report saved successfully:",
            interviewReport._id
        );


        // SUCCESS RESPONSE

        return res.status(201).json({

            message:
                "Interview report generated successfully",

            interviewReport

        });


    } catch (error) {

        console.error(
            "Generate report error:",
            error
        );


        return res.status(500).json({

            message:
                error.message ||
                "Failed to generate interview report"

        });

    }

}


// GET INTERVIEW REPORT BY ID

async function getInterviewReportByIdController(req, res) {

    try {

        const { interviewId } =
            req.params;


        const interviewReport =
            await interviewReportModel.findOne({

                _id: interviewId,

                user: req.user._id

            });


        if (!interviewReport) {

            return res.status(404).json({

                message:
                    "Interview report not found"

            });

        }


        return res.status(200).json({

            message:
                "Interview report fetched successfully",

            interviewReport

        });


    } catch (error) {

        console.error(
            "Get Interview Report Error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to fetch interview report"

        });

    }

}


// GET ALL INTERVIEW REPORTS

async function getAllInterviewReportsController(req, res) {

    try {

        const interviewReports =
            await interviewReportModel

                .find({

                    user: req.user._id

                })

                .sort({

                    createdAt: -1

                })

                .select(
                    "-resume -selfDescription -jobDescription -__v"
                );


        return res.status(200).json({

            message:
                "Interview reports fetched successfully",

            interviewReports

        });


    } catch (error) {

        console.error(
            "Get All Reports Error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to fetch interview reports"

        });

    }

}


// GENERATE RESUME PDF

async function generateResumePdfController(req, res) {

    try {

        const { interviewReportId } =
            req.params;


        const interviewReport =
            await interviewReportModel.findOne({

                _id: interviewReportId,

                user: req.user._id

            });


        if (!interviewReport) {

            return res.status(404).json({

                message:
                    "Interview report not found"

            });

        }


        const pdfBuffer =
            await generateResumePdf({

                resume:
                    interviewReport.resume,

                jobDescription:
                    interviewReport.jobDescription,

                selfDescription:
                    interviewReport.selfDescription

            });


        res.set({

            "Content-Type":
                "application/pdf",

            "Content-Disposition":
                `attachment; filename=resume_${interviewReportId}.pdf`

        });


        return res.send(pdfBuffer);


    } catch (error) {

        console.error(
            "Generate Resume PDF Error:",
            error
        );


        return res.status(500).json({

            message:
                error.message ||
                "Failed to generate resume PDF"

        });

    }

}


module.exports = {

    generateInterviewReportController,

    getInterviewReportByIdController,

    getAllInterviewReportsController,

    generateResumePdfController

};