package com.medverify.repository;

import com.medverify.entity.VerificationLog;
import com.medverify.entity.VerificationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VerificationLogRepository extends JpaRepository<VerificationLog, Long> {
    List<VerificationLog> findAllByOrderByVerifiedAtDesc();
    List<VerificationLog> findByCertificateId(String certificateId);
    long countByVerificationResult(VerificationResult result);
}
