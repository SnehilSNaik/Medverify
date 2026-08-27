package com.medverify.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for a medical certificate.
 * All enum fields are represented as Strings for clean JSON serialization.
 */
public class CertificateResponse {
    private Long id;
    private String certificateId;
    private String patientName;
    private int age;
    private String gender;                  // MALE / FEMALE / OTHER
    private String disease;
    private String treatment;
    private Long doctorId;
    private String doctorName;
    private String doctorRegistrationNumber;
    private Long hospitalId;
    private String hospitalName;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String certificateHash;         // SHA-256 hash (for display/debug)
    private String status;                  // ACTIVE / REVOKED
    private String qrCodeData;              // Base64 PNG QR code
    private LocalDateTime createdAt;

    public CertificateResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDisease() { return disease; }
    public void setDisease(String disease) { this.disease = disease; }

    public String getTreatment() { return treatment; }
    public void setTreatment(String treatment) { this.treatment = treatment; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorRegistrationNumber() { return doctorRegistrationNumber; }
    public void setDoctorRegistrationNumber(String doctorRegistrationNumber) { this.doctorRegistrationNumber = doctorRegistrationNumber; }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getCertificateHash() { return certificateHash; }
    public void setCertificateHash(String certificateHash) { this.certificateHash = certificateHash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
