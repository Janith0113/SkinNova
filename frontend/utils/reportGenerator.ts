import { RiskResult } from "./skinRiskLogic";

export interface ReportData {
  timestamp: string;
  riskScore: number;
  riskLevel: string;
  contributors: { factor: string; impact: number; description: string }[];
  recommendations: string[];
  imageClassName?: string;
  imageProbability?: number;
}

export const generatePDFReport = (data: ReportData) => {
  const {
    timestamp,
    riskScore,
    riskLevel,
    contributors,
    recommendations,
    imageClassName,
    imageProbability,
  } = data;

  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Skin Cancer Risk Assessment Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
        }
        .page {
          background: white;
          max-width: 850px;
          margin: 0 auto;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #9333ea;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #9333ea;
          font-size: 28px;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .timestamp {
          text-align: right;
          color: #999;
          font-size: 12px;
          margin-bottom: 30px;
        }
        .score-section {
          background: linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%);
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          border-left: 5px solid #9333ea;
        }
        .score-box {
          text-align: center;
          margin-bottom: 20px;
        }
        .score-value {
          font-size: 48px;
          font-weight: bold;
          color: #9333ea;
          line-height: 1;
          margin-bottom: 10px;
        }
        .score-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .risk-level {
          display: inline-block;
          padding: 10px 20px;
          background: #9333ea;
          color: white;
          border-radius: 20px;
          font-weight: bold;
          font-size: 16px;
        }
        .risk-level.low {
          background: #10b981;
        }
        .risk-level.moderate {
          background: #f59e0b;
        }
        .risk-level.high {
          background: #ef4444;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #9333ea;
          border-bottom: 2px solid #e9d5ff;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .icon {
          font-size: 22px;
        }
        .image-info {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #0ea5e9;
        }
        .image-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        .image-info strong {
          color: #0369a1;
        }
        .contributor-item {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .contributor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .contributor-name {
          font-weight: bold;
          color: #1f2937;
          font-size: 15px;
        }
        .contributor-impact {
          font-size: 16px;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .impact-positive {
          background: #fee2e2;
          color: #991b1b;
        }
        .impact-negative {
          background: #dcfce7;
          color: #166534;
        }
        .contributor-description {
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }
        .recommendation-item {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 12px 15px;
          border-radius: 6px;
          margin-bottom: 10px;
          font-size: 13px;
          color: #166534;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #999;
          text-align: center;
        }
        .disclaimer {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #92400e;
        }
        @media print {
          body {
            background: white;
          }
          .page {
            box-shadow: none;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>🏥 Skin Cancer Risk Assessment Report</h1>
          <p>Multimodal Analysis - Image + Clinical Metadata Fusion</p>
        </div>

        <div class="timestamp">Generated: ${timestamp}</div>

        <div class="disclaimer">
          <strong>⚠️ Disclaimer:</strong> This report is for informational purposes only and should not be considered a medical diagnosis. 
          Please consult a qualified dermatologist for professional medical advice and diagnosis.
        </div>

        <div class="score-section">
          <div class="score-box">
            <div class="score-value">${riskScore}</div>
            <div class="score-label">Composite Risk Score / 100</div>
            <div style="margin-top: 15px;">
              <span class="risk-level ${riskLevel.toLowerCase()}">${riskLevel} Risk</span>
            </div>
          </div>
        </div>

        ${
          imageClassName
            ? `
        <div class="section">
          <div class="section-title">
            <span class="icon">🖼️</span> Image Analysis
          </div>
          <div class="image-info">
            <p><strong>Classification:</strong> ${imageClassName}</p>
            <p><strong>Confidence:</strong> ${imageProbability ? (imageProbability * 100).toFixed(1) : "N/A"}%</p>
          </div>
        </div>
        `
            : ""
        }

        <div class="section">
          <div class="section-title">
            <span class="icon">🧠</span> Risk Factor Analysis (SHAP-Simulated)
          </div>
          <p style="font-size: 13px; color: #666; margin-bottom: 15px;">
            The following factors contributed to your risk score:
          </p>
          ${contributors
            .map(
              (c) => `
            <div class="contributor-item">
              <div class="contributor-header">
                <span class="contributor-name">${c.factor}</span>
                <span class="contributor-impact ${c.impact > 0 ? "impact-positive" : "impact-negative"}">
                  ${c.impact > 0 ? "+" : ""}${c.impact}
                </span>
              </div>
              <div class="contributor-description">${c.description}</div>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="section">
          <div class="section-title">
            <span class="icon">🛡️</span> Personalized Recommendations
          </div>
          ${recommendations
            .map((r) => `<div class="recommendation-item">✓ ${r}</div>`)
            .join("")}
        </div>

        <div class="footer">
          <p>SkinNova - Advanced Dermatological AI Analysis System</p>
          <p>© 2026 | For diagnostic support only</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

export const downloadReportAsPDF = async (htmlContent: string, filename = "SkinCancer_Risk_Report.pdf") => {
  try {
    // Dynamically import html2pdf
    const html2pdf = (await import("html2pdf.js")).default;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    const options = {
      margin: 10,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Fallback: download as HTML if html2pdf is not available
    const link = document.createElement("a");
    link.href = "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);
    link.download = filename.replace(".pdf", ".html");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
