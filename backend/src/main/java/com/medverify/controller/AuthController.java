package com.medverify.controller;

import com.medverify.dto.ApiResponse;
import com.medverify.dto.ChangePasswordRequest;
import com.medverify.dto.LoginRequest;
import com.medverify.dto.LoginResponse;
import com.medverify.entity.User;
import com.medverify.repository.UserRepository;
import com.medverify.security.RateLimiter;
import com.medverify.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * AuthController handles authentication endpoints with rate limiting and audit trail.
 * All endpoints under /api/auth/** are publicly accessible (except /change-password).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final RateLimiter rateLimiter;

    public AuthController(AuthService authService, UserRepository userRepository, RateLimiter rateLimiter) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.rateLimiter = rateLimiter;
    }

    /**
     * POST /api/auth/login
     * Rate-limited: 5 requests per 60 seconds per IP.
     * Returns JWT access/refresh tokens with user info on success.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = extractIpAddress(httpRequest);

        // Rate limiting check
        if (!rateLimiter.isAllowed(ipAddress)) {
            long retryAfter = rateLimiter.getRetryAfterSeconds(ipAddress);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(retryAfter))
                    .body(ApiResponse.error("Too many login attempts. Try again in " + retryAfter + " seconds."));
        }

        LoginResponse response = authService.login(request, ipAddress);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * POST /api/auth/signup
     * Public self-service registration for Verifiers and Hospitals.
     * Rate-limited to prevent automated bot account creation.
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<LoginResponse>> signup(
            @Valid @RequestBody com.medverify.dto.SignupRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = extractIpAddress(httpRequest);

        if (!rateLimiter.isAllowed(ipAddress)) {
            long retryAfter = rateLimiter.getRetryAfterSeconds(ipAddress);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(retryAfter))
                    .body(ApiResponse.error("Too many registration attempts. Please try again in " + retryAfter + " seconds."));
        }

        LoginResponse response = authService.register(request, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    /**
     * POST /api/auth/change-password
     * Requires authentication. Changes the current user's password.
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        String ipAddress = extractIpAddress(httpRequest);

        authService.changePassword(username, request, ipAddress);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    /**
     * GET /api/auth/me
     * Returns the currently authenticated user's profile info.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("role", user.getRole().name());
        userInfo.put("hospitalId", user.getHospital() != null ? user.getHospital().getId() : null);
        userInfo.put("hospitalName", user.getHospital() != null ? user.getHospital().getName() : null);
        userInfo.put("lastLoginAt", user.getLastLoginAt());
        userInfo.put("mustChangePassword", user.isMustChangePassword());

        return ResponseEntity.ok(ApiResponse.success("User info retrieved", userInfo));
    }

    /**
     * Extracts the real client IP address, handling proxies.
     */
    private String extractIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

