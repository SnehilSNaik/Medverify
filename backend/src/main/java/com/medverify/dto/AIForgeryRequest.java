package com.medverify.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

/**
 * Request DTO for AI Forgery and Visual Pattern Analysis.
 */
public class AIForgeryRequest {

    private String certificateId;
    private String imageBase64;
    private String fileName;
    private String verifierName;
    private String verifierOrganization;
    private Map<String, String> metadata;

    public AIForgeryRequest() {}

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getVerifierName() { return verifierName; }
    public void setVerifierName(String verifierName) { this.verifierName = verifierName; }

    public String getVerifierOrganization() { return verifierOrganization; }
    public void setVerifierOrganization(String verifierOrganization) { this.verifierOrganization = verifierOrganization; }

    public Map<String, String> getMetadata() { return metadata; }
    public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }
}
