package com.medverify.repository;

import com.medverify.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop50ByOrderByTimestampDesc();

    List<AuditLog> findByActionOrderByTimestampDesc(String action);

    List<AuditLog> findByUsernameOrderByTimestampDesc(String username);

    List<AuditLog> findBySeverityOrderByTimestampDesc(String severity);

    long countByAction(String action);

    long countBySeverity(String severity);

    long countByTimestampAfter(LocalDateTime since);
}
