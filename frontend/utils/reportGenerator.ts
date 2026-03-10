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

export interface PsoriasisRiskReportData {
  timestamp: string;
  location: string;
  riskScore: number;
  riskLevel: string;
  weatherData: {
    temperature: number;
    humidity: number;
    feelsLike: number;
    windSpeed: number;
    condition: string;
  };
  riskFactors: Array<{
    label: string;
    value: number;
    impact: string;
    explanation: string;
    recommendation: string;
  }>;
  suggestions: string[];
  explainableInsights: {
    topRisks: string[];
    protectiveFactors: string[];
    holisticAssessment: string;
  };
}

export const generatePsoriasisRiskReport = (data: PsoriasisRiskReportData): string => {
  const {
    timestamp,
    location,
    riskScore,
    riskLevel,
    weatherData,
    riskFactors,
    suggestions,
    explainableInsights,
  } = data;

  const riskColor = (() => {
    if (riskLevel === "Low") return "#10b981";
    if (riskLevel === "Moderate") return "#f59e0b";
    if (riskLevel === "High") return "#ef4444";
    return "#7c2d12";
  })();

  const riskGradient = (() => {
    if (riskLevel === "Low") return "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)";
    if (riskLevel === "Moderate") return "linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)";
    if (riskLevel === "High") return "linear-gradient(135deg, #fecaca 0%, #fee2e2 100%)";
    return "linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)";
  })();

  const getRiskEmoji = () => {
    if (riskLevel === "Low") return "🟢";
    if (riskLevel === "Moderate") return "🟡";
    if (riskLevel === "High") return "🔴";
    return "⚫";
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Psoriasis Risk Analysis Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: #2d3748;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .page {
          background: white;
          max-width: 900px;
          margin: 0 auto;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        
        /* Header Section */
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 50px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 200px;
          height: 200px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        .header-content {
          position: relative;
          z-index: 1;
        }
        .header-title {
          font-family: 'Poppins', sans-serif;
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        .header-subtitle {
          font-size: 16px;
          opacity: 0.95;
          font-weight: 300;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        
        /* Content Section */
        .content {
          padding: 50px 40px;
        }
        
        /* Timestamp */
        .timestamp {
          text-align: center;
          color: #a0aec0;
          font-size: 13px;
          margin-bottom: 30px;
          font-weight: 500;
        }
        
        /* Location Card */
        .location-card {
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
          padding: 20px 25px;
          border-radius: 15px;
          margin-bottom: 30px;
          border-left: 6px solid #0891b2;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .location-icon {
          font-size: 32px;
        }
        .location-text strong {
          color: #0891b2;
          display: block;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .location-text {
          font-size: 20px;
          color: #075985;
          font-weight: 600;
        }
        
        /* Risk Score Section */
        .risk-score-section {
          background: ${riskGradient};
          border: 3px solid ${riskColor};
          padding: 40px;
          border-radius: 20px;
          margin-bottom: 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .risk-score-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, ${riskColor} 0%, transparent 70%);
          opacity: 0.1;
        }
        .risk-score-content {
          position: relative;
          z-index: 1;
        }
        .risk-emoji {
          font-size: 60px;
          margin-bottom: 15px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .score-label {
          font-size: 13px;
          color: ${riskColor};
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .score-value {
          font-family: 'Poppins', sans-serif;
          font-size: 72px;
          font-weight: 800;
          color: ${riskColor};
          line-height: 1;
          margin-bottom: 15px;
        }
        .risk-level-badge {
          display: inline-block;
          padding: 14px 32px;
          background: ${riskColor};
          color: white;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        /* Weather Section */
        .section-title {
          font-family: 'Poppins', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-title::after {
          content: '';
          flex: 1;
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, transparent 100%);
          border-radius: 2px;
        }
        
        .weather-section {
          margin-bottom: 40px;
        }
        .weather-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .weather-item {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 25px;
          border-radius: 15px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
          text-align: center;
        }
        .weather-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
          border-color: #667eea;
        }
        .weather-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }
        .weather-item label {
          display: block;
          color: #718096;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .weather-item value {
          display: block;
          color: #2d3748;
          font-size: 24px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
        }
        
        /* Risk Factors Section */
        .factors-section {
          margin-bottom: 40px;
        }
        .factor-item {
          background: linear-gradient(135deg, #f9fafb 0%, #f5f7fa 100%);
          border-left: 6px solid ${riskColor};
          padding: 25px;
          margin-bottom: 18px;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }
        .factor-item:hover {
          transform: translateX(5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        .factor-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .factor-icon {
          font-size: 24px;
        }
        .factor-label {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          color: #2d3748;
          font-size: 16px;
        }
        .factor-impact {
          display: inline-block;
          background: ${riskColor};
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          margin-left: auto;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .factor-explanation {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        .factor-recommendation {
          background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
          color: #065f46;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border-left: 4px solid #10b981;
          margin-top: 12px;
        }
        
        /* Insights Section */
        .insights-section {
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 40px;
          border: 2px solid #bbf7d0;
        }
        .insights-subsection {
          margin-bottom: 20px;
        }
        .insights-subsection:last-child {
          margin-bottom: 0;
        }
        .insights-subsection strong {
          color: #059669;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 12px;
        }
        .insights-list {
          list-style: none;
          padding: 0;
        }
        .insights-list li {
          padding: 10px 0 10px 28px;
          position: relative;
          color: #4a5568;
          font-size: 14px;
          line-height: 1.6;
        }
        .insights-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: 700;
          font-size: 18px;
        }
        .holistic-assessment {
          background: white;
          border-left: 4px solid #10b981;
          padding: 16px;
          border-radius: 8px;
          margin-top: 15px;
          font-size: 14px;
          color: #4a5568;
          line-height: 1.7;
        }
        .holistic-assessment strong {
          color: #059669;
          display: inline;
        }
        
        /* Suggestions Section */
        .suggestions-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 40px;
          border: 2px solid #fcd34d;
        }
        .suggestions-list {
          list-style: none;
          padding: 0;
        }
        .suggestions-list li {
          padding: 14px 0 14px 32px;
          position: relative;
          color: #78350f;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 500;
        }
        .suggestions-list li::before {
          content: "→";
          position: absolute;
          left: 0;
          color: #f59e0b;
          font-weight: 700;
          font-size: 18px;
        }
        
        /* Footer */
        .footer {
          border-top: 2px solid #e2e8f0;
          padding: 30px 40px;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          text-align: center;
        }
        .footer p {
          color: #718096;
          font-size: 12px;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .footer p:last-child {
          margin-bottom: 0;
          font-weight: 500;
          color: #a0aec0;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <div class="header-title">🌊 Psoriasis Risk Analysis</div>
            <div class="header-subtitle">Environmental & Weather-Based Assessment Report</div>
          </div>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Timestamp -->
          <div class="timestamp">📅 Report Generated: ${timestamp}</div>

          <!-- Location Card -->
          <div class="location-card">
            <div class="location-icon">📍</div>
            <div class="location-text">
              <strong>Analysis Location</strong>
              ${location}
            </div>
          </div>

          <!-- Risk Score Section -->
          <div class="risk-score-section">
            <div class="risk-score-content">
              <div class="risk-emoji">${getRiskEmoji()}</div>
              <div class="score-label">Current Risk Score</div>
              <div class="score-value">${riskScore}</div>
              <div class="risk-level-badge">${riskLevel} Risk Level</div>
            </div>
          </div>

          <!-- Weather Section -->
          <div class="weather-section">
            <h2 class="section-title">🌦️ Current Weather Conditions</h2>
            <div class="weather-grid">
              <div class="weather-item">
                <div class="weather-icon">🌡️</div>
                <label>Temperature</label>
                <value>${weatherData.temperature}°C</value>
              </div>
              <div class="weather-item">
                <div class="weather-icon">💨</div>
                <label>Feels Like</label>
                <value>${weatherData.feelsLike}°C</value>
              </div>
              <div class="weather-item">
                <div class="weather-icon">💧</div>
                <label>Humidity</label>
                <value>${weatherData.humidity}%</value>
              </div>
              <div class="weather-item">
                <div class="weather-icon">🌪️</div>
                <label>Wind Speed</label>
                <value>${weatherData.windSpeed} km/h</value>
              </div>
            </div>
          </div>

          <!-- Risk Factors Section -->
          <div class="factors-section">
            <h2 class="section-title">⚠️ Risk Factors Analysis</h2>
            ${riskFactors.map((factor, idx) => `
              <div class="factor-item">
                <div class="factor-header">
                  <div class="factor-icon">${['☀️', '🌧️', '💨', '🌡️', '✨'][idx % 5]}</div>
                  <div class="factor-label">${factor.label}</div>
                  <div class="factor-impact">${factor.impact}</div>
                </div>
                <div class="factor-explanation">${factor.explanation}</div>
                <div class="factor-recommendation">💡 ${factor.recommendation}</div>
              </div>
            `).join('')}
          </div>

          <!-- Insights Section -->
          <div class="insights-section">
            <h2 class="section-title" style="margin-bottom: 25px; color: #059669;">🔍 Explainable AI Insights</h2>
            <div class="insights-subsection">
              <strong>🎯 Top Risk Factors</strong>
              <ul class="insights-list">
                ${explainableInsights.topRisks.map(risk => `<li>${risk}</li>`).join('')}
              </ul>
            </div>
            <div class="insights-subsection">
              <strong>🛡️ Protective Factors</strong>
              <ul class="insights-list">
                ${explainableInsights.protectiveFactors.map(factor => `<li>${factor}</li>`).join('')}
              </ul>
            </div>
            <div class="holistic-assessment">
              <strong>Overall Assessment:</strong><br>${explainableInsights.holisticAssessment}
            </div>
          </div>

          <!-- Suggestions Section -->
          <div class="suggestions-section">
            <h2 class="section-title" style="margin-bottom: 25px; color: #b45309;">💊 Personalized Recommendations</h2>
            <ul class="suggestions-list">
              ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>🏥 SkinNova - Advanced Dermatological AI Analysis System</p>
          <p>© 2026 | For informational support only | Always consult healthcare professionals for medical decisions</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

// ─────────────────────────────────────────────────────────────────────────────
// Leprosy Risk Analysis Report
// ─────────────────────────────────────────────────────────────────────────────

export interface LeprosyReportForm {
  age: string;
  gender: string;
  duration_of_illness_months: string;
  number_of_lesions: string;
  largest_lesion_size_cm: string;
  nerve_involvement: boolean;
  nerve_thickening: boolean;
  loss_of_sensation: boolean;
  muscle_weakness: boolean;
  eye_involvement: boolean;
  prev_treatment: boolean;
  household_contacts: string;
  skin_smear_right: string;
  skin_smear_left: string;
  bacillus_index: string;
  morphological_index: string;
}

export interface LeprosyReportPrediction {
  leprosy_type_name: string;
  leprosy_type_code: string;
  risk_level: string;
  description: string;
  confidence: number;
  confidence_percent: number;
}

export interface LeprosyReportXAIFeature {
  feature: string;
  display_name: string;
  shap_value: number;
  feature_value: number;
  direction: 'positive' | 'negative';
}

export interface LeprosyReportData {
  timestamp: string;
  form: LeprosyReportForm;
  prediction: LeprosyReportPrediction;
  class_probabilities: Record<string, number>;
  clinical_interpretation: {
    type_classification: string;
    bacillary_load: string;
    treatment_regimen: string;
    monitoring_priority: string;
    key_clinical_notes: string[];
  };
  feature_importance: Record<string, number>;
  xai_narrative: string | null;
  xai_top_features: LeprosyReportXAIFeature[];
  xai_base_value?: number;
  xai_prediction_score?: number;
  disclaimer: string;
}

export const generateLeprosyReport = (data: LeprosyReportData): string => {
  const {
    timestamp, form, prediction, class_probabilities,
    clinical_interpretation, feature_importance,
    xai_narrative, xai_top_features, xai_base_value, xai_prediction_score,
    disclaimer,
  } = data;

  const riskColor = (() => {
    if (prediction.risk_level === 'Low') return '#16a34a';
    if (prediction.risk_level === 'Low-Moderate') return '#65a30d';
    if (prediction.risk_level === 'Moderate') return '#ca8a04';
    return '#dc2626';
  })();

  const riskBg = (() => {
    if (prediction.risk_level === 'Low') return 'linear-gradient(135deg,#dcfce7 0%,#f0fdf4 100%)';
    if (prediction.risk_level === 'Low-Moderate') return 'linear-gradient(135deg,#ecfccb 0%,#f7fee7 100%)';
    if (prediction.risk_level === 'Moderate') return 'linear-gradient(135deg,#fef9c3 0%,#fffbeb 100%)';
    return 'linear-gradient(135deg,#fee2e2 0%,#fff1f2 100%)';
  })();

  const typeColors: Record<string, string> = {
    TT: '#16a34a', BT: '#65a30d', BB: '#ca8a04', BL: '#ea580c', LL: '#dc2626',
  };
  const typeColor = typeColors[prediction.leprosy_type_code] || '#4f46e5';

  const boolRow = (label: string, val: boolean) =>
    `<tr><td style="padding:6px 10px;color:#6b7280;font-size:13px;">${label}</td>
     <td style="padding:6px 10px;font-size:13px;"><span style="padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${val ? '#dcfce7' : '#f1f5f9'};color:${val ? '#166534' : '#64748b'};">${val ? 'Yes' : 'No'}</span></td></tr>`;

  const sortedProbs = Object.entries(class_probabilities).sort(([, a], [, b]) => Number(b) - Number(a));

  const topFeatures = Object.entries(feature_importance)
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 8);
  const maxImp = topFeatures.length > 0 ? Number(topFeatures[0][1]) : 1;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leprosy Risk Analysis Report — SkinNova</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;}
    .page{background:#fff;max-width:880px;margin:0 auto;box-shadow:0 4px 20px rgba(0,0,0,.12);}
    /* Header */
    .header{background:linear-gradient(135deg,#4338ca 0%,#7c3aed 100%);color:#fff;padding:44px 44px 36px;position:relative;overflow:hidden;}
    .header::before{content:'';position:absolute;top:-60px;right:-60px;width:240px;height:240px;background:rgba(255,255,255,.08);border-radius:50%;}
    .header::after{content:'';position:absolute;bottom:-40px;left:-40px;width:180px;height:180px;background:rgba(255,255,255,.06);border-radius:50%;}
    .header-inner{position:relative;z-index:1;}
    .header h1{font-size:28px;font-weight:800;letter-spacing:-.3px;margin-bottom:4px;}
    .header p{font-size:14px;opacity:.85;letter-spacing:.5px;}
    .badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);margin-top:10px;}
    /* Content */
    .content{padding:40px 44px;}
    .timestamp{text-align:right;color:#94a3b8;font-size:12px;margin-bottom:28px;}
    /* Disclaimer */
    .disclaimer{background:#fffbeb;border-left:4px solid #f59e0b;padding:13px 18px;border-radius:8px;margin-bottom:32px;font-size:12.5px;color:#92400e;}
    /* Section */
    .section{margin-bottom:34px;}
    .section-title{font-size:16px;font-weight:700;color:#4338ca;border-bottom:2px solid #e0e7ff;padding-bottom:8px;margin-bottom:18px;display:flex;align-items:center;gap:8px;}
    /* Risk Card */
    .risk-card{padding:28px;border-radius:16px;margin-bottom:32px;border:2px solid;}
    .type-badge{display:inline-block;font-size:52px;font-weight:900;opacity:.25;line-height:1;margin-bottom:6px;}
    .type-name{font-size:30px;font-weight:800;margin-bottom:4px;}
    .type-desc{font-size:14px;opacity:.80;margin-bottom:16px;}
    .pill{display:inline-block;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid;margin-right:8px;}
    /* Table */
    table{width:100%;border-collapse:collapse;}
    tr:nth-child(even){background:#f8fafc;}
    .th{padding:8px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#64748b;background:#f1f5f9;text-align:left;}
    /* Bar */
    .bar-wrap{background:#e2e8f0;border-radius:4px;height:10px;overflow:hidden;margin-top:2px;}
    .bar-fill{height:10px;border-radius:4px;transition:width .3s;}
    /* SHAP */
    .shap-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
    .shap-name{font-size:12px;color:#475569;width:180px;flex-shrink:0;}
    .shap-val-wrap{font-size:11px;color:#94a3b8;width:50px;flex-shrink:0;text-align:right;font-family:monospace;}
    .shap-bar-wrap{flex:1;background:#334155;border-radius:3px;height:8px;overflow:hidden;}
    .shap-bar{height:8px;border-radius:3px;}
    /* Notes */
    .note-item{background:#fffbeb;border-left:4px solid #f59e0b;padding:10px 14px;border-radius:6px;margin-bottom:8px;font-size:13px;color:#78350f;}
    /* Footer */
    .footer{margin-top:40px;padding:20px 44px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:11.5px;color:#94a3b8;}
    @media print{body{background:#fff;}.page{box-shadow:none;}}
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="header-inner">
      <div style="font-size:13px;opacity:.7;margin-bottom:6px;text-transform:uppercase;letter-spacing:1.5px;">SkinNova AI Platform</div>
      <h1>🦠 Leprosy Risk Analysis Report</h1>
      <p>AI-Powered Classification &amp; Explainability — ML Model with SHAP Analysis</p>
      <div class="badge">Confidential — For Clinical Use Only</div>
    </div>
  </div>

  <div class="content">
    <div class="timestamp">Report generated: ${timestamp}</div>

    <!-- Disclaimer -->
    <div class="disclaimer">
      <strong>⚠️ Medical Disclaimer:</strong> ${disclaimer}
    </div>

    <!-- Primary Result Card -->
    <div class="risk-card" style="background:${riskBg};border-color:${riskColor}80;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
        <div>
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${riskColor};margin-bottom:6px;">AI Prediction Result</div>
          <div class="type-name" style="color:${typeColor};">${prediction.leprosy_type_name}</div>
          <div class="type-desc" style="color:${typeColor};">${prediction.description}</div>
          <div>
            <span class="pill" style="background:${riskBg};border-color:${riskColor};color:${riskColor};">${prediction.risk_level} Risk</span>
            <span class="pill" style="background:rgba(255,255,255,.6);border-color:${typeColor}50;color:${typeColor};">${prediction.confidence_percent.toFixed(1)}% Confidence</span>
          </div>
        </div>
        <div style="text-align:center;flex-shrink:0;">
          <div class="type-badge" style="color:${typeColor};">${prediction.leprosy_type_code}</div>
        </div>
      </div>
    </div>

    <!-- Patient Information -->
    <div class="section">
      <div class="section-title">👤 Patient Information</div>
      <table>
        <tr><th class="th">Field</th><th class="th">Value</th><th class="th">Field</th><th class="th">Value</th></tr>
        <tr>
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Age</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.age} years</td>
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Gender</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.gender === 'M' ? 'Male' : 'Female'}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Duration of Illness</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.duration_of_illness_months} months</td>
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Household Contacts</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.household_contacts || '0'}</td>
        </tr>
        <tr>
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Number of Lesions</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.number_of_lesions}</td>
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Largest Lesion Size</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.largest_lesion_size_cm || 'N/A'} cm</td>
        </tr>
        ${form.skin_smear_right || form.skin_smear_left || form.bacillus_index || form.morphological_index ? `
        <tr style="background:#f8fafc;">
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Skin Smear (Right)</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.skin_smear_right || '0'}</td>
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Skin Smear (Left)</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.skin_smear_left || '0'}</td>
        </tr>
        <tr>
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Bacillus Index (BI)</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.bacillus_index || '0'}</td>
          <td style="padding:7px 10px;font-size:13px;color:#6b7280;">Morphological Index (MI)</td>
          <td style="padding:7px 10px;font-size:13px;font-weight:600;">${form.morphological_index || '0'}%</td>
        </tr>` : ''}
      </table>

      <!-- Clinical Symptoms -->
      <div style="margin-top:18px;">
        <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px;">Clinical Symptoms</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
          ${[
            { label: 'Nerve Involvement', val: form.nerve_involvement, icon: '🧠' },
            { label: 'Nerve Thickening', val: form.nerve_thickening, icon: '🫀' },
            { label: 'Loss of Sensation', val: form.loss_of_sensation, icon: '✋' },
            { label: 'Muscle Weakness', val: form.muscle_weakness, icon: '💪' },
            { label: 'Eye Involvement', val: form.eye_involvement, icon: '👁️' },
            { label: 'Previously Treated', val: form.prev_treatment, icon: '💊' },
          ].map(s => `<div style="padding:8px 12px;border-radius:8px;background:${s.val ? '#eff6ff' : '#f8fafc'};border:1px solid ${s.val ? '#bfdbfe' : '#e2e8f0'};display:flex;align-items:center;gap:7px;">
            <span>${s.icon}</span>
            <span style="font-size:12px;font-weight:600;color:${s.val ? '#1d4ed8' : '#64748b'};">${s.label}</span>
            <span style="margin-left:auto;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${s.val ? '#dbeafe' : '#f1f5f9'};color:${s.val ? '#1d4ed8' : '#94a3b8'};">${s.val ? 'YES' : 'NO'}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Probability Distribution -->
    <div class="section">
      <div class="section-title">📊 Leprosy Type Probability Distribution</div>
      ${sortedProbs.map(([name, prob]) => {
        const pct = Math.round(Number(prob) * 100);
        const code = name.match(/\(([A-Z]+)\)/)?.[1] ?? '';
        const col = typeColors[code] || '#4f46e5';
        const isTop = name === prediction.leprosy_type_name;
        return `<div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:13px;font-weight:${isTop ? '700' : '400'};color:${isTop ? '#1e293b' : '#64748b'};">${isTop ? '▶ ' : ''}${name}</span>
            <span style="font-size:13px;font-weight:700;color:${isTop ? col : '#94a3b8'};">${pct}%</span>
          </div>
          <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%;background:${isTop ? col : '#cbd5e1'};"></div></div>
        </div>`;
      }).join('')}
    </div>

    <!-- Clinical Interpretation -->
    <div class="section">
      <div class="section-title">🏥 Clinical Interpretation</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:16px;">
        ${[
          { label: 'Classification', value: clinical_interpretation.type_classification, icon: '🏷️' },
          { label: 'Bacillary Load', value: clinical_interpretation.bacillary_load, icon: '🦠' },
          { label: 'Recommended Treatment', value: clinical_interpretation.treatment_regimen, icon: '💊' },
          { label: 'Monitoring Priority', value: clinical_interpretation.monitoring_priority, icon: '📋' },
        ].map(item => `<div style="padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
          <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;">${item.icon} ${item.label}</div>
          <div style="font-size:13px;color:#1e293b;">${item.value}</div>
        </div>`).join('')}
      </div>
      ${clinical_interpretation.key_clinical_notes?.length > 0 ? `
      <div style="font-size:12px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">⚠️ Key Clinical Notes</div>
      ${clinical_interpretation.key_clinical_notes.map(n => `<div class="note-item">${n}</div>`).join('')}` : ''}
    </div>

    <!-- Why This Risk Level -->
    <div class="section">
      <div class="section-title">🔍 Why This Risk Level?</div>

      ${xai_narrative ? `
      <div style="background:linear-gradient(135deg,#eef2ff 0%,#f5f3ff 100%);border:1px solid #c7d2fe;border-radius:12px;padding:20px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;color:#4338ca;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">🧠 AI Explanation (SHAP-based)</div>
        <p style="font-size:13.5px;color:#3730a3;line-height:1.7;">${xai_narrative}</p>
        <p style="font-size:11px;color:#818cf8;margin-top:10px;font-style:italic;">Generated from SHAP (SHapley Additive Explanations) — a mathematically rigorous method attributing each feature's contribution to the model output.</p>
      </div>` : ''}

      ${xai_base_value !== undefined && xai_prediction_score !== undefined ? `
      <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
        <div style="padding:10px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;font-size:13px;">
          <span style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;display:block;">Base Score</span>
          <strong>${xai_base_value.toFixed(4)}</strong>
        </div>
        <div style="padding:10px 16px;background:#eef2ff;border-radius:8px;border:1px solid #c7d2fe;font-size:13px;">
          <span style="font-size:11px;color:#818cf8;text-transform:uppercase;letter-spacing:.6px;display:block;">Prediction Score</span>
          <strong style="color:#4338ca;">${xai_prediction_score.toFixed(4)}</strong>
        </div>
        <div style="padding:10px 16px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a;font-size:13px;">
          <span style="font-size:11px;color:#92400e;text-transform:uppercase;letter-spacing:.6px;display:block;">SHAP Δ</span>
          <strong style="color:#b45309;">${(xai_prediction_score - xai_base_value) >= 0 ? '+' : ''}${(xai_prediction_score - xai_base_value).toFixed(4)}</strong>
        </div>
      </div>` : ''}

      <!-- Feature Importance -->
      ${topFeatures.length > 0 ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;">Model Feature Importance (Top Contributing Factors)</div>
        ${topFeatures.map(([feat, imp], i) => {
          const pct = Math.round((Number(imp) / maxImp) * 100);
          const label = feat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="width:18px;font-size:11px;color:#94a3b8;text-align:right;flex-shrink:0;">${i + 1}</span>
            <span style="width:190px;font-size:12px;color:#374151;flex-shrink:0;">${label}</span>
            <div style="flex:1;background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden;">
              <div style="height:8px;border-radius:4px;width:${pct}%;background:#6366f1;"></div>
            </div>
            <span style="width:40px;font-size:11px;color:#64748b;text-align:right;flex-shrink:0;">${Math.round(Number(imp) * 100)}%</span>
          </div>`;
        }).join('')}
      </div>` : ''}

      <!-- SHAP top features -->
      ${xai_top_features.length > 0 ? `
      <div>
        <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;">SHAP Feature Contributions (Direction of Influence)</div>
        <div style="background:#0f172a;border-radius:12px;padding:16px 20px;">
          ${xai_top_features.slice(0, 8).map((f, i) => {
            const pct = Math.min(100, Math.abs(f.shap_value) * 200);
            const isPos = f.direction === 'positive';
            return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span style="width:18px;font-size:11px;color:#64748b;text-align:right;flex-shrink:0;">${i+1}</span>
              <span style="width:160px;font-size:11px;color:#cbd5e1;flex-shrink:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${f.display_name}</span>
              <span style="width:50px;font-size:11px;color:#f59e0b;text-align:right;flex-shrink:0;font-family:monospace;">${f.feature_value}</span>
              <div style="flex:1;background:#334155;border-radius:3px;height:7px;overflow:hidden;">
                <div style="height:7px;border-radius:3px;width:${pct}%;background:${isPos ? '#ef4444' : '#3b82f6'};"></div>
              </div>
              <span style="width:60px;font-size:11px;font-weight:700;text-align:right;flex-shrink:0;font-family:monospace;color:${isPos ? '#f87171' : '#60a5fa'};">${f.shap_value >= 0 ? '+' : ''}${f.shap_value.toFixed(4)}</span>
            </div>`;
          }).join('')}
          <div style="display:flex;gap:20px;margin-top:12px;padding-top:10px;border-top:1px solid #1e293b;">
            <span style="font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block;"></span>Increases predicted probability</span>
            <span style="font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:50%;background:#3b82f6;display:inline-block;"></span>Decreases predicted probability</span>
          </div>
        </div>
      </div>` : ''}
    </div>

  </div><!-- /content -->

  <!-- Footer -->
  <div class="footer">
    <p>🏥 SkinNova — AI-Powered Dermatological Analysis Platform</p>
    <p style="margin-top:4px;">© 2026 | This report is for research and informational purposes only | Always consult a qualified healthcare professional</p>
  </div>
</div>
</body>
</html>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Leprosy Risk Assessment Report  (Care-Assistant / RiskAnalysis component)
// ─────────────────────────────────────────────────────────────────────────────

export interface LeprosyRiskAssessmentReportData {
  generatedAt: string;
  patientName?: string;
  overallRiskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  diseaseTrajectory: 'Improving' | 'Stable' | 'Progressing' | 'Unknown';
  nextCheckupDueDate: string;
  componentScores: {
    symptomProgressionRisk: number;
    treatmentAdherenceRisk: number;
    complicationRisk: number;
    sensorimotorCompromiseRisk: number;
    immuneResponseRisk: number;
    lifeconditionsRisk: number;
  };
  criticalFactors: Array<{ factor: string; severity: 'high' | 'critical'; explanation: string; action: string }>;
  protectiveFactors: Array<{ factor: string; explanation: string; encouragement: string }>;
  predictions: { riskOfReaction: number; riskOfDisability: number; estimatedImprovementTimeline: string };
  recommendations: string[];
  aiPrediction?: {
    leprosyTypeName: string;
    leprosyTypeCode: string;
    riskLevel: string;
    description: string;
    confidencePercent: number;
    classProbabilities?: Record<string, number>;
    clinicalInterpretation?: {
      typeClassification: string;
      bacillaryLoad: string;
      treatmentRegimen: string;
      monitoringPriority: string;
      keyClinicalNotes: string[];
    };
  };
}

export const generateLeprosyRiskAssessmentReport = (data: LeprosyRiskAssessmentReportData): string => {
  const {
    generatedAt, patientName, overallRiskScore, riskLevel, diseaseTrajectory,
    nextCheckupDueDate, componentScores, criticalFactors, protectiveFactors,
    predictions, recommendations, aiPrediction,
  } = data;

  const riskColor = riskLevel === 'Low' ? '#16a34a' : riskLevel === 'Moderate' ? '#ca8a04' : riskLevel === 'High' ? '#ea580c' : '#dc2626';
  const riskBg   = riskLevel === 'Low' ? 'linear-gradient(135deg,#dcfce7,#f0fdf4)' : riskLevel === 'Moderate' ? 'linear-gradient(135deg,#fef9c3,#fffbeb)' : riskLevel === 'High' ? 'linear-gradient(135deg,#ffedd5,#fff7ed)' : 'linear-gradient(135deg,#fee2e2,#fff1f2)';
  const riskBorder = riskLevel === 'Low' ? '#86efac' : riskLevel === 'Moderate' ? '#fde68a' : riskLevel === 'High' ? '#fdba74' : '#fca5a5';

  const trajectoryEmoji = diseaseTrajectory === 'Improving' ? '📉' : diseaseTrajectory === 'Progressing' ? '📈' : diseaseTrajectory === 'Stable' ? '➡️' : '❓';

  const scoreBar = (label: string, value: number) => {
    const color = value <= 30 ? '#16a34a' : value <= 55 ? '#ca8a04' : value <= 75 ? '#ea580c' : '#dc2626';
    return `<div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
        <span style="font-size:13px;color:#374151;">${label}</span>
        <span style="font-size:13px;font-weight:700;color:${color};">${value}</span>
      </div>
      <div style="background:#e2e8f0;border-radius:6px;height:10px;overflow:hidden;">
        <div style="height:10px;border-radius:6px;width:${value}%;background:${color};"></div>
      </div>
    </div>`;
  };

  const componentLabels: Record<string, string> = {
    symptomProgressionRisk: 'Symptom Progression',
    treatmentAdherenceRisk: 'Treatment Adherence',
    complicationRisk: 'Complication Risk',
    sensorimotorCompromiseRisk: 'Sensorimotor Compromise',
    immuneResponseRisk: 'Immune Response',
    lifeconditionsRisk: 'Life Conditions',
  };

  const componentWeights: Record<string, number> = {
    symptomProgressionRisk: 25,
    treatmentAdherenceRisk: 20,
    complicationRisk: 20,
    sensorimotorCompromiseRisk: 15,
    immuneResponseRisk: 12,
    lifeconditionsRisk: 8,
  };

  const typeColors: Record<string, string> = { TT: '#16a34a', BT: '#65a30d', BB: '#ca8a04', BL: '#ea580c', LL: '#dc2626' };
  const aiTypeColor = aiPrediction ? (typeColors[aiPrediction.leprosyTypeCode] || '#4f46e5') : '#4f46e5';

  const sortedProbs = aiPrediction?.classProbabilities
    ? Object.entries(aiPrediction.classProbabilities).sort(([, a], [, b]) => Number(b) - Number(a))
    : [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Leprosy Risk Assessment Report — SkinNova</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;}
    .page{background:#fff;max-width:880px;margin:0 auto;box-shadow:0 4px 20px rgba(0,0,0,.12);}
    .header{background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 50%,#7c3aed 100%);color:#fff;padding:44px 44px 36px;position:relative;overflow:hidden;}
    .header::before{content:'';position:absolute;top:-60px;right:-60px;width:240px;height:240px;background:rgba(255,255,255,.06);border-radius:50%;}
    .header::after{content:'';position:absolute;bottom:-50px;left:-50px;width:200px;height:200px;background:rgba(255,255,255,.05);border-radius:50%;}
    .header-inner{position:relative;z-index:1;}
    .header h1{font-size:26px;font-weight:800;margin-bottom:4px;}
    .header p{font-size:13px;opacity:.85;}
    .header .meta{margin-top:16px;display:flex;gap:20px;flex-wrap:wrap;}
    .meta-pill{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:4px 14px;font-size:12px;}
    .content{padding:40px 44px;}
    .disclaimer{background:#fffbeb;border-left:4px solid #f59e0b;padding:13px 18px;border-radius:8px;margin-bottom:32px;font-size:12.5px;color:#92400e;line-height:1.6;}
    .sec{margin-bottom:34px;}
    .sec-title{font-size:15px;font-weight:700;color:#1d4ed8;border-bottom:2px solid #dbeafe;padding-bottom:8px;margin-bottom:18px;}
    .risk-card{padding:28px 32px;border-radius:16px;border:2px solid ${riskBorder};margin-bottom:10px;background:${riskBg};}
    .score-big{font-size:60px;font-weight:900;color:${riskColor};line-height:1;}
    .risk-badge{display:inline-block;padding:6px 20px;border-radius:20px;font-size:14px;font-weight:700;color:#fff;background:${riskColor};margin-top:10px;}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;}
    .info-box{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;}
    .info-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#64748b;margin-bottom:4px;}
    .info-value{font-size:18px;font-weight:700;color:#0f172a;}
    .info-sub{font-size:11px;color:#94a3b8;margin-top:2px;}
    .component-section{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:22px 26px;}
    .factor-item{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin-bottom:10px;}
    .factor-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
    .factor-name{font-size:14px;font-weight:700;color:#0f172a;}
    .severity-pill{padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;}
    .sev-critical{background:#fee2e2;color:#991b1b;}
    .sev-high{background:#ffedd5;color:#9a3412;}
    .factor-explanation{font-size:12.5px;color:#475569;margin-bottom:6px;}
    .factor-action{font-size:12.5px;color:#1d4ed8;font-weight:600;}
    .protective-item{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:10px;}
    .protective-name{font-size:14px;font-weight:700;color:#166534;margin-bottom:4px;}
    .protective-text{font-size:12.5px;color:#15803d;}
    .rec-item{background:#eff6ff;border-left:4px solid #3b82f6;padding:10px 14px;border-radius:6px;margin-bottom:8px;font-size:13px;color:#1e3a8a;}
    .pred-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
    .pred-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;text-align:center;}
    .pred-val{font-size:28px;font-weight:800;color:#1d4ed8;}
    .pred-lbl{font-size:11px;color:#64748b;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;}
    .ai-card{background:linear-gradient(135deg,#f5f3ff,#ede9fe);border:2px solid #c4b5fd;border-radius:14px;padding:24px 28px;}
    .ai-type{font-size:28px;font-weight:800;margin-bottom:4px;}
    .ai-desc{font-size:13px;color:#5b21b6;margin-bottom:14px;}
    .ai-info-row{display:flex;gap:8px;margin-bottom:14px;}
    .ci-table{width:100%;border-collapse:collapse;font-size:13px;}
    .ci-table td{padding:8px 10px;border-bottom:1px solid #ede9fe;}
    .ci-table tr:last-child td{border-bottom:none;}
    .ci-table .ci-label{color:#7c3aed;font-weight:600;width:140px;}
    .prob-wrap{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
    .prob-name{font-size:12px;color:#475569;width:220px;flex-shrink:0;}
    .prob-pct{font-size:12px;font-weight:700;color:#4f46e5;width:36px;text-align:right;flex-shrink:0;}
    .prob-bar-bg{flex:1;background:#ede9fe;border-radius:4px;height:8px;overflow:hidden;}
    .prob-bar{height:8px;border-radius:4px;}
    .footer{padding:20px 44px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:11.5px;color:#94a3b8;}
    @media print{body{background:#fff;}.page{box-shadow:none;}}
  </style>
</head>
<body>
<div class="page">

  <!-- ── Header ── -->
  <div class="header">
    <div class="header-inner">
      <p style="font-size:12px;opacity:.7;letter-spacing:1px;margin-bottom:6px;">SKINNOVA — AI-POWERED DERMATOLOGICAL PLATFORM</p>
      <h1>🩺 Leprosy Risk Assessment Report</h1>
      <p>Comprehensive multi-factor risk analysis for patient monitoring & care planning</p>
      <div class="meta">
        ${patientName ? `<span class="meta-pill">👤 ${patientName}</span>` : ''}
        <span class="meta-pill">📅 Generated: ${generatedAt}</span>
        <span class="meta-pill">📋 Next Checkup: ${new Date(nextCheckupDueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  </div>

  <div class="content">

    <!-- Disclaimer -->
    <div class="disclaimer">
      <strong>⚠️ Medical Disclaimer:</strong> This report is generated by an AI-powered risk analysis system and is intended
      for informational and research purposes only. It does not constitute a medical diagnosis. Always consult a qualified
      healthcare professional before making clinical decisions.
    </div>

    <!-- ── Overall Risk ── -->
    <div class="sec">
      <div class="sec-title">📊 Overall Risk Assessment</div>
      <div class="risk-card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:20px;">
          <div>
            <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${riskColor};opacity:.7;margin-bottom:6px;">Overall Risk Score</p>
            <div class="score-big">${overallRiskScore}</div>
            <div style="font-size:13px;color:${riskColor};opacity:.8;margin-top:4px;">out of 100</div>
            <div class="risk-badge">${riskLevel} Risk</div>
          </div>
          <div class="info-grid">
            <div class="info-box">
              <div class="info-label">Disease Trajectory</div>
              <div class="info-value">${trajectoryEmoji} ${diseaseTrajectory}</div>
              <div class="info-sub">Based on symptom history</div>
            </div>
            <div class="info-box">
              <div class="info-label">Next Checkup Due</div>
              <div class="info-value" style="font-size:15px;">${new Date(nextCheckupDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div class="info-sub">Schedule with your doctor</div>
            </div>
            <div class="info-box">
              <div class="info-label">Reaction Risk</div>
              <div class="info-value">${predictions.riskOfReaction}%</div>
              <div class="info-sub">Type 1 / 2 reaction</div>
            </div>
            <div class="info-box">
              <div class="info-label">Disability Risk</div>
              <div class="info-value">${predictions.riskOfDisability}%</div>
              <div class="info-sub">Projected nerve impact</div>
            </div>
          </div>
        </div>
        <div style="margin-top:20px;background:rgba(255,255,255,.6);border-radius:8px;padding:12px 16px;">
          <span style="font-size:13px;color:#374151;font-weight:600;">⏱ Estimated Improvement Timeline: </span>
          <span style="font-size:13px;color:${riskColor};font-weight:700;">${predictions.estimatedImprovementTimeline}</span>
        </div>
      </div>
    </div>

    <!-- ── Component Scores ── -->
    <div class="sec">
      <div class="sec-title">🔢 Risk Component Breakdown</div>
      <div class="component-section">
        <p style="font-size:12.5px;color:#64748b;margin-bottom:20px;">
          The overall risk score is a weighted average of six independent components. Scores closer to 100 indicate higher risk in that domain.
        </p>
        ${Object.entries(componentScores).map(([key, val]) =>
          `${scoreBar(`${componentLabels[key] || key} <span style="font-size:11px;color:#94a3b8;">(weight: ${componentWeights[key] ?? 0}%)</span>`, val)}`
        ).join('')}
        <div style="border-top:1px solid #e2e8f0;margin-top:8px;padding-top:12px;">
          <p style="font-size:12px;color:#64748b;">
            <strong>How this is calculated:</strong> Each component is scored 0–100 based on clinical data and symptom logs.
            The overall score is a weighted sum: Symptom Progression (25%) + Treatment Adherence (20%) + Complications (20%) + Sensorimotor (15%) + Immune Response (12%) + Life Conditions (8%).
          </p>
        </div>
      </div>
    </div>

    <!-- ── Critical Factors ── -->
    ${criticalFactors.length > 0 ? `
    <div class="sec">
      <div class="sec-title">⚠️ Critical Risk Factors</div>
      ${criticalFactors.map(f => `
        <div class="factor-item">
          <div class="factor-header">
            <span class="factor-name">${f.factor}</span>
            <span class="severity-pill ${f.severity === 'critical' ? 'sev-critical' : 'sev-high'}">${f.severity.toUpperCase()}</span>
          </div>
          <p class="factor-explanation">${f.explanation}</p>
          <p class="factor-action">→ Recommended action: ${f.action}</p>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- ── Protective Factors ── -->
    ${protectiveFactors.length > 0 ? `
    <div class="sec">
      <div class="sec-title">🛡️ Protective Factors</div>
      ${protectiveFactors.map(f => `
        <div class="protective-item">
          <div class="protective-name">✅ ${f.factor}</div>
          <p class="protective-text">${f.explanation}</p>
          <p class="protective-text" style="margin-top:4px;font-style:italic;">${f.encouragement}</p>
        </div>
      `).join('')}
    </div>` : ''}

    <!-- ── AI Type Prediction ── -->
    ${aiPrediction ? `
    <div class="sec">
      <div class="sec-title">🤖 AI Leprosy Type Classification</div>
      <div class="ai-card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px;">
          <div>
            <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#7c3aed;margin-bottom:4px;">Predicted Type</p>
            <div class="ai-type" style="color:${aiTypeColor};">${aiPrediction.leprosyTypeName}</div>
            <div class="ai-desc">${aiPrediction.description}</div>
            <div class="ai-info-row">
              <span style="padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;background:${aiTypeColor}20;color:${aiTypeColor};border:1px solid ${aiTypeColor}40;">${aiPrediction.leprosyTypeCode}</span>
              <span style="padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;background:#ede9fe;color:#7c3aed;">Confidence: ${aiPrediction.confidencePercent.toFixed(1)}%</span>
              <span style="padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;background:#fce7f3;color:#9d174d;">${aiPrediction.riskLevel} Risk</span>
            </div>
          </div>
          <div style="background:${aiTypeColor}15;border-radius:12px;padding:12px 20px;text-align:center;border:2px solid ${aiTypeColor}30;">
            <div style="font-size:48px;font-weight:900;color:${aiTypeColor};opacity:.4;line-height:1;">${aiPrediction.leprosyTypeCode}</div>
            <div style="font-size:11px;color:#7c3aed;margin-top:4px;font-weight:600;">ML Model Output</div>
          </div>
        </div>

        ${aiPrediction.clinicalInterpretation ? `
        <div style="background:#fff;border-radius:10px;padding:16px 20px;border:1px solid #ddd6fe;margin-bottom:16px;">
          <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#7c3aed;margin-bottom:12px;">Clinical Interpretation</p>
          <table class="ci-table">
            <tr><td class="ci-label">Classification</td><td>${aiPrediction.clinicalInterpretation.typeClassification}</td></tr>
            <tr><td class="ci-label">Bacillary Load</td><td>${aiPrediction.clinicalInterpretation.bacillaryLoad}</td></tr>
            <tr><td class="ci-label">Treatment Regimen</td><td>${aiPrediction.clinicalInterpretation.treatmentRegimen}</td></tr>
            <tr><td class="ci-label">Monitoring Priority</td><td>${aiPrediction.clinicalInterpretation.monitoringPriority}</td></tr>
          </table>
          ${(aiPrediction.clinicalInterpretation.keyClinicalNotes?.length ?? 0) > 0 ? `
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #ede9fe;">
            <p style="font-size:12px;font-weight:700;color:#7c3aed;margin-bottom:8px;">⚠️ Key Clinical Notes</p>
            ${aiPrediction.clinicalInterpretation.keyClinicalNotes.map(n =>
              `<div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:8px 12px;border-radius:5px;margin-bottom:6px;font-size:12.5px;color:#78350f;">${n}</div>`
            ).join('')}
          </div>
          ` : ''}
        </div>` : ''}

        ${sortedProbs.length > 0 ? `
        <div>
          <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#7c3aed;margin-bottom:12px;">Probability Distribution by Type</p>
          ${sortedProbs.map(([typeName, prob]) => {
            const pct = Math.round(Number(prob) * 100);
            const isTop = typeName === aiPrediction.leprosyTypeName;
            return `<div class="prob-wrap">
              <span class="prob-name" style="${isTop ? 'font-weight:700;color:#4f46e5;' : ''}">${isTop ? '▶ ' : ''}${typeName}</span>
              <span class="prob-pct">${pct}%</span>
              <div class="prob-bar-bg">
                <div class="prob-bar" style="width:${pct}%;background:${isTop ? '#7c3aed' : '#c4b5fd'};"></div>
              </div>
            </div>`;
          }).join('')}
        </div>` : ''}
      </div>
    </div>` : ''}

    <!-- ── Recommendations ── -->
    ${recommendations.length > 0 ? `
    <div class="sec">
      <div class="sec-title">📋 Personalised Recommendations</div>
      ${recommendations.map((r, i) => `
        <div class="rec-item">
          <strong>${i + 1}.</strong> ${r}
        </div>
      `).join('')}
    </div>` : ''}

  </div><!-- /content -->

  <div class="footer">
    <p>🏥 SkinNova — AI-Powered Dermatological Analysis Platform</p>
    <p style="margin-top:4px;">© 2026 | This report is for research and informational purposes only | Always consult a qualified healthcare professional</p>
  </div>
</div>
</body>
</html>`;
};
