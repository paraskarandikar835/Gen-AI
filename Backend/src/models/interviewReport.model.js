const mongoose = require("mongoose");


/* Technical Question */

const technicalQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true
        },

        intention: {
            type: String,
            required: true
        },

        answer: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);


/* Behavioral Question */

const behavioralQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true
        },

        intention: {
            type: String,
            required: true
        },

        answer: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);


/* Skill Gap */

const skillGapSchema = new mongoose.Schema(
    {
        skill: {
            type: String,
            required: true
        },

        severity: {
            type: String,

            enum: [
                "low",
                "medium",
                "high"
            ],

            required: true
        }
    },
    {
        _id: false
    }
);


/* Preparation Plan */

const preparationPlanSchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: true,
            min: 1
        },

        focus: {
            type: String,
            required: true
        },

        tasks: {
            type: [String],
            required: true
        }
    },
    {
        _id: false
    }
);


/* Main Interview Report */

const interviewReportSchema = new mongoose.Schema(
    {

        // User who created this report
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // Target job title
        title: {
            type: String,
            required: true
        },


        // Job description entered by user
        jobDescription: {
            type: String,
            required: true
        },


        // Resume text extracted from PDF
        resume: {
            type: String,
            required: true
        },


        // User's self description
        selfDescription: {
            type: String,
            required: true
        },


        // Match percentage
        matchScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },


        // Technical interview questions
        technicalQuestions: {
            type: [technicalQuestionSchema],
            required: true,
            default: []
        },


        // Behavioral interview questions
        behavioralQuestions: {
            type: [behavioralQuestionSchema],
            required: true,
            default: []
        },


        // Missing skills
        skillGaps: {
            type: [skillGapSchema],
            required: true,
            default: []
        },


        // Day-wise preparation plan
        preparationPlan: {
            type: [preparationPlanSchema],
            required: true,
            default: []
        }

    },
    {
        timestamps: true
    }
);


/* Create Model */

const interviewReportModel = mongoose.model(
    "InterviewReport",
    interviewReportSchema
);


module.exports = interviewReportModel;