package com.medverify.dto;

public class DashboardStats {
    private long totalCertificates;
    private long activeCertificates;
    private long revokedCertificates;
    private long totalHospitals;
    private long totalVerifications;
    private long genuineVerifications;
    private long tamperedVerifications;
    private long fraudAttempts;

    public DashboardStats() {}

    public DashboardStats(long totalCertificates, long activeCertificates, long revokedCertificates, long totalHospitals, long totalVerifications, long genuineVerifications, long tamperedVerifications, long fraudAttempts) {
        this.totalCertificates = totalCertificates;
        this.activeCertificates = activeCertificates;
        this.revokedCertificates = revokedCertificates;
        this.totalHospitals = totalHospitals;
        this.totalVerifications = totalVerifications;
        this.genuineVerifications = genuineVerifications;
        this.tamperedVerifications = tamperedVerifications;
        this.fraudAttempts = fraudAttempts;
    }

    public long getTotalCertificates() { return totalCertificates; }
    public void setTotalCertificates(long totalCertificates) { this.totalCertificates = totalCertificates; }

    public long getActiveCertificates() { return activeCertificates; }
    public void setActiveCertificates(long activeCertificates) { this.activeCertificates = activeCertificates; }

    public long getRevokedCertificates() { return revokedCertificates; }
    public void setRevokedCertificates(long revokedCertificates) { this.revokedCertificates = revokedCertificates; }

    public long getTotalHospitals() { return totalHospitals; }
    public void setTotalHospitals(long totalHospitals) { this.totalHospitals = totalHospitals; }

    public long getTotalVerifications() { return totalVerifications; }
    public void setTotalVerifications(long totalVerifications) { this.totalVerifications = totalVerifications; }

    public long getGenuineVerifications() { return genuineVerifications; }
    public void setGenuineVerifications(long genuineVerifications) { this.genuineVerifications = genuineVerifications; }

    public long getTamperedVerifications() { return tamperedVerifications; }
    public void setTamperedVerifications(long tamperedVerifications) { this.tamperedVerifications = tamperedVerifications; }

    public long getFraudAttempts() { return fraudAttempts; }
    public void setFraudAttempts(long fraudAttempts) { this.fraudAttempts = fraudAttempts; }
}
