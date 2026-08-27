package com.medverify.service;

import com.medverify.crypto.CryptoService;
import com.medverify.dto.*;
import com.medverify.entity.*;
import com.medverify.exception.ResourceNotFoundException;
import com.medverify.exception.UnauthorizedException;
import com.medverify.pdf.PDFService;
import com.medverify.qr.QRCodeService;
import com.medverify.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.PrivateKey;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * HospitalService handles all hospital-facing operations:
 * doctor management and certificate issuance/management.
 */
@Service

public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalCertificateRepository certificateRepository;
    private final CryptoService cryptoService;
    private final QRCodeService qrCodeService;
    private final PDFService pdfService;
    private final AuditService auditService;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(HospitalService.class);

    public HospitalService(HospitalRepository hospitalRepository, DoctorRepository doctorRepository,
                           MedicalCertificateRepository certificateRepository, CryptoService cryptoService,
                           QRCodeService qrCodeService, PDFService pdfService, AuditService auditService) {
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
        this.certificateRepository = certificateRepository;
        this.cryptoService = cryptoService;
        this.qrCodeService = qrCodeService;
        this.pdfService = pdfService;
        this.auditService = auditService;
    }

    // ─── DOCTOR MANAGEMENT ────────────────────────────────────────────────────

    /**
     * Returns all doctors for a given hospital.
     */
    public List<DoctorResponse> getDoctorsByHospital(Long hospitalId) {
        return doctorRepository.findByHospitalId(hospitalId).stream()
                .map(this::toDoctorResponse)
                .collect(Collectors.toList());
    }

    /**
     * Adds a new doctor to the hospital.
     */
    @Transactional
    public DoctorResponse addDoctor(Long hospitalId, DoctorRequest request) {
        Hospital hospital = findHospitalOrThrow(hospitalId);

        Doctor doctor = new Doctor();
        doctor.setName(request.getName());
        doctor.setRegistrationNumber(request.getRegistrationNumber());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setPhone(request.getPhone());
        doctor.setHospital(hospital);
        doctor.setActive(true);

        Doctor saved = doctorRepository.save(doctor);
        log.info("Doctor '{}' added to hospital '{}'", saved.getName(), hospital.getName());
        return toDoctorResponse(saved);
    }

    /**
     * Updates doctor details.
     */
    @Transactional
    public DoctorResponse updateDoctor(Long hospitalId, Long doctorId, DoctorRequest request) {
        Doctor doctor = findDoctorOrThrow(doctorId);
        verifyDoctorBelongsToHospital(doctor, hospitalId);

        doctor.setName(request.getName());
        doctor.setRegistrationNumber(request.getRegistrationNumber());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setPhone(request.getPhone());
        return toDoctorResponse(doctorRepository.save(doctor));
    }

    /**
     * Toggles a doctor's active status.
     */
    @Transactional
    public DoctorResponse toggleDoctorActive(Long hospitalId, Long doctorId) {
        Doctor doctor = findDoctorOrThrow(doctorId);
        verifyDoctorBelongsToHospital(doctor, hospitalId);
        doctor.setActive(!doctor.isActive());
        return toDoctorResponse(doctorRepository.save(doctor));
    }

    // ─── CERTIFICATE MANAGEMENT ───────────────────────────────────────────────

    /**
     * Returns all certificates issued by a hospital.
     */
    public List<CertificateResponse> getCertificatesByHospital(Long hospitalId) {
        return certificateRepository.findByHospitalId(hospitalId).stream()
                .map(this::toCertificateResponse)
                .collect(Collectors.toList());
    }

    /**
     * Issues a new medical certificate with SHA-256 hash and RSA digital signature.
     *
     * Flow:
     * 1. Validate doctor belongs to hospital
     * 2. Generate unique certificate ID
     * 3. Build certificate entity with all fields
     * 4. Canonicalize fields → compute SHA-256 hash
     * 5. Decrypt hospital's private key → sign hash with RSA
     * 6. Generate QR code (base64)
     * 7. Save and return
     */
    @Transactional
    public CertificateResponse issueCertificate(Long hospitalId, CertificateRequest request) throws Exception {
        Hospital hospital = findHospitalOrThrow(hospitalId);
        Doctor doctor = findDoctorOrThrow(request.getDoctorId());
        verifyDoctorBelongsToHospital(doctor, hospitalId);

        if (!doctor.isActive()) {
            throw new UnauthorizedException("Cannot issue certificate with an inactive doctor");
        }

        // Create the certificate entity
        MedicalCertificate cert = new MedicalCertificate();
        cert.setCertificateId(UUID.randomUUID().toString());
        cert.setPatientName(request.getPatientName().trim());
        cert.setAge(request.getAge());
        cert.setGender(request.getGender());
        cert.setDisease(request.getDisease().trim());
        cert.setTreatment(request.getTreatment().trim());
        cert.setDoctor(doctor);
        cert.setHospital(hospital);
        cert.setIssueDate(request.getIssueDate());
        cert.setExpiryDate(request.getExpiryDate());
        cert.setStatus(CertificateStatus.ACTIVE);
        cert.setCreatedAt(LocalDateTime.now());

        // Step 1: Compute SHA-256 hash from canonicalized fields
        String canonicalData  = cryptoService.canonicalizeCertificate(cert);
        String certificateHash = cryptoService.computeSHA256Hash(canonicalData);
        cert.setCertificateHash(certificateHash);

        // Step 2: Decrypt hospital's RSA private key and sign the hash
        String privatePem = cryptoService.decryptPrivateKey(hospital.getPrivateKeyEncrypted());
        PrivateKey privateKey = cryptoService.pemToPrivateKey(privatePem);
        String digitalSignature = cryptoService.signData(certificateHash, privateKey);
        cert.setDigitalSignature(digitalSignature);

        // Step 3: Generate QR code and store as base64
        String qrBase64 = qrCodeService.generateQRCodeBase64(cert.getCertificateId());
        cert.setQrCodeData(qrBase64);

        MedicalCertificate saved = certificateRepository.save(cert);
        auditService.logInfo(AuditService.CERT_ISSUED, hospital.getName(), "HOSPITAL",
                "Certificate issued for patient: " + saved.getPatientName() + " by Dr. " + doctor.getName(), "system");
        log.info("Certificate '{}' issued for patient '{}' by doctor '{}' at hospital '{}'",
                saved.getCertificateId(), saved.getPatientName(),
                doctor.getName(), hospital.getName());

        return toCertificateResponse(saved);
    }

    /**
     * Revokes an existing certificate. Once revoked, verification will show REVOKED result.
     */
    @Transactional
    public CertificateResponse revokeCertificate(Long hospitalId, String certificateId) {
        MedicalCertificate cert = certificateRepository.findByCertificateId(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + certificateId));

        if (!cert.getHospital().getId().equals(hospitalId)) {
            throw new UnauthorizedException("Certificate does not belong to your hospital");
        }

        cert.setStatus(CertificateStatus.REVOKED);
        MedicalCertificate revoked = certificateRepository.save(cert);
        auditService.logWarning(AuditService.CERT_REVOKED, cert.getHospital().getName(), "HOSPITAL",
                "Certificate REVOKED: " + certificateId + " (Patient: " + cert.getPatientName() + ")", "system");
        log.warn("Certificate '{}' revoked by hospital '{}'", certificateId, hospitalId);
        return toCertificateResponse(revoked);
    }

    /**
     * Generates and returns the PDF bytes for a certificate.
     */
    public byte[] getCertificatePDF(Long hospitalId, String certificateId) throws Exception {
        MedicalCertificate cert = certificateRepository.findByCertificateId(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + certificateId));

        if (!cert.getHospital().getId().equals(hospitalId)) {
            throw new UnauthorizedException("Certificate does not belong to your hospital");
        }

        return pdfService.generateCertificatePDF(cert, cert.getQrCodeData());
    }

    /**
     * Returns the QR code PNG bytes for a certificate.
     */
    public byte[] getCertificateQR(Long hospitalId, String certificateId) throws Exception {
        MedicalCertificate cert = certificateRepository.findByCertificateId(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + certificateId));

        if (!cert.getHospital().getId().equals(hospitalId)) {
            throw new UnauthorizedException("Certificate does not belong to your hospital");
        }

        return qrCodeService.generateQRCode(certificateId);
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private Hospital findHospitalOrThrow(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
    }

    private Doctor findDoctorOrThrow(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    private void verifyDoctorBelongsToHospital(Doctor doctor, Long hospitalId) {
        if (!doctor.getHospital().getId().equals(hospitalId)) {
            throw new UnauthorizedException("Doctor does not belong to your hospital");
        }
    }

    private DoctorResponse toDoctorResponse(Doctor d) {
        DoctorResponse r = new DoctorResponse();
        r.setId(d.getId());
        r.setName(d.getName());
        r.setRegistrationNumber(d.getRegistrationNumber());
        r.setSpecialization(d.getSpecialization());
        r.setPhone(d.getPhone());
        r.setActive(d.isActive());
        r.setHospitalId(d.getHospital().getId());
        r.setHospitalName(d.getHospital().getName());
        r.setCreatedAt(d.getCreatedAt());
        return r;
    }

    private CertificateResponse toCertificateResponse(MedicalCertificate c) {
        CertificateResponse r = new CertificateResponse();
        r.setId(c.getId());
        r.setCertificateId(c.getCertificateId());
        r.setPatientName(c.getPatientName());
        r.setAge(c.getAge());
        r.setGender(c.getGender().name());
        r.setDisease(c.getDisease());
        r.setTreatment(c.getTreatment());
        r.setDoctorId(c.getDoctor().getId());
        r.setDoctorName(c.getDoctor().getName());
        r.setDoctorRegistrationNumber(c.getDoctor().getRegistrationNumber());
        r.setHospitalName(c.getHospital().getName());
        r.setHospitalId(c.getHospital().getId());
        r.setIssueDate(c.getIssueDate());
        r.setExpiryDate(c.getExpiryDate());
        r.setCertificateHash(c.getCertificateHash());
        r.setStatus(c.getStatus().name());
        r.setQrCodeData(c.getQrCodeData());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}
