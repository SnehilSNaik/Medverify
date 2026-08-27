package com.medverify.service;

import com.medverify.crypto.CryptoService;
import com.medverify.dto.ChangePasswordRequest;
import com.medverify.dto.LoginRequest;
import com.medverify.dto.LoginResponse;
import com.medverify.dto.SignupRequest;
import com.medverify.entity.Hospital;
import com.medverify.entity.User;
import com.medverify.entity.UserRole;
import com.medverify.repository.HospitalRepository;
import com.medverify.repository.UserRepository;
import com.medverify.security.JwtUtil;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.KeyPair;
import java.time.LocalDateTime;

/**
 * AuthService handles user authentication with advanced security:
 * - Account lockout after 5 failed login attempts (15-minute lockout)
 * - Audit trail logging for all authentication events
 * - Last login timestamp tracking
 * - Password change with force-change-on-first-login
 * - Self-service registration for Verifiers and Hospitals
 */
@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final AuditService auditService;
    private final CryptoService cryptoService;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    public AuthService(UserRepository userRepository, HospitalRepository hospitalRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       UserDetailsService userDetailsService, AuditService auditService,
                       CryptoService cryptoService) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.auditService = auditService;
        this.cryptoService = cryptoService;
    }

    /**
     * Authenticates a user with lockout protection and audit logging.
     */
    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    auditService.logWarning(AuditService.LOGIN_FAILED, request.getUsername(),
                            "UNKNOWN", "User not found", ipAddress);
                    return new BadCredentialsException("Invalid username or password");
                });

        // Check if account is deactivated
        if (!user.isActive()) {
            auditService.logWarning(AuditService.LOGIN_FAILED, user.getUsername(),
                    user.getRole().name(), "Account deactivated", ipAddress);
            throw new BadCredentialsException("Account is deactivated. Contact admin.");
        }

        // Check if account is locked out
        if (user.isLockedOut()) {
            long minutesRemaining = java.time.Duration.between(LocalDateTime.now(), user.getLockoutUntil()).toMinutes() + 1;
            auditService.logWarning(AuditService.LOGIN_FAILED, user.getUsername(),
                    user.getRole().name(), "Account locked, " + minutesRemaining + " min remaining", ipAddress);
            throw new BadCredentialsException(
                    "Account locked due to too many failed attempts. Try again in " + minutesRemaining + " minutes.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            handleFailedLogin(user, ipAddress);
            throw new BadCredentialsException("Invalid username or password");
        }

        // ── Successful login ──
        handleSuccessfulLogin(user, ipAddress);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken  = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        Long hospitalId = user.getHospital() != null ? user.getHospital().getId() : null;

        log.info("User '{}' logged in with role {} (IP: {})", user.getUsername(), user.getRole(), ipAddress);

        return new LoginResponse(
                accessToken,
                refreshToken,
                user.getRole().name(),
                user.getUsername(),
                user.getEmail(),
                hospitalId,
                user.isMustChangePassword(),
                user.getLastLoginAt()
        );
    }

    /**
     * Changes user's password. Requires current password for verification.
     */
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request, String ipAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            auditService.logWarning(AuditService.PASSWORD_CHANGED, username,
                    user.getRole().name(), "Password change failed — wrong current password", ipAddress);
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        auditService.logInfo(AuditService.PASSWORD_CHANGED, username,
                user.getRole().name(), "Password changed successfully", ipAddress);
        log.info("User '{}' changed their password", username);
    }

    /**
     * Self-service registration for Verifiers and Hospitals.
     */
    @Transactional
    public LoginResponse register(SignupRequest request, String ipAddress) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BadCredentialsException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadCredentialsException("Email '" + request.getEmail() + "' is already registered.");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
            if (role == UserRole.ADMIN) {
                throw new BadCredentialsException("Self-registration as Admin is not permitted.");
            }
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid role specified. Choose VERIFIER or HOSPITAL.");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setActive(true);
        user.setMustChangePassword(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLoginAt(LocalDateTime.now());

        if (role == UserRole.HOSPITAL) {
            if (request.getLicenseNumber() == null || request.getLicenseNumber().isBlank()) {
                throw new BadCredentialsException("Hospital license number is required for registration.");
            }
            if (hospitalRepository.findByLicenseNumber(request.getLicenseNumber().trim()).isPresent()) {
                throw new BadCredentialsException("Hospital license number '" + request.getLicenseNumber() + "' is already registered.");
            }

            try {
                KeyPair keyPair = cryptoService.generateRSAKeyPair();
                Hospital hospital = new Hospital();
                hospital.setName(request.getHospitalName() != null && !request.getHospitalName().isBlank()
                        ? request.getHospitalName().trim()
                        : request.getUsername() + " Medical Center");
                hospital.setLicenseNumber(request.getLicenseNumber().trim());
                hospital.setAddress(request.getAddress() != null && !request.getAddress().isBlank()
                        ? request.getAddress().trim()
                        : "Address not provided");
                hospital.setPhone(request.getPhone() != null && !request.getPhone().isBlank()
                        ? request.getPhone().trim()
                        : "Phone not provided");
                hospital.setEmail(request.getEmail().trim());
                hospital.setPublicKey(cryptoService.publicKeyToPem(keyPair.getPublic()));
                hospital.setPrivateKeyEncrypted(
                        cryptoService.encryptPrivateKey(cryptoService.privateKeyToPem(keyPair.getPrivate())));
                hospital.setActive(true);
                hospital.setCreatedAt(LocalDateTime.now());
                Hospital savedHospital = hospitalRepository.save(hospital);
                user.setHospital(savedHospital);
                auditService.logInfo(AuditService.HOSPITAL_CREATED, user.getUsername(), "HOSPITAL",
                        "Hospital registered: " + savedHospital.getName() + " (" + savedHospital.getLicenseNumber() + ")", ipAddress);
            } catch (Exception e) {
                log.error("Failed to generate RSA keypair for hospital registration", e);
                throw new RuntimeException("Failed to generate cryptographic security keys for hospital: " + e.getMessage());
            }
        }

        User savedUser = userRepository.save(user);
        auditService.logInfo(AuditService.USER_CREATED, savedUser.getUsername(), savedUser.getRole().name(),
                "User registered with role " + savedUser.getRole().name(), ipAddress);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getUsername());
        String accessToken  = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);
        Long hospitalId = savedUser.getHospital() != null ? savedUser.getHospital().getId() : null;

        log.info("New user registered: '{}' with role {} (IP: {})", savedUser.getUsername(), savedUser.getRole(), ipAddress);

        return new LoginResponse(
                accessToken,
                refreshToken,
                savedUser.getRole().name(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                hospitalId,
                savedUser.isMustChangePassword(),
                savedUser.getLastLoginAt()
        );
    }

    /**
     * Creates a user account (used internally by AdminService and DataInitializer).
     */
    public User createUser(String username, String email, String rawPassword, UserRole role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setActive(true);
        return userRepository.save(user);
    }

    // ── Private helpers ──

    private void handleFailedLogin(User user, String ipAddress) {
        int newFailCount = user.getFailedAttempts() + 1;
        user.setFailedAttempts(newFailCount);

        if (newFailCount >= MAX_FAILED_ATTEMPTS) {
            user.setLockoutUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
            userRepository.save(user);
            auditService.logCritical(AuditService.ACCOUNT_LOCKED, user.getUsername(),
                    user.getRole().name(),
                    "Account locked after " + MAX_FAILED_ATTEMPTS + " failed attempts for " + LOCKOUT_MINUTES + " minutes",
                    ipAddress);
            log.warn("Account '{}' LOCKED after {} failed attempts", user.getUsername(), MAX_FAILED_ATTEMPTS);
        } else {
            userRepository.save(user);
            auditService.logWarning(AuditService.LOGIN_FAILED, user.getUsername(),
                    user.getRole().name(),
                    "Failed attempt " + newFailCount + "/" + MAX_FAILED_ATTEMPTS,
                    ipAddress);
        }
    }

    private void handleSuccessfulLogin(User user, String ipAddress) {
        // Reset failed attempts and lockout
        user.setFailedAttempts(0);
        user.setLockoutUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        auditService.logInfo(AuditService.LOGIN_SUCCESS, user.getUsername(),
                user.getRole().name(), "Login successful", ipAddress);
    }
}

