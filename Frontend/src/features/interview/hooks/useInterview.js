import { getAllInterviewReports, generateInterviewReport,getInterviewReportById,generateResumePdf } from "../services/interview.api.js";

import {useContext, useEffect} from "react";

import { InterviewContext } from "../interview.context.jsx";

import { useParams } from "react-router-dom";


export const useInterview = () => {

    const context = useContext(InterviewContext);

    const { interviewId } = useParams();


    if (!context) {

        throw new Error(
            "useInterview must be used within an InterviewProvider"
        );

    }


    const {

        loading,
        setLoading,

        report,
        setReport,

        reports,
        setReports

    } = context;


    /* Generate Interview Report */

    const generateReport = async ({jobDescription,selfDescription,resumeFile}) => {

        setLoading(true);

        try {

            const response =
                await generateInterviewReport({jobDescription,selfDescription,resumeFile });
            setReport(response.interviewReport);


            return response.interviewReport;

        }

        catch (error) {

            console.error(
                "Generate report error:",
                error
            );

            throw error;

        }

        finally {

            setLoading(false);

        }

    };


    // Get Single Report 

    const getReportById = async (id) => {

        setLoading(true);

        try {

            const response =
                await getInterviewReportById(id);


            setReport(response.interviewReport);


            return response.interviewReport;

        }

        catch (error) {

            console.error(
                "Get report error:",
                error
            );

            throw error;

        }

        finally {

            setLoading(false);

        }

    };


    // Get All Reports 

    const getReports = async () => {

        setLoading(true);

        try {

            const response =
                await getAllInterviewReports();


            setReports(
                response.interviewReports || []
            );


            return response.interviewReports || [];

        }

        catch (error) {

            console.error(
                "Get reports error:",
                error
            );

            return [];

        }

        finally {

            setLoading(false);

        }

    };


    // Download Resume PDF 

    const getResumePdf = async (
        interviewReportId
    ) => {

        setLoading(true);

        try {

            const response =
                await generateResumePdf({
                    interviewReportId
                });


            const url =
                window.URL.createObjectURL(

                    new Blob(
                        [response],
                        {
                            type: "application/pdf"
                        }
                    )

                );


            const link =
                document.createElement("a");


            link.href = url;


            link.setAttribute(
                "download",
                `resume_${interviewReportId}.pdf`
            );


            document.body.appendChild(link);


            link.click();


            link.remove();


            window.URL.revokeObjectURL(url);

        }

        catch (error) {

            console.error(
                "PDF generation error:",
                error
            );

        }

        finally {

            setLoading(false);

        }

    };


    /* Automatically Load Reports */

    useEffect(() => {

        if (interviewId) {

            getReportById(interviewId);

        }

        else {

            getReports();

        }

    }, [interviewId]);


    return {

        loading,

        report,

        reports: reports || [],

        generateReport,

        getReportById,

        getReports,

        getResumePdf

    };

};