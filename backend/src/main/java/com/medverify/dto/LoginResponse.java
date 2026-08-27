package com.medverify.dto;

import java.time.LocalDateTime;

public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String role;          // String (not enum) for clean JSON
    private String username;
    private String email;
    private Long hospitalId;
    private boolean mustChangePassword;
    private LocalDateTime lastLoginAt;

    public LoginResponse() {}

    public LoginResponse(String accessToken, String refreshToken, String role, String username, String email, Long hospitalId, boolean mustChangePassword, LocalDateTime lastLoginAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
        this.username = username;
        this.email = email;
        this.hospitalId = hospitalId;
        this.mustChangePassword = mustChangePassword;
        this.lastLoginAt = lastLoginAt;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public boolean isMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
}

