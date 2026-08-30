package com.medverify.controller;

import com.medverify.dto.*;
import com.medverify.service.AIForgeryService;
import com.medverify.service.VerificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * VerifierController provides specialized APIs for Colleges, Employers, and Verifying Institutions.
 * Includes AI/ML Forgery Detection and Authenticated Verification Logs.
 */
@RestController
@RequestMapping("/api/verifier")
public class VerifierController {

    private final AIForgeryService aiForgeryService;
    private final VerificationService verificationService;

    public VerifierController(AIForgeryService aiForgeryService, VerificationService verificationService) {
        this.aiForgeryService = aiForgeryService;
        this.verificationService = verificationService;
    }

    /**
     * POST /api/verifier/ai-analyze
     * Runs AI Forgery & Visual Pattern Analysis on an uploaded certificate or certificate ID.
     */
    @PostMapping("/ai-analyze")
    public ResponseEntity<ApiResponse<AIForgeryResponse>> analyzeDocument(
            @RequestBody AIForgeryRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        AIForgeryResponse response = aiForgeryService.analyzeDocument(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("AI Forensic Analysis Complete", response));
    }

    /**
     * POST /api/verifier/verify
     * Authenticated verification by institution verifiers.
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<VerifyResponse>> verify(
            @Valid @RequestBody VerifyRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        VerifyResponse response = verificationService.verifyCertificate(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Verification Complete", response));
    }

    /**
     * GET /api/verifier/dataset
     * Returns Forensic Benchmark Rules and ICD-10 medical plausibility checks.
     */
    @GetMapping("/dataset")
    public ResponseEntity<ApiResponse<Object>> getDatasetInfo() {
        return ResponseEntity.ok(ApiResponse.success("Forensic Rules Retrieved", aiForgeryService.getDatasetRoot()));
    }

    /**
     * GET /api/verifier/model-info
     * Returns the ELA forensic model feature weights and metrics.
     */
    @GetMapping("/model-info")
    public ResponseEntity<ApiResponse<Object>> getModelInfo() {
        return ResponseEntity.ok(ApiResponse.success("Forensic Model Metrics Retrieved", aiForgeryService.getModelWeightsRoot()));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
