package com.medverify.repository;

import com.medverify.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByLicenseNumber(String licenseNumber);
    List<Hospital> findAllByActive(boolean active);
}
