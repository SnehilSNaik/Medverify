package com.medverify.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * In-memory rate limiter using a sliding window approach.
 * Limits requests per IP address to prevent brute-force attacks.
 *
 * Default: 5 requests per 60-second window per IP.
 */
@Component
public class RateLimiter {

    private static final int MAX_REQUESTS = 5;
    private static final long WINDOW_SECONDS = 60;

    private final Map<String, Queue<Instant>> requestLog = new ConcurrentHashMap<>();

    /**
     * Check if the request from this IP is allowed.
     * @return true if the request is within rate limits, false if it should be rejected.
     */
    public boolean isAllowed(String ipAddress) {
        Instant now = Instant.now();
        Instant windowStart = now.minusSeconds(WINDOW_SECONDS);

        Queue<Instant> timestamps = requestLog.computeIfAbsent(ipAddress, k -> new ConcurrentLinkedQueue<>());

        // Remove expired entries
        while (!timestamps.isEmpty() && timestamps.peek().isBefore(windowStart)) {
            timestamps.poll();
        }

        if (timestamps.size() >= MAX_REQUESTS) {
            return false;
        }

        timestamps.add(now);
        return true;
    }

    /**
     * Get remaining requests allowed for this IP.
     */
    public int getRemainingRequests(String ipAddress) {
        Queue<Instant> timestamps = requestLog.get(ipAddress);
        if (timestamps == null) return MAX_REQUESTS;

        Instant windowStart = Instant.now().minusSeconds(WINDOW_SECONDS);
        while (!timestamps.isEmpty() && timestamps.peek().isBefore(windowStart)) {
            timestamps.poll();
        }

        return Math.max(0, MAX_REQUESTS - timestamps.size());
    }

    /**
     * Get seconds until the rate limit resets for this IP.
     */
    public long getRetryAfterSeconds(String ipAddress) {
        Queue<Instant> timestamps = requestLog.get(ipAddress);
        if (timestamps == null || timestamps.isEmpty()) return 0;

        Instant oldest = timestamps.peek();
        long secondsUntilExpiry = WINDOW_SECONDS - (Instant.now().getEpochSecond() - oldest.getEpochSecond());
        return Math.max(1, secondsUntilExpiry);
    }
}
