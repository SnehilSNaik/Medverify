package com.medverify.service;

import com.medverify.entity.AuditLog;
import com.medverify.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AuditService provides centralized audit logging for all security-relevant actions.
 * Logs are persisted to the audit_logs table for compliance and forensic analysis.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuditService.class);

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // ── Predefined action constants ──
    public static final String LOGIN_SUCCESS     = "LOGIN_SUCCESS";
    public static final String LOGIN_FAILED      = "LOGIN_FAILED";
    public static final String ACCOUNT_LOCKED    = "ACCOUNT_LOCKED";
    public static final String ACCOUNT_UNLOCKED  = "ACCOUNT_UNLOCKED";
    public static final String PASSWORD_CHANGED  = "PASSWORD_CHANGED";
    public static final String CERT_ISSUED       = "CERTIFICATE_ISSUED";
    public static final String CERT_REVOKED      = "CERTIFICATE_REVOKED";
    public static final String CERT_VERIFIED     = "CERTIFICATE_VERIFIED";
    public static final String HOSPITAL_CREATED  = "HOSPITAL_CREATED";
    public static final String HOSPITAL_UPDATED  = "HOSPITAL_UPDATED";
    public static final String KEYS_REGENERATED  = "KEYS_REGENERATED";
    public static final String USER_CREATED      = "USER_CREATED";
    public static final String USER_TOGGLED      = "USER_TOGGLED";

    // Severity levels
    public static final String INFO     = "INFO";
    public static final String WARNING  = "WARNING";
    public static final String CRITICAL = "CRITICAL";

    /**
     * Log an audit event.
     */
    public void logAction(String action, String username, String role, String details, String ipAddress, String severity) {
        try {
            AuditLog entry = new AuditLog(action, username, role, details, ipAddress, severity);
            auditLogRepository.save(entry);
            log.debug("Audit: [{}] {} - {} (IP: {})", severity, action, username, ipAddress);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }

    /** Shorthand for INFO-level audit */
    public void logInfo(String action, String username, String role, String details, String ipAddress) {
        logAction(action, username, role, details, ipAddress, INFO);
    }

    /** Shorthand for WARNING-level audit */
    public void logWarning(String action, String username, String role, String details, String ipAddress) {
        logAction(action, username, role, details, ipAddress, WARNING);
    }

    /** Shorthand for CRITICAL-level audit */
    public void logCritical(String action, String username, String role, String details, String ipAddress) {
        logAction(action, username, role, details, ipAddress, CRITICAL);
    }

    /** Get recent audit logs (top 50) */
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    /** Get all audit logs */
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    /** Get logs by severity */
    public List<AuditLog> getLogsBySeverity(String severity) {
        return auditLogRepository.findBySeverityOrderByTimestampDesc(severity);
    }
}
