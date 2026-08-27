package com.medverify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * VerificationLog entity — records every certificate verification attempt for audit.
 * Explicit getters/setters for Java 25 compatibility.
 */
@Entity
@Table(name = "verification_logs")
public class VerificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certificate_id_ref")
    private MedicalCertificate certificate;

    /** The searched certificate ID (stored even if NOT_FOUND) */
    @Column(nullable = false)
    private String certificateId;

    @Column(nullable = false)
    private String verifierName;

    @Column(nullable = false)
    private String verifierOrganization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationResult verificationResult;

    @Column(nullable = false, updatable = false)
    private LocalDateTime verifiedAt = LocalDateTime.now();

    @Column(nullable = false)
    private String ipAddress;

    public VerificationLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MedicalCertificate getCertificate() { return certificate; }
    public void setCertificate(MedicalCertificate certificate) { this.certificate = certificate; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getVerifierName() { return verifierName; }
    public void setVerifierName(String verifierName) { this.verifierName = verifierName; }

    public String getVerifierOrganization() { return verifierOrganization; }
    public void setVerifierOrganization(String verifierOrganization) { this.verifierOrganization = verifierOrganization; }

    public VerificationResult getVerificationResult() { return verificationResult; }
    public void setVerificationResult(VerificationResult verificationResult) { this.verificationResult = verificationResult; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
