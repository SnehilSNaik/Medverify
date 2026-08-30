package com.medverify.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Response DTO returning detailed AI/ML document forensic evaluation.
 */
public class AIForgeryResponse {

    private String analysisId;
    private String certificateId;
    private int overallRiskScore;         // 0 - 100 (Higher = Higher Risk of Forgery)
    private String riskLevel;             // GENUINE_LOW_RISK, MODERATE_ANOMALY, HIGH_PROBABILITY_FORGERY
    private double confidenceScore;       // e.g. 98.4%
    private String verdictSummary;
    private LocalDateTime analyzedAt;

    // Feature Sub-Scores (0 - 100%, 100 = Optimal/Authentic)
    private int noiseConsistencyScore;
    private int fontUniformityScore;
    private int layoutConformityScore;
    private int metadataIntegrityScore;
    private int clinicalPlausibilityScore;

    // Detected Visual & Pattern Anomalies
    private List<VisualAnomaly> visualAnomalies;
    private List<String> detectedSoftwareTags;
    private List<String> forensicInsights;

    // Cryptographic correlation
    private boolean cryptographicMatch;
    private String cryptographicStatus;

    // Dataset Benchmark Reference Fields
    private String matchedDatasetBenchmark;
    private String datasetCategory;
    private double datasetSimilarityScore;
    private String datasetSource;
    private String clinicalIcdCode;
    private boolean aiModelTrained = true;
    private double modelAccuracy = 94.82;
    private double extractedElaMean;
    private double extractedLaplacianVar;

    public AIForgeryResponse() {}

    public static class VisualAnomaly {
        private String region;            // e.g. "Leave Expiry Date", "Doctor Seal Stamp", "Patient Name"
        private double x;                 // Normalized percentage coordinate (0-100)
        private double y;                 // Normalized percentage coordinate (0-100)
        private double width;
        private double height;
        private String anomalyType;       // ELA_COMPRESSION_SPIKE, EDGE_DISCONTINUITY, FONT_INCONSISTENCY, STAMP_PASTE
        private String severity;          // LOW, MEDIUM, CRITICAL
        private String description;

        public VisualAnomaly() {}

        public VisualAnomaly(String region, double x, double y, double width, double height, String anomalyType, String severity, String description) {
            this.region = region;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.anomalyType = anomalyType;
            this.severity = severity;
            this.description = description;
        }

        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }

        public double getX() { return x; }
        public void setX(double x) { this.x = x; }

        public double getY() { return y; }
        public void setY(double y) { this.y = y; }

        public double getWidth() { return width; }
        public void setWidth(double width) { this.width = width; }

        public double getHeight() { return height; }
        public void setHeight(double height) { this.height = height; }

        public String getAnomalyType() { return anomalyType; }
        public void setAnomalyType(String anomalyType) { this.anomalyType = anomalyType; }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    // Getters and Setters
    public String getAnalysisId() { return analysisId; }
    public void setAnalysisId(String analysisId) { this.analysisId = analysisId; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public int getOverallRiskScore() { return overallRiskScore; }
    public void setOverallRiskScore(int overallRiskScore) { this.overallRiskScore = overallRiskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getVerdictSummary() { return verdictSummary; }
    public void setVerdictSummary(String verdictSummary) { this.verdictSummary = verdictSummary; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }

    public int getNoiseConsistencyScore() { return noiseConsistencyScore; }
    public void setNoiseConsistencyScore(int noiseConsistencyScore) { this.noiseConsistencyScore = noiseConsistencyScore; }

    public int getFontUniformityScore() { return fontUniformityScore; }
    public void setFontUniformityScore(int fontUniformityScore) { this.fontUniformityScore = fontUniformityScore; }

    public int getLayoutConformityScore() { return layoutConformityScore; }
    public void setLayoutConformityScore(int layoutConformityScore) { this.layoutConformityScore = layoutConformityScore; }

    public int getMetadataIntegrityScore() { return metadataIntegrityScore; }
    public void setMetadataIntegrityScore(int metadataIntegrityScore) { this.metadataIntegrityScore = metadataIntegrityScore; }

    public int getClinicalPlausibilityScore() { return clinicalPlausibilityScore; }
    public void setClinicalPlausibilityScore(int clinicalPlausibilityScore) { this.clinicalPlausibilityScore = clinicalPlausibilityScore; }

    public List<VisualAnomaly> getVisualAnomalies() { return visualAnomalies; }
    public void setVisualAnomalies(List<VisualAnomaly> visualAnomalies) { this.visualAnomalies = visualAnomalies; }

    public List<String> getDetectedSoftwareTags() { return detectedSoftwareTags; }
    public void setDetectedSoftwareTags(List<String> detectedSoftwareTags) { this.detectedSoftwareTags = detectedSoftwareTags; }

    public List<String> getForensicInsights() { return forensicInsights; }
    public void setForensicInsights(List<String> forensicInsights) { this.forensicInsights = forensicInsights; }

    public boolean isCryptographicMatch() { return cryptographicMatch; }
    public void setCryptographicMatch(boolean cryptographicMatch) { this.cryptographicMatch = cryptographicMatch; }

    public String getCryptographicStatus() { return cryptographicStatus; }
    public void setCryptographicStatus(String cryptographicStatus) { this.cryptographicStatus = cryptographicStatus; }

    public String getMatchedDatasetBenchmark() { return matchedDatasetBenchmark; }
    public void setMatchedDatasetBenchmark(String matchedDatasetBenchmark) { this.matchedDatasetBenchmark = matchedDatasetBenchmark; }

    public String getDatasetCategory() { return datasetCategory; }
    public void setDatasetCategory(String datasetCategory) { this.datasetCategory = datasetCategory; }

    public double getDatasetSimilarityScore() { return datasetSimilarityScore; }
    public void setDatasetSimilarityScore(double datasetSimilarityScore) { this.datasetSimilarityScore = datasetSimilarityScore; }

    public String getDatasetSource() { return datasetSource; }
    public void setDatasetSource(String datasetSource) { this.datasetSource = datasetSource; }

    public String getClinicalIcdCode() { return clinicalIcdCode; }
    public void setClinicalIcdCode(String clinicalIcdCode) { this.clinicalIcdCode = clinicalIcdCode; }

    public boolean isAiModelTrained() { return aiModelTrained; }
    public void setAiModelTrained(boolean aiModelTrained) { this.aiModelTrained = aiModelTrained; }

    public double getModelAccuracy() { return modelAccuracy; }
    public void setModelAccuracy(double modelAccuracy) { this.modelAccuracy = modelAccuracy; }

    public double getExtractedElaMean() { return extractedElaMean; }
    public void setExtractedElaMean(double extractedElaMean) { this.extractedElaMean = extractedElaMean; }

    public double getExtractedLaplacianVar() { return extractedLaplacianVar; }
    public void setExtractedLaplacianVar(double extractedLaplacianVar) { this.extractedLaplacianVar = extractedLaplacianVar; }
}
