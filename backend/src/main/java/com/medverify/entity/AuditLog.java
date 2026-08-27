package com.medverify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * AuditLog entity — records all security-relevant actions in the system.
 * Provides a tamper-evident audit trail for compliance and forensics.
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_username", columnList = "username")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The action performed (e.g., LOGIN_SUCCESS, CERTIFICATE_ISSUED, PASSWORD_CHANGED) */
    @Column(nullable = false, length = 50)
    private String action;

    /** Username who performed the action */
    @Column(nullable = false)
    private String username;

    /** Role of the user at the time of action */
    @Column(length = 20)
    private String role;

    /** Detailed description of the action */
    @Column(length = 500)
    private String details;

    /** IP address of the client */
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    /** Severity level: INFO, WARNING, CRITICAL */
    @Column(nullable = false, length = 10)
    private String severity = "INFO";

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public AuditLog() {}

    public AuditLog(String action, String username, String role, String details, String ipAddress, String severity) {
        this.action = action;
        this.username = username;
        this.role = role;
        this.details = details;
        this.ipAddress = ipAddress;
        this.severity = severity;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
