package com.medverify.dto;

import jakarta.validation.constraints.NotBlank;

public class VerifyRequest {
    @NotBlank
    private String certificateId;
    @NotBlank
    private String verifierName;
    @NotBlank
    private String verifierOrganization;

    public VerifyRequest() {}

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getVerifierName() { return verifierName; }
    public void setVerifierName(String verifierName) { this.verifierName = verifierName; }

    public String getVerifierOrganization() { return verifierOrganization; }
    public void setVerifierOrganization(String verifierOrganization) { this.verifierOrganization = verifierOrganization; }
}
