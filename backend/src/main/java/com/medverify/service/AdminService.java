package com.medverify.service;

import com.medverify.crypto.CryptoService;
import com.medverify.dto.*;
import com.medverify.entity.*;
import com.medverify.exception.ResourceNotFoundException;
import com.medverify.repository.*;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.KeyPair;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AdminService handles all administrative operations:
 * hospital management, user management, dashboard stats, and verification logs.
 */
@Service

public class AdminService {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalCertificateRepository certificateRepository;
    private final VerificationLogRepository verificationLogRepository;
    private final CryptoService cryptoService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AdminService.class);

    public AdminService(HospitalRepository hospitalRepository, UserRepository userRepository,
                        DoctorRepository doctorRepository, MedicalCertificateRepository certificateRepository,
                        VerificationLogRepository verificationLogRepository, CryptoService cryptoService,
                        PasswordEncoder passwordEncoder, AuditService auditService) {
        this.hospitalRepository = hospitalRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.certificateRepository = certificateRepository;
        this.verificationLogRepository = verificationLogRepository;
        this.cryptoService = cryptoService;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    // ─── DASHBOARD ────────────────────────────────────────────────────────────

    /**
     * Returns aggregated statistics for the admin dashboard.
     */
    public DashboardStats getDashboardStats() {
        long totalCertificates   = certificateRepository.count();
        long activeCertificates  = certificateRepository.countByStatus(CertificateStatus.ACTIVE);
        long revokedCertificates = certificateRepository.countByStatus(CertificateStatus.REVOKED);
        long totalHospitals      = hospitalRepository.count();
        long totalVerifications  = verificationLogRepository.count();
        long genuineCount        = verificationLogRepository.countByVerificationResult(VerificationResult.GENUINE);
        long tamperedCount       = verificationLogRepository.countByVerificationResult(VerificationResult.TAMPERED);
        long notFoundCount       = verificationLogRepository.countByVerificationResult(VerificationResult.NOT_FOUND);

        return new DashboardStats(
                totalCertificates,
                activeCertificates,
                revokedCertificates,
                totalHospitals,
                totalVerifications,
                genuineCount,
                tamperedCount,
                tamperedCount + notFoundCount // fraud attempts = tampered + not found
        );
    }

    // ─── HOSPITAL MANAGEMENT ──────────────────────────────────────────────────

    /**
     * Returns all hospitals.
     */
    public List<HospitalResponse> getAllHospitals() {
        return hospitalRepository.findAll().stream()
                .map(this::toHospitalResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns a hospital by ID.
     */
    public HospitalResponse getHospitalById(Long id) {
        Hospital hospital = findHospitalOrThrow(id);
        return toHospitalResponse(hospital);
    }

    /**
     * Creates a new hospital with auto-generated RSA key pair.
     */
    @Transactional
    public HospitalResponse createHospital(HospitalRequest request) throws Exception {
        Hospital hospital = new Hospital();
        hospital.setName(request.getName());
        hospital.setAddress(request.getAddress());
        hospital.setPhone(request.getPhone());
        hospital.setEmail(request.getEmail());
        hospital.setLicenseNumber(request.getLicenseNumber());
        hospital.setActive(true);

        // Generate RSA key pair for this hospital
        generateAndSetKeys(hospital);

        Hospital saved = hospitalRepository.save(hospital);
        auditService.logInfo(AuditService.HOSPITAL_CREATED, "admin", "ADMIN",
                "Created hospital: " + saved.getName() + " (" + saved.getLicenseNumber() + ")", "system");
        log.info("Created hospital '{}' with ID {}", saved.getName(), saved.getId());
        return toHospitalResponse(saved);
    }

    /**
     * Updates hospital information (non-key fields).
     */
    @Transactional
    public HospitalResponse updateHospital(Long id, HospitalRequest request) {
        Hospital hospital = findHospitalOrThrow(id);
        hospital.setName(request.getName());
        hospital.setAddress(request.getAddress());
        hospital.setPhone(request.getPhone());
        hospital.setEmail(request.getEmail());
        hospital.setLicenseNumber(request.getLicenseNumber());
        Hospital saved = hospitalRepository.save(hospital);
        auditService.logInfo(AuditService.HOSPITAL_UPDATED, "admin", "ADMIN",
                "Updated hospital: " + saved.getName(), "system");
        return toHospitalResponse(saved);
    }

    /**
     * Toggles a hospital's active/inactive status.
     */
    @Transactional
    public HospitalResponse toggleHospitalActive(Long id) {
        Hospital hospital = findHospitalOrThrow(id);
        hospital.setActive(!hospital.isActive());
        Hospital saved = hospitalRepository.save(hospital);
        auditService.logInfo(AuditService.USER_TOGGLED, "admin", "ADMIN",
                "Hospital " + saved.getName() + " status set to " + (saved.isActive() ? "ACTIVE" : "INACTIVE"), "system");
        log.info("Hospital '{}' active status toggled to {}", hospital.getName(), hospital.isActive());
        return toHospitalResponse(saved);
    }

    /**
     * Regenerates the RSA key pair for a hospital.
     * WARNING: Existing certificates signed with the old key will no longer verify correctly.
     */
    @Transactional
    public HospitalResponse regenerateHospitalKeys(Long id) throws Exception {
        Hospital hospital = findHospitalOrThrow(id);
        generateAndSetKeys(hospital);
        Hospital saved = hospitalRepository.save(hospital);
        auditService.logCritical(AuditService.KEYS_REGENERATED, "admin", "ADMIN",
                "RSA Keypair regenerated for hospital: " + saved.getName(), "system");
        log.warn("RSA keys regenerated for hospital '{}'. Existing certificates invalidated!", hospital.getName());
        return toHospitalResponse(saved);
    }

    // ─── USER MANAGEMENT ──────────────────────────────────────────────────────

    /**
     * Returns all users (without passwords).
     */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new verifier user (college/company).
     */
    @Transactional
    public UserResponse createVerifierUser(CreateUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.VERIFIER);
        user.setActive(true);
        User saved = userRepository.save(user);
        auditService.logInfo(AuditService.USER_CREATED, "admin", "ADMIN",
                "Created verifier user: " + saved.getUsername(), "system");
        log.info("Created verifier user '{}'", saved.getUsername());
        return toUserResponse(saved);
    }

    /**
     * Creates a new hospital user linked to a hospital.
     */
    @Transactional
    public UserResponse createHospitalUser(CreateUserRequest request, Long hospitalId) {
        Hospital hospital = findHospitalOrThrow(hospitalId);
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.HOSPITAL);
        user.setHospital(hospital);
        user.setActive(true);
        User saved = userRepository.save(user);
        auditService.logInfo(AuditService.USER_CREATED, "admin", "ADMIN",
                "Created hospital user: " + saved.getUsername() + " for " + hospital.getName(), "system");
        return toUserResponse(saved);
    }

    // ─── VERIFICATION LOGS ────────────────────────────────────────────────────

    /**
     * Returns all verification logs sorted by date descending.
     */
    public List<VerificationLogResponse> getAllVerificationLogs() {
        return verificationLogRepository.findAllByOrderByVerifiedAtDesc().stream()
                .map(this::toLogResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns all revoked certificates.
     */
    public List<CertificateResponse> getRevokedCertificates() {
        return certificateRepository.findByStatus(CertificateStatus.REVOKED).stream()
                .map(this::toCertificateResponse)
                .collect(Collectors.toList());
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private void generateAndSetKeys(Hospital hospital) throws Exception {
        KeyPair keyPair = cryptoService.generateRSAKeyPair();
        hospital.setPublicKey(cryptoService.publicKeyToPem(keyPair.getPublic()));
        hospital.setPrivateKeyEncrypted(cryptoService.encryptPrivateKey(
                cryptoService.privateKeyToPem(keyPair.getPrivate())));
    }

    private Hospital findHospitalOrThrow(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
    }

    private HospitalResponse toHospitalResponse(Hospital h) {
        HospitalResponse r = new HospitalResponse();
        r.setId(h.getId());
        r.setName(h.getName());
        r.setAddress(h.getAddress());
        r.setPhone(h.getPhone());
        r.setEmail(h.getEmail());
        r.setLicenseNumber(h.getLicenseNumber());
        r.setActive(h.isActive());
        r.setPublicKey(h.getPublicKey());
        r.setCreatedAt(h.getCreatedAt());
        return r;
    }

    private UserResponse toUserResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setEmail(u.getEmail());
        r.setRole(u.getRole().name());
        r.setActive(u.isActive());
        r.setHospitalId(u.getHospital() != null ? u.getHospital().getId() : null);
        r.setHospitalName(u.getHospital() != null ? u.getHospital().getName() : null);
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }

    private VerificationLogResponse toLogResponse(VerificationLog log) {
        VerificationLogResponse r = new VerificationLogResponse();
        r.setId(log.getId());
        r.setCertificateId(log.getCertificateId());
        r.setVerifierName(log.getVerifierName());
        r.setVerifierOrganization(log.getVerifierOrganization());
        r.setVerificationResult(log.getVerificationResult().name());
        r.setVerifiedAt(log.getVerifiedAt());
        r.setIpAddress(log.getIpAddress());
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
        r.setDoctorName(c.getDoctor().getName());
        r.setDoctorRegistrationNumber(c.getDoctor().getRegistrationNumber());
        r.setHospitalName(c.getHospital().getName());
        r.setIssueDate(c.getIssueDate());
        r.setExpiryDate(c.getExpiryDate());
        r.setStatus(c.getStatus().name());
        r.setQrCodeData(c.getQrCodeData());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}
