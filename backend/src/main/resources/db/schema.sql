-- MedVerify Database Schema
-- Run this script once to initialize the database, OR let Spring Boot auto-create tables (ddl-auto=update)

CREATE DATABASE IF NOT EXISTS medverify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medverify;

-- Hospitals table: stores hospital info and RSA key pair
CREATE TABLE IF NOT EXISTS hospitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    public_key TEXT NOT NULL COMMENT 'RSA 2048-bit public key in PEM format',
    private_key_encrypted TEXT NOT NULL COMMENT 'AES-256-GCM encrypted RSA private key',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_license (license_number),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users table: admin, hospital staff, and verifier accounts
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed',
    role ENUM('ADMIN', 'HOSPITAL', 'VERIFIER') NOT NULL,
    hospital_id BIGINT NULL COMMENT 'Only set for HOSPITAL role users',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Doctors table: doctor registry per hospital
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    hospital_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    INDEX idx_hospital (hospital_id),
    INDEX idx_registration (registration_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Medical certificates: the core table with cryptographic fields
CREATE TABLE IF NOT EXISTS medical_certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    certificate_id VARCHAR(36) UNIQUE NOT NULL COMMENT 'UUID used in QR codes and verification URLs',
    patient_name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    disease TEXT NOT NULL,
    treatment TEXT NOT NULL,
    doctor_id BIGINT NOT NULL,
    hospital_id BIGINT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    certificate_hash TEXT NOT NULL COMMENT 'SHA-256 hex hash of canonicalized certificate fields',
    digital_signature TEXT NOT NULL COMMENT 'Base64 RSA signature of the certificate_hash',
    qr_code_data LONGTEXT COMMENT 'Base64-encoded QR code PNG image',
    status ENUM('ACTIVE', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    INDEX idx_cert_id (certificate_id),
    INDEX idx_status (status),
    INDEX idx_hospital_status (hospital_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verification logs: every verification attempt is recorded for audit
CREATE TABLE IF NOT EXISTS verification_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    certificate_id_ref BIGINT NULL COMMENT 'FK to medical_certificates (null if NOT_FOUND)',
    certificate_id VARCHAR(36) NOT NULL COMMENT 'The searched certificate ID (stored even if not found)',
    verifier_name VARCHAR(255) NOT NULL,
    verifier_organization VARCHAR(255) NOT NULL,
    verification_result ENUM('GENUINE', 'TAMPERED', 'REVOKED', 'NOT_FOUND') NOT NULL,
    verified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50) NOT NULL,
    FOREIGN KEY (certificate_id_ref) REFERENCES medical_certificates(id) ON DELETE SET NULL,
    INDEX idx_cert_search (certificate_id),
    INDEX idx_result (verification_result),
    INDEX idx_verified_at (verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
