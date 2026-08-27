package com.medverify.repository;

import com.medverify.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByHospitalId(Long hospitalId);
    Optional<Doctor> findByRegistrationNumber(String registrationNumber);
    List<Doctor> findByHospitalIdAndActive(Long hospitalId, boolean active);
}
