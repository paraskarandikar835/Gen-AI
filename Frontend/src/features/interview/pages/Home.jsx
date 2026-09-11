import React, { useState, useRef } from "react";
import "./style/home.scss";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { loading, generateReport, reports = [] } = useInterview();

  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");

  const resumeInputRef = useRef(null);
  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files?.[0];

    // Validation
    if (!jobDescription.trim()) {
      alert("Please enter the job description.");
      return;
    }

    if (!resumeFile && !selfDescription.trim()) {
      alert("Please upload a resume or enter your self description.");
      return;
    }

    try {
      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });

      if (data && data._id) {
        navigate(`/interview/${data._id}`);
      } else {
        console.error("Invalid interview report response:", data);
        alert("Interview report could not be generated.");
      }
    } catch (error) {
      console.error("Generate report error:", error);
      alert("Something went wrong while generating the interview report.");
    }
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loading-content">
          <div className="loader"></div>

          <h1>Creating Your Interview Strategy</h1>

          <p>
            Our AI is analyzing your profile and job requirements...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="home-page">
      {/* Page Header */}
      <header className="page-header">
        <h1>
          Create Your Custom{" "}
          <span className="highlight">Interview Plan</span>
        </h1>

        <p>
          Let our AI analyze the job requirements and your unique
          profile to build a winning interview strategy.
        </p>
      </header>

      {/* Main Card */}
      <div className="interview-card">
        <div className="interview-card__body">

          {/* Left Panel */}
          <div className="panel panel--left">
            <div className="panel__header">
              <span className="panel__icon">💼</span>

              <div>
                <h2>Target Job Description</h2>

                <span className="badge badge--required">
                  Required
                </span>
              </div>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              className="panel__textarea"
              placeholder={`Paste the full job description here...

Example:
Senior Frontend Engineer requires strong knowledge of React, JavaScript, TypeScript and modern web development.`}
              maxLength={5000}
            />

            <div className="char-counter">
              {jobDescription.length} / 5000 chars
            </div>
          </div>

          {/* Divider */}
          <div className="panel-divider" />

          {/* Right Panel */}
          <div className="panel panel--right">
            <div className="panel__header">
              <span className="panel__icon">👤</span>

              <h2>Your Profile</h2>
            </div>

            {/* Resume Upload */}
            <div className="upload-section">
              <label className="section-label">
                Upload Resume

                <span className="badge badge--best">
                  Best Results
                </span>
              </label>

              <label
                className="dropzone"
                htmlFor="resume"
              >
                <span className="dropzone__icon">↑</span>

                <p className="dropzone__title">
                  Click to upload your resume
                </p>

                <p className="dropzone__subtitle">
                  PDF or DOCX (Max 5MB)
                </p>

                <input
                  ref={resumeInputRef}
                  hidden
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                />
              </label>
            </div>

            {/* OR */}
            <div className="or-divider">
              <span>OR</span>
            </div>

            {/* Self Description */}
            <div className="self-description">
              <label
                className="section-label"
                htmlFor="selfDescription"
              >
                Quick Self Description
              </label>

              <textarea
                value={selfDescription}
                onChange={(e) =>
                  setSelfDescription(e.target.value)
                }
                id="selfDescription"
                className="panel__textarea panel__textarea--short"
                placeholder="Briefly describe your experience, skills, projects and areas of expertise..."
              />
            </div>

            {/* Information */}
            <div className="info-box">
              <span className="info-box__icon">ℹ</span>

              <p>
                Either a <strong>Resume</strong> or a{" "}
                <strong>Self Description</strong> is required
                to generate your personalized interview plan.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="interview-card__footer">
          <span className="footer-info">
            AI-Powered Strategy Generation • Approx. 30 seconds
          </span>

          <button
            onClick={handleGenerateReport}
            className="generate-btn"
            disabled={loading}
          >
            ✦ Generate My Interview Strategy
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <section className="recent-reports">
          <h2>My Recent Interview Plans</h2>

          <div className="reports-list">
            {reports.map((report) => (
              <div
                key={report._id}
                className="report-item"
                onClick={() =>
                  navigate(`/interview/${report._id}`)
                }
              >
                <h3>
                  {report.title || "Untitled Position"}
                </h3>

                <p className="report-meta">
                  Generated on{" "}
                  {report.createdAt
                    ? new Date(
                        report.createdAt
                      ).toLocaleDateString()
                    : "Recently"}
                </p>

                <p
                  className={`match-score ${
                    report.matchScore >= 80
                      ? "score--high"
                      : report.matchScore >= 60
                      ? "score--mid"
                      : "score--low"
                  }`}
                >
                  Match Score: {report.matchScore ?? 0}%
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="page-footer">
        <span>AI Interview Platform</span>
        <span>•</span>
        <span>Prepare smarter. Interview better.</span>
      </footer>
    </div>
  );
};

export default Home;