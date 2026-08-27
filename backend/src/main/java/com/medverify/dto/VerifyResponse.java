package com.medverify.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for certificate verification results.
 * result is one of: GENUINE, TAMPERED, REVOKED, NOT_FOUND
 */
public class VerifyResponse {
    private String certificateId;
    private String result;              // GENUINE / TAMPERED / REVOKED / NOT_FOUND
    private String message;             // Human-readable explanation
    private LocalDateTime verifiedAt;

    // Certificate details (null if NOT_FOUND)
    private String patientName;
    private int age;
    private String gender;
    private String disease;
    private String treatment;
    private String doctorName;
    private String doctorRegistrationNumber;
    private String hospitalName;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String certificateStatus;   // ACTIVE / REVOKED

    public VerifyResponse() {}

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

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

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorRegistrationNumber() { return doctorRegistrationNumber; }
    public void setDoctorRegistrationNumber(String doctorRegistrationNumber) { this.doctorRegistrationNumber = doctorRegistrationNumber; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getCertificateStatus() { return certificateStatus; }
    public void setCertificateStatus(String certificateStatus) { this.certificateStatus = certificateStatus; }
}
