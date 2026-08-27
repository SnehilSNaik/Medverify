package com.medverify.controller;

import com.medverify.dto.*;
import com.medverify.entity.User;
import com.medverify.exception.UnauthorizedException;
import com.medverify.repository.UserRepository;
import com.medverify.service.HospitalService;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * HospitalController handles all hospital-facing REST endpoints.
 * All endpoints require HOSPITAL role.
 * The hospital context is derived from the authenticated user's linked hospital.
 */
@RestController
@RequestMapping("/api/hospital")

@PreAuthorize("hasRole('HOSPITAL')")
public class HospitalController {

    private final HospitalService hospitalService;
    private final UserRepository userRepository;

    public HospitalController(HospitalService hospitalService, UserRepository userRepository) {
        this.hospitalService = hospitalService;
        this.userRepository = userRepository;
    }

    // ─── DOCTOR MANAGEMENT ────────────────────────────────────────────────────

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctors() {
        Long hospitalId = getCurrentHospitalId();
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved",
                hospitalService.getDoctorsByHospital(hospitalId)));
    }

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<DoctorResponse>> addDoctor(
            @Valid @RequestBody DoctorRequest request) {
        Long hospitalId = getCurrentHospitalId();
        DoctorResponse response = hospitalService.addDoctor(hospitalId, request);
        return ResponseEntity.status(201).body(ApiResponse.success("Doctor added", response));
    }

    @PutMapping("/doctors/{doctorId}")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorRequest request) {
        Long hospitalId = getCurrentHospitalId();
        return ResponseEntity.ok(ApiResponse.success("Doctor updated",
                hospitalService.updateDoctor(hospitalId, doctorId, request)));
    }

    @PostMapping("/doctors/{doctorId}/toggle-active")
    public ResponseEntity<ApiResponse<DoctorResponse>> toggleDoctor(@PathVariable Long doctorId) {
        Long hospitalId = getCurrentHospitalId();
        return ResponseEntity.ok(ApiResponse.success("Doctor status toggled",
                hospitalService.toggleDoctorActive(hospitalId, doctorId)));
    }

    // ─── CERTIFICATE MANAGEMENT ───────────────────────────────────────────────

    @GetMapping("/certificates")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getCertificates() {
        Long hospitalId = getCurrentHospitalId();
        return ResponseEntity.ok(ApiResponse.success("Certificates retrieved",
                hospitalService.getCertificatesByHospital(hospitalId)));
    }

    @PostMapping("/certificates")
    public ResponseEntity<ApiResponse<CertificateResponse>> issueCertificate(
            @Valid @RequestBody CertificateRequest request) throws Exception {
        Long hospitalId = getCurrentHospitalId();
        CertificateResponse response = hospitalService.issueCertificate(hospitalId, request);
        return ResponseEntity.status(201).body(ApiResponse.success(
                "Certificate issued successfully with digital signature", response));
    }

    @PostMapping("/certificates/{certificateId}/revoke")
    public ResponseEntity<ApiResponse<CertificateResponse>> revokeCertificate(
            @PathVariable String certificateId) {
        Long hospitalId = getCurrentHospitalId();
        return ResponseEntity.ok(ApiResponse.success("Certificate revoked",
                hospitalService.revokeCertificate(hospitalId, certificateId)));
    }

    /**
     * Returns PDF certificate as binary download.
     */
    @GetMapping("/certificates/{certificateId}/pdf")
    public ResponseEntity<byte[]> downloadPDF(@PathVariable String certificateId) throws Exception {
        Long hospitalId = getCurrentHospitalId();
        byte[] pdfBytes = hospitalService.getCertificatePDF(hospitalId, certificateId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"certificate-" + certificateId + ".pdf\"")
                .body(pdfBytes);
    }

    /**
     * Returns QR code as PNG image binary.
     */
    @GetMapping("/certificates/{certificateId}/qr")
    public ResponseEntity<byte[]> getQRCode(@PathVariable String certificateId) throws Exception {
        Long hospitalId = getCurrentHospitalId();
        byte[] qrBytes = hospitalService.getCertificateQR(hospitalId, certificateId);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrBytes);
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    /**
     * Extracts the hospital ID from the currently authenticated hospital user.
     */
    private Long getCurrentHospitalId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getHospital() == null) {
            throw new UnauthorizedException("Your account is not linked to a hospital. Contact admin.");
        }

        return user.getHospital().getId();
    }
}
