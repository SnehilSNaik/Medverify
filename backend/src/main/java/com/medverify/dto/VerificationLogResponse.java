package com.medverify.dto;

import java.time.LocalDateTime;

/** Response DTO for a verification log entry. */
public class VerificationLogResponse {
    private Long id;
    private String certificateId;
    private String verifierName;
    private String verifierOrganization;
    private String verificationResult;
    private LocalDateTime verifiedAt;
    private String ipAddress;

    public VerificationLogResponse() {}

    public VerificationLogResponse(Long id, String certificateId, String verifierName, String verifierOrganization, String verificationResult, LocalDateTime verifiedAt, String ipAddress) {
        this.id = id;
        this.certificateId = certificateId;
        this.verifierName = verifierName;
        this.verifierOrganization = verifierOrganization;
        this.verificationResult = verificationResult;
        this.verifiedAt = verifiedAt;
        this.ipAddress = ipAddress;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getVerifierName() { return verifierName; }
    public void setVerifierName(String verifierName) { this.verifierName = verifierName; }

    public String getVerifierOrganization() { return verifierOrganization; }
    public void setVerifierOrganization(String verifierOrganization) { this.verifierOrganization = verifierOrganization; }

    public String getVerificationResult() { return verificationResult; }
    public void setVerificationResult(String verificationResult) { this.verificationResult = verificationResult; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
