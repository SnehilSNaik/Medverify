package com.medverify.controller;

import com.medverify.dto.ApiResponse;
import com.medverify.dto.LoginRequest;
import com.medverify.dto.LoginResponse;
import com.medverify.entity.User;
import com.medverify.repository.UserRepository;
import com.medverify.service.AuthService;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * AuthController handles authentication endpoints.
 * All endpoints under /api/auth/** are publicly accessible.
 */
@RestController
@RequestMapping("/api/auth")

public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * POST /api/auth/login
     * Accepts username + password, returns JWT access/refresh tokens with user info.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
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

        return ResponseEntity.ok(ApiResponse.success("User info retrieved", userInfo));
    }
}
