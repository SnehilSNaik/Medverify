package com.medverify.dto;

import com.medverify.entity.Gender;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CertificateRequest {
    @NotBlank
    private String patientName;
    
    @Min(0)
    private int age;
    
    @NotNull
    private Gender gender;
    
    @NotBlank
    private String disease;
    
    @NotBlank
    private String treatment;
    
    @NotNull
    private Long doctorId;
    
    @NotNull
    private LocalDate issueDate;
    
    @NotNull
    private LocalDate expiryDate;
    
    private String verifierName;
    private String verifierOrganization;

    public CertificateRequest() {}

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getDisease() {
        return disease;
    }

    public void setDisease(String disease) {
        this.disease = disease;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getVerifierName() {
        return verifierName;
    }

    public void setVerifierName(String verifierName) {
        this.verifierName = verifierName;
    }

    public String getVerifierOrganization() {
        return verifierOrganization;
    }

    public void setVerifierOrganization(String verifierOrganization) {
        this.verifierOrganization = verifierOrganization;
    }
}
