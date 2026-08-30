package com.medverify;

import com.medverify.crypto.CryptoService;
import com.medverify.entity.*;
import com.medverify.repository.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DataInitializer seeds the database with default users and sample data on startup.
 * Only creates data if it doesn't already exist (idempotent).
 *
 * NOTE: All seeded accounts have mustChangePassword=true, requiring users
 * to set a new password on their first login.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalCertificateRepository certificateRepository;
    private final PasswordEncoder passwordEncoder;
    private final CryptoService cryptoService;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DataInitializer.class);

    public DataInitializer(UserRepository userRepository, HospitalRepository hospitalRepository, DoctorRepository doctorRepository, MedicalCertificateRepository certificateRepository, PasswordEncoder passwordEncoder, CryptoService cryptoService) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
        this.certificateRepository = certificateRepository;
        this.passwordEncoder = passwordEncoder;
        this.cryptoService = cryptoService;
    }

    @Override
    public void run(String... args) throws Exception {
        // ── 1. Create default Admin ──────────────────────────────────────────
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@medverify.com");
            admin.setPassword(passwordEncoder.encode("Admin@MedVerify2024!"));
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            admin.setMustChangePassword(true);
            userRepository.save(admin);
            log.info("✅ Admin user created (must change password on first login)");
        }

        // ── 2. Create sample Hospital with RSA keys ──────────────────────────
        Hospital hospital;
        if (hospitalRepository.findByLicenseNumber("HOSP001").isEmpty()) {
            KeyPair keyPair = cryptoService.generateRSAKeyPair();

            hospital = new Hospital();
            hospital.setName("City General Hospital");
            hospital.setAddress("123 Medical Avenue, Health City, HC 10001");
            hospital.setPhone("+1-555-0100");
            hospital.setEmail("info@citygeneralhospital.com");
            hospital.setLicenseNumber("HOSP001");
            hospital.setPublicKey(cryptoService.publicKeyToPem(keyPair.getPublic()));
            hospital.setPrivateKeyEncrypted(
                    cryptoService.encryptPrivateKey(cryptoService.privateKeyToPem(keyPair.getPrivate())));
            hospital.setActive(true);
            hospital = hospitalRepository.save(hospital);
            log.info("✅ Sample hospital created: City General Hospital (HOSP001)");
        } else {
            hospital = hospitalRepository.findByLicenseNumber("HOSP001").get();
        }

        // ── 3. Create Hospital user linked to the sample hospital ────────────
        if (userRepository.findByUsername("hospital1").isEmpty()) {
            User hospitalUser = new User();
            hospitalUser.setUsername("hospital1");
            hospitalUser.setEmail("hospital1@medverify.com");
            hospitalUser.setPassword(passwordEncoder.encode("Hospital@Secure2024!"));
            hospitalUser.setRole(UserRole.HOSPITAL);
            hospitalUser.setHospital(hospital);
            hospitalUser.setActive(true);
            hospitalUser.setMustChangePassword(true);
            userRepository.save(hospitalUser);
            log.info("✅ Hospital user created (must change password on first login)");
        }

        // ── 4. Create sample Doctor ──────────────────────────────────────────
        Doctor doctor;
        if (doctorRepository.findByRegistrationNumber("DR-001").isEmpty()) {
            doctor = new Doctor();
            doctor.setName("John Smith");
            doctor.setRegistrationNumber("DR-001");
            doctor.setSpecialization("General Medicine");
            doctor.setPhone("+1-555-0101");
            doctor.setHospital(hospital);
            doctor.setActive(true);
            doctor = doctorRepository.save(doctor);
            log.info("✅ Sample doctor created: Dr. John Smith (DR-001)");
        } else {
            doctor = doctorRepository.findByRegistrationNumber("DR-001").get();
        }

        // ── 5. Create sample Verifier user ───────────────────────────────────
        if (userRepository.findByUsername("verifier1").isEmpty()) {
            User verifier = new User();
            verifier.setUsername("verifier1");
            verifier.setEmail("verifier1@university.edu");
            verifier.setPassword(passwordEncoder.encode("Verifier@Secure2024!"));
            verifier.setRole(UserRole.VERIFIER);
            verifier.setActive(true);
            verifier.setMustChangePassword(true);
            userRepository.save(verifier);
            log.info("✅ Verifier user created (must change password on first login)");
        }

        // ── 5b. Create sample Student user ───────────────────────────────────
        if (userRepository.findByUsername("student1").isEmpty()) {
            User student = new User();
            student.setUsername("student1");
            student.setEmail("student1@university.edu");
            student.setPassword(passwordEncoder.encode("Student@Secure2024!"));
            student.setRole(UserRole.STUDENT);
            student.setActive(true);
            student.setMustChangePassword(true);
            userRepository.save(student);
            log.info("✅ Student user created (must change password on first login)");
        }

        // ── 6. Create sample certificates (for demo and verification testing) ──
        if (certificateRepository.count() == 0) {
            try {
                // Build a genuine verified certificate
                MedicalCertificate cert = new MedicalCertificate();
                cert.setCertificateId("CERT-GENUINE-2024-001");
                cert.setPatientName("Jane Doe");
                cert.setAge(28);
                cert.setGender(Gender.FEMALE);
                cert.setDisease("Upper Respiratory Infection");
                cert.setTreatment("Antibiotics and rest for 5 days");
                cert.setDoctor(doctor);
                cert.setHospital(hospital);
                cert.setIssueDate(LocalDate.now());
                cert.setExpiryDate(LocalDate.now().plusDays(30));
                cert.setStatus(CertificateStatus.ACTIVE);

                // Compute hash and sign
                String canonicalData = cryptoService.canonicalizeCertificate(cert);
                String hash = cryptoService.computeSHA256Hash(canonicalData);
                cert.setCertificateHash(hash);

                String privatePem = cryptoService.decryptPrivateKey(hospital.getPrivateKeyEncrypted());
                java.security.PrivateKey privateKey = cryptoService.pemToPrivateKey(privatePem);
                cert.setDigitalSignature(cryptoService.signData(hash, privateKey));
                cert.setQrCodeData("");

                MedicalCertificate saved = certificateRepository.save(cert);
                log.info("✅ Sample genuine certificate created: ID = {}", saved.getCertificateId());
                log.info("   Patient: Jane Doe | Doctor: Dr. John Smith | Hospital: City General Hospital");
                log.info("   Use this ID to test verification: {}", saved.getCertificateId());

                // Also create a sample revoked certificate to test revocation detection
                MedicalCertificate revokedCert = new MedicalCertificate();
                revokedCert.setCertificateId("CERT-REVOKED-2024-999");
                revokedCert.setPatientName("Robert Johnson");
                revokedCert.setAge(45);
                revokedCert.setGender(Gender.MALE);
                revokedCert.setDisease("Acute Gastritis");
                revokedCert.setTreatment("Antacids and clinical bed rest for 10 days");
                revokedCert.setDoctor(doctor);
                revokedCert.setHospital(hospital);
                revokedCert.setIssueDate(LocalDate.now().minusDays(10));
                revokedCert.setExpiryDate(LocalDate.now().plusDays(5));
                revokedCert.setStatus(CertificateStatus.REVOKED);

                String canonicalRevoked = cryptoService.canonicalizeCertificate(revokedCert);
                String hashRevoked = cryptoService.computeSHA256Hash(canonicalRevoked);
                revokedCert.setCertificateHash(hashRevoked);
                revokedCert.setDigitalSignature(cryptoService.signData(hashRevoked, privateKey));
                revokedCert.setQrCodeData("");
                certificateRepository.save(revokedCert);
                log.info("✅ Sample revoked certificate created: ID = CERT-REVOKED-2024-999");
            } catch (Exception e) {
                log.warn("Could not create sample certificate: {}", e.getMessage());
            }
        }

        log.info("═══════════════════════════════════════════════════════════");
        log.info("  🏥 MedVerify – Started Successfully!");
        log.info("  🔒 Security: Account lockout, audit trail, rate limiting ACTIVE");
        log.info("  📋 Default users seeded (password change required on first login)");
        log.info("  🌐 Backend API: http://localhost:8080");
        log.info("  🖥️  Frontend:   http://localhost:3000");
        log.info("═══════════════════════════════════════════════════════════");
    }
}

