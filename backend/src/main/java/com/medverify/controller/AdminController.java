package com.medverify.controller;

import com.medverify.dto.*;
import com.medverify.entity.AuditLog;
import com.medverify.service.AdminService;
import com.medverify.service.AuditService;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AdminController handles all administrative REST endpoints.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")

@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AuditService auditService;

    public AdminController(AdminService adminService, AuditService auditService) {
        this.adminService = adminService;
        this.auditService = auditService;
    }

    // ─── DASHBOARD ────────────────────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", adminService.getDashboardStats()));
    }

    // ─── HOSPITAL MANAGEMENT ──────────────────────────────────────────────────

    @GetMapping("/hospitals")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getAllHospitals() {
        return ResponseEntity.ok(ApiResponse.success("Hospitals retrieved", adminService.getAllHospitals()));
    }

    @GetMapping("/hospitals/{id}")
    public ResponseEntity<ApiResponse<HospitalResponse>> getHospitalById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Hospital retrieved", adminService.getHospitalById(id)));
    }

    @PostMapping("/hospitals")
    public ResponseEntity<ApiResponse<HospitalResponse>> createHospital(
            @Valid @RequestBody HospitalRequest request) throws Exception {
        HospitalResponse response = adminService.createHospital(request);
        return ResponseEntity.status(201).body(ApiResponse.success("Hospital created successfully", response));
    }

    @PutMapping("/hospitals/{id}")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateHospital(
            @PathVariable Long id,
            @Valid @RequestBody HospitalRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Hospital updated", adminService.updateHospital(id, request)));
    }

    @PostMapping("/hospitals/{id}/toggle-active")
    public ResponseEntity<ApiResponse<HospitalResponse>> toggleHospitalActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Hospital status toggled", adminService.toggleHospitalActive(id)));
    }

    @PostMapping("/hospitals/{id}/regenerate-keys")
    public ResponseEntity<ApiResponse<HospitalResponse>> regenerateKeys(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(ApiResponse.success(
                "RSA keys regenerated. Existing certificates will require re-issuance.",
                adminService.regenerateHospitalKeys(id)));
    }

    // ─── USER MANAGEMENT ──────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", adminService.getAllUsers()));
    }

    @PostMapping("/users/verifier")
    public ResponseEntity<ApiResponse<UserResponse>> createVerifierUser(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(201)
                .body(ApiResponse.success("Verifier user created", adminService.createVerifierUser(request)));
    }

    @PostMapping("/users/hospital/{hospitalId}")
    public ResponseEntity<ApiResponse<UserResponse>> createHospitalUser(
            @Valid @RequestBody CreateUserRequest request,
            @PathVariable Long hospitalId) {
        return ResponseEntity.status(201)
                .body(ApiResponse.success("Hospital user created", adminService.createHospitalUser(request, hospitalId)));
    }

    // ─── VERIFICATION LOGS ────────────────────────────────────────────────────

    @GetMapping("/verification-logs")
    public ResponseEntity<ApiResponse<List<VerificationLogResponse>>> getVerificationLogs() {
        return ResponseEntity.ok(ApiResponse.success("Logs retrieved", adminService.getAllVerificationLogs()));
    }

    @GetMapping("/certificates/revoked")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getRevokedCertificates() {
        return ResponseEntity.ok(ApiResponse.success("Revoked certificates retrieved", adminService.getRevokedCertificates()));
    }

    // ─── AUDIT TRAIL ──────────────────────────────────────────────────────────

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs() {
        List<AuditLogResponse> logs = auditService.getRecentLogs().stream()
                .map(this::toAuditLogResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    private AuditLogResponse toAuditLogResponse(AuditLog log) {
        AuditLogResponse r = new AuditLogResponse();
        r.setId(log.getId());
        r.setAction(log.getAction());
        r.setUsername(log.getUsername());
        r.setRole(log.getRole());
        r.setDetails(log.getDetails());
        r.setIpAddress(log.getIpAddress());
        r.setSeverity(log.getSeverity());
        r.setTimestamp(log.getTimestamp());
        return r;
    }
}
