package com.medverify.repository;

import com.medverify.entity.CertificateStatus;
import com.medverify.entity.MedicalCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicalCertificateRepository extends JpaRepository<MedicalCertificate, Long> {
    Optional<MedicalCertificate> findByCertificateId(String certificateId);
    List<MedicalCertificate> findByHospitalId(Long hospitalId);
    List<MedicalCertificate> findByHospitalIdAndStatus(Long hospitalId, CertificateStatus status);
    List<MedicalCertificate> findByStatus(CertificateStatus status);
    long countByStatus(CertificateStatus status);
    long countByHospitalId(Long hospitalId);
}
