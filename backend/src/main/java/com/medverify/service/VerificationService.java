package com.medverify.service;

import com.medverify.crypto.CryptoService;
import com.medverify.dto.VerifyRequest;
import com.medverify.dto.VerifyResponse;
import com.medverify.entity.*;
import com.medverify.repository.MedicalCertificateRepository;
import com.medverify.repository.VerificationLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.PublicKey;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * VerificationService is the core of MedVerify's fraud prevention.
 *
 * Verification Algorithm:
 * 1. Find certificate by ID → NOT_FOUND if missing
 * 2. Check status → REVOKED if revoked
 * 3. Recompute SHA-256 hash from stored certificate fields (canonical form)
 * 4. Decrypt stored digital signature using hospital's RSA public key
 * 5. Compare recomputed hash with signature-derived hash
 *    - Match → GENUINE
 *    - Mismatch → TAMPERED (any field change, even 1 character, fails this)
 * 6. Log the result with verifier info and IP address
 */
@Service

public class VerificationService {

    private final MedicalCertificateRepository certificateRepository;
    private final VerificationLogRepository verificationLogRepository;
    private final CryptoService cryptoService;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(VerificationService.class);

    public VerificationService(MedicalCertificateRepository certificateRepository, VerificationLogRepository verificationLogRepository, CryptoService cryptoService) {
        this.certificateRepository = certificateRepository;
        this.verificationLogRepository = verificationLogRepository;
        this.cryptoService = cryptoService;
    }

    /**
     * Verifies a certificate and returns a detailed result.
     *
     * @param request    Contains certificateId, verifierName, verifierOrganization
     * @param ipAddress  Client IP for audit logging
     */
    @Transactional
    public VerifyResponse verifyCertificate(VerifyRequest request, String ipAddress) {
        String certId = request.getCertificateId().trim();

        // Step 1: Look up the certificate
        Optional<MedicalCertificate> certOpt = certificateRepository.findByCertificateId(certId);

        if (certOpt.isEmpty()) {
            log.warn("Verification attempt for non-existent certificate '{}'", certId);
            logVerification(null, certId, request, VerificationResult.NOT_FOUND, ipAddress);
            return buildResponse(certId, VerificationResult.NOT_FOUND, null,
                    "Certificate not found. This may be a fake or invalid certificate.");
        }

        MedicalCertificate cert = certOpt.get();

        // Step 2: Check revocation status
        if (cert.getStatus() == CertificateStatus.REVOKED) {
            log.warn("Verification attempted on REVOKED certificate '{}'", certId);
            logVerification(cert, certId, request, VerificationResult.REVOKED, ipAddress);
            return buildResponse(certId, VerificationResult.REVOKED, cert,
                    "This certificate has been revoked by the issuing hospital.");
        }

        // Step 3: Recompute SHA-256 hash from stored fields (canonical form)
        String recomputedHash;
        try {
            String canonicalData = cryptoService.canonicalizeCertificate(cert);
            recomputedHash = cryptoService.computeSHA256Hash(canonicalData);
        } catch (Exception e) {
            log.error("Error recomputing hash for certificate '{}'", certId, e);
            return buildResponse(certId, VerificationResult.TAMPERED, cert,
                    "Error during verification. The certificate may be corrupted.");
        }

        // Step 4: Verify the digital signature using hospital's RSA public key
        boolean signatureValid;
        try {
            PublicKey publicKey = cryptoService.pemToPublicKey(cert.getHospital().getPublicKey());
            // The stored digital signature was created by signing the original hash
            // We verify by checking: RSA-verify(storedSignature, recomputedHash, publicKey)
            signatureValid = cryptoService.verifySignature(
                    recomputedHash,
                    cert.getDigitalSignature(),
                    publicKey
            );
        } catch (Exception e) {
            log.error("Signature verification error for certificate '{}'", certId, e);
            signatureValid = false;
        }

        // Step 5: Determine result
        if (signatureValid) {
            log.info("Certificate '{}' verified as GENUINE", certId);
            logVerification(cert, certId, request, VerificationResult.GENUINE, ipAddress);
            return buildResponse(certId, VerificationResult.GENUINE, cert,
                    "This certificate is authentic and unaltered.");
        } else {
            log.warn("Certificate '{}' detected as TAMPERED – signature mismatch!", certId);
            logVerification(cert, certId, request, VerificationResult.TAMPERED, ipAddress);
            return buildResponse(certId, VerificationResult.TAMPERED, cert,
                    "WARNING: This certificate has been tampered with! The content does not match the original signature.");
        }
    }

    /**
     * Convenience method: verify without verifier details (quick public check).
     */
    @Transactional
    public VerifyResponse verifyCertificatePublic(String certificateId, String ipAddress) {
        VerifyRequest request = new VerifyRequest();
        request.setCertificateId(certificateId);
        request.setVerifierName("Anonymous");
        request.setVerifierOrganization("Public");
        return verifyCertificate(request, ipAddress);
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private void logVerification(MedicalCertificate cert, String certId,
                                 VerifyRequest request, VerificationResult result,
                                 String ipAddress) {
        VerificationLog logEntry = new VerificationLog();
        logEntry.setCertificate(cert);
        logEntry.setCertificateId(certId);
        logEntry.setVerifierName(request.getVerifierName() != null ? request.getVerifierName() : "Anonymous");
        logEntry.setVerifierOrganization(request.getVerifierOrganization() != null ? request.getVerifierOrganization() : "Unknown");
        logEntry.setVerificationResult(result);
        logEntry.setVerifiedAt(LocalDateTime.now());
        logEntry.setIpAddress(ipAddress != null ? ipAddress : "unknown");
        verificationLogRepository.save(logEntry);
    }

    private VerifyResponse buildResponse(String certId, VerificationResult result,
                                         MedicalCertificate cert, String message) {
        VerifyResponse r = new VerifyResponse();
        r.setCertificateId(certId);
        r.setResult(result.name());
        r.setMessage(message);
        r.setVerifiedAt(LocalDateTime.now());

        if (cert != null) {
            r.setPatientName(cert.getPatientName());
            r.setAge(cert.getAge());
            r.setGender(cert.getGender().name());
            r.setDisease(cert.getDisease());
            r.setTreatment(cert.getTreatment());
            r.setDoctorName("Dr. " + cert.getDoctor().getName());
            r.setDoctorRegistrationNumber(cert.getDoctor().getRegistrationNumber());
            r.setHospitalName(cert.getHospital().getName());
            r.setIssueDate(cert.getIssueDate());
            r.setExpiryDate(cert.getExpiryDate());
            r.setCertificateStatus(cert.getStatus().name());
        }

        return r;
    }
}
