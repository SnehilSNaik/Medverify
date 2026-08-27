package com.medverify.controller;

import com.medverify.dto.*;
import com.medverify.service.VerificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * VerificationController exposes the public certificate verification API.
 * No authentication required – anyone can verify a certificate.
 */
@RestController
@RequestMapping("/api/verify")

public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    /**
     * POST /api/verify
     * Verifies a certificate by ID with verifier information recorded in the audit log.
     * Body: { certificateId, verifierName, verifierOrganization }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<VerifyResponse>> verify(
            @Valid @RequestBody VerifyRequest request,
            HttpServletRequest httpRequest) {

        String ip = getClientIp(httpRequest);
        VerifyResponse result = verificationService.verifyCertificate(request, ip);
        return ResponseEntity.ok(ApiResponse.success("Verification complete", result));
    }

    /**
     * GET /api/verify/{certificateId}
     * Quick public verification by certificate ID (no verifier info needed).
     * Useful when users follow the QR code link.
     */
    @GetMapping("/{certificateId}")
    public ResponseEntity<ApiResponse<VerifyResponse>> verifyById(
            @PathVariable String certificateId,
            HttpServletRequest httpRequest) {

        String ip = getClientIp(httpRequest);
        VerifyResponse result = verificationService.verifyCertificatePublic(certificateId, ip);
        return ResponseEntity.ok(ApiResponse.success("Verification complete", result));
    }

    /**
     * Extracts the real client IP, handling X-Forwarded-For header for proxies.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
