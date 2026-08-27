# 🏥 MedVerify – Fake Medical Certificate Verification System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)](https://www.mysql.com)
[![Java](https://img.shields.io/badge/Java-17-red)](https://www.oracle.com/java)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> **MedVerify** prevents fake medical certificates using SHA-256 hashing, RSA Digital Signatures, and QR Code Authentication. Supports three roles: **Admin**, **Hospital**, and **Verifier (College/Company)**.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Security Flow](#security-flow)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Default Credentials](#default-credentials)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)

---

## ✨ Features

### 🛡️ Advanced Security Architecture
- **SHA-256 Hashing** – Canonical certificate content hashed for tamper detection
- **RSA Digital Signatures** – 2048-bit RSA per hospital; signs certificate hash
- **Sliding-Window Rate Limiter** – Protects authentication endpoints from credential stuffing and brute-force attacks (HTTP 429 Retry-After)
- **Account Lockout Protection** – Automatic 15-minute account lockout after 5 consecutive failed login attempts
- **Comprehensive Audit Trail** – Real-time event logging with severity levels (INFO, WARNING, CRITICAL), actor tracking, IP forensics, and timestamps
- **Password Lifecycle & Forced Rotation** – First-login forced password change policy + authenticated self-service password update
- **QR Code Authentication** – High-density QR embedding certificate ID + verification payload
- **JWT Authentication** – Stateless Access + Refresh token flow with claims validation
- **BCrypt Password Encryption** – Salted password hashing with configurable workload factor
- **AES-256 Encryption** – Hospital RSA private keys encrypted at rest

### 👨‍⚕️ Hospital Module
- Secure login with role-based access & session security
- Manage doctors (add, edit, toggle active status)
- Issue medical certificates (auto-generates SHA-256 hash + RSA-2048 digital signature)
- Download certificates as professional PDFs with embedded QR codes
- View QR codes for each certificate
- Revoke certificates with immediate cryptographic revocation propagation

### 🔍 Verifier Module
- Scan QR code via camera or upload certificate image
- Manual certificate ID entry
- Verification result: **GENUINE** 🟢 / **TAMPERED** 🔴 / **REVOKED** 🟡 / **NOT FOUND** ⚫
- Public verification portal available without authentication

### 👑 Admin Module
- Real-time Security & Platform Overview Dashboard
- Live Security Audit Trail with severity filtering and telemetry
- Manage hospitals (create, edit, toggle, regenerate RSA keypairs)
- Manage users (verifier and hospital accounts)
- View all verification logs with IP tracking and fraud telemetry
- View and manage revoked certificates

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Zustand, Axios |
| **UI** | Vanilla CSS, Glassmorphism, Lucide React icons |
| **Backend** | Spring Boot 3.2.x, Java 17, Maven |
| **Security** | Spring Security, JWT (JJWT), BCrypt |
| **Database** | MySQL 8.x, Spring Data JPA, Hibernate |
| **Cryptography** | Java Security (RSA/SHA-256), Bouncy Castle |
| **QR Code** | ZXing (backend), html5-qrcode (frontend) |
| **PDF** | iText 7 |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (5173)                    │
│  Admin Dashboard │ Hospital Portal │ Verifier Scanner        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / JWT
┌──────────────────────────▼──────────────────────────────────┐
│                  Spring Boot Backend (8080)                  │
│  AuthController │ AdminController │ HospitalController       │
│  VerificationController (public)                            │
├─────────────────────────────────────────────────────────────┤
│  CryptoService  │  QRCodeService  │  PDFService             │
│  RSA/SHA-256    │  ZXing QR Gen   │  iText 7 PDF            │
├─────────────────────────────────────────────────────────────┤
│              Spring Security + JWT Filter                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ JPA/Hibernate
┌──────────────────────────▼──────────────────────────────────┐
│                    MySQL 8.x Database                        │
│  users │ hospitals │ doctors │ medical_certificates          │
│  verification_logs                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```sql
-- 5 normalized tables
users               -- Authentication + roles
hospitals           -- Hospital info + RSA key pair
doctors             -- Doctor registry per hospital
medical_certificates -- Certificate + hash + signature + QR
verification_logs   -- Every verification attempt logged
```

---

## 🔐 Security Flow

### Certificate Issuance
```
1. Hospital fills certificate form
2. System canonicalizes fields → computes SHA-256 hash
3. Hash encrypted with hospital's RSA Private Key → Digital Signature
4. QR code generated: {certificateId, verifyUrl}
5. PDF generated with all fields + QR code embedded
6. Certificate saved to DB with hash + signature
```

### Certificate Verification
```
1. Verifier scans QR → gets certificate ID
2. System fetches certificate from DB
3. Re-canonicalizes stored fields → new SHA-256 hash
4. Decrypts stored digital signature using hospital's RSA Public Key
5. Compares: new hash === decrypted hash?
   ✅ Match + ACTIVE status → GENUINE
   ❌ Mismatch → TAMPERED
   🚫 status = REVOKED → REVOKED
   ❓ Not found → NOT_FOUND
6. All attempts logged with verifier info + IP
```

---

## ✅ Prerequisites

- **Java 17+** (`java -version`)
- **Maven 3.8+** (`mvn -version`)
- **MySQL 8.x** (running locally)
- **Node.js 18+** & **npm** (`node -version`)

---

## 🚀 Setup Instructions

### 1. Clone & Navigate
```bash
git clone <repo-url>
cd medverify
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Run schema script
source backend/src/main/resources/db/schema.sql
# OR just let Spring Boot create tables automatically (ddl-auto=update)
```

### 3. Configure Backend
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medverify
spring.datasource.username=root
spring.datasource.password=your_password   # ← Change this
```

### 4. Run Backend
```bash
cd backend
mvn spring-boot:run
# Backend starts at http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend starts at http://localhost:5173
```

---

## 🔑 Initial Accounts & Password Policy

MedVerify uses **Zero-Trust credentials** with mandatory rotation on first login:

| Role | Username | Initial Password | Policy | Description |
|---|---|---|---|---|
| **Admin** | `admin` | `Admin@MedVerify2024!` | Change on 1st login | Full system administration |
| **Hospital** | `hospital1` | `Hospital@Secure2024!` | Change on 1st login | City General Hospital portal |
| **Verifier** | `verifier1` | `Verifier@Secure2024!` | Change on 1st login | College/Enterprise verifier |

> 🔒 **Security Policy**:
> - Hardcoded credentials have been removed from the frontend UI.
> - Seeded accounts are assigned high-entropy initial passwords and flagged with `mustChangePassword=true`.
> - Users are prompted to establish their own private password upon initial portal entry.
> - Accounts automatically lock for 15 minutes after 5 consecutive failed authentication attempts.
> - Authentication requests are rate-limited per IP address.

---

## 📡 API Documentation

Swagger UI available at: `http://localhost:8080/swagger-ui.html`

### Auth Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | None (Rate-limited) | Login, returns JWT access/refresh tokens |
| POST | `/api/auth/change-password` | Authenticated | Change user account password |
| GET | `/api/auth/me` | Authenticated | Get current authenticated user profile & last login |

### Admin Endpoints (ADMIN role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | Dashboard statistics & fraud metrics |
| GET | `/api/admin/audit-logs` | Retrieve live security audit trail |
| GET/POST | `/api/admin/hospitals` | List / Create hospital with RSA keypair |
| PUT | `/api/admin/hospitals/{id}` | Update hospital metadata |
| POST | `/api/admin/hospitals/{id}/toggle-active` | Toggle hospital active status |
| POST | `/api/admin/hospitals/{id}/regenerate-keys` | Regenerate hospital RSA keypair |
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users/verifier` | Create verifier account |
| GET | `/api/admin/verification-logs` | All verification logs with IP forensics |
| GET | `/api/admin/certificates/revoked` | Revoked certificates |

### Hospital Endpoints (HOSPITAL role)
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/hospital/doctors` | List / Add doctor |
| PUT | `/api/hospital/doctors/{id}` | Update doctor |
| POST | `/api/hospital/doctors/{id}/toggle-active` | Toggle doctor |
| GET/POST | `/api/hospital/certificates` | List / Issue certificate |
| POST | `/api/hospital/certificates/{id}/revoke` | Revoke certificate |
| GET | `/api/hospital/certificates/{id}/pdf` | Download PDF |
| GET | `/api/hospital/certificates/{id}/qr` | Get QR code PNG |

### Verification Endpoints (Public)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/verify` | Verify certificate (with verifier info) |
| GET | `/api/verify/{certificateId}` | Quick verify by ID |

---

## 📁 Project Structure

```
medverify/
├── README.md
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/medverify/
│       │   ├── MedVerifyApplication.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── AdminController.java
│       │   │   ├── HospitalController.java
│       │   │   └── VerificationController.java
│       │   ├── service/
│       │   │   ├── AuthService.java
│       │   │   ├── AdminService.java
│       │   │   ├── HospitalService.java
│       │   │   └── VerificationService.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── HospitalRepository.java
│       │   │   ├── DoctorRepository.java
│       │   │   ├── MedicalCertificateRepository.java
│       │   │   └── VerificationLogRepository.java
│       │   ├── entity/
│       │   │   ├── User.java
│       │   │   ├── Hospital.java
│       │   │   ├── Doctor.java
│       │   │   ├── MedicalCertificate.java
│       │   │   └── VerificationLog.java
│       │   ├── dto/
│       │   │   ├── LoginRequest.java
│       │   │   ├── LoginResponse.java
│       │   │   ├── HospitalRequest.java
│       │   │   ├── HospitalResponse.java
│       │   │   ├── DoctorRequest.java
│       │   │   ├── DoctorResponse.java
│       │   │   ├── CertificateRequest.java
│       │   │   ├── CertificateResponse.java
│       │   │   ├── VerifyRequest.java
│       │   │   ├── VerifyResponse.java
│       │   │   ├── DashboardStats.java
│       │   │   └── ApiResponse.java
│       │   ├── security/
│       │   │   ├── JwtUtil.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   ├── UserDetailsServiceImpl.java
│       │   │   └── SecurityConfig.java
│       │   ├── crypto/
│       │   │   └── CryptoService.java
│       │   ├── qr/
│       │   │   └── QRCodeService.java
│       │   ├── pdf/
│       │   │   └── PDFService.java
│       │   └── exception/
│       │       ├── ResourceNotFoundException.java
│       │       ├── UnauthorizedException.java
│       │       └── GlobalExceptionHandler.java
│       └── resources/
│           ├── application.properties
│           └── db/
│               └── schema.sql
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── store/authStore.js
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── adminService.js
        │   ├── hospitalService.js
        │   └── verificationService.js
        ├── hooks/useAuth.js
        ├── utils/constants.js
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx
        │   │   ├── Sidebar.jsx
        │   │   ├── ProtectedRoute.jsx
        │   │   ├── LoadingSpinner.jsx
        │   │   ├── Modal.jsx
        │   │   └── Badge.jsx
        │   ├── dashboard/StatsCard.jsx
        │   └── certificate/
        │       ├── QRScanner.jsx
        │       └── CertificateCard.jsx
        └── pages/
            ├── Login.jsx
            ├── Unauthorized.jsx
            ├── NotFound.jsx
            ├── admin/
            │   ├── AdminDashboard.jsx
            │   ├── Hospitals.jsx
            │   ├── Users.jsx
            │   └── VerificationLogs.jsx
            ├── hospital/
            │   ├── HospitalDashboard.jsx
            │   ├── Doctors.jsx
            │   ├── Certificates.jsx
            │   └── IssueCertificate.jsx
            └── verifier/
                └── Verify.jsx
```

---

## 🧪 Testing the Application

### Test Certificate Verification
1. Login as `hospital1` → Issue Certificate → note the Certificate ID
2. Open `http://localhost:5173/verify` as Verifier
3. Enter Certificate ID → Result: **GENUINE** ✅
4. Go to Admin or Hospital → Revoke the certificate
5. Re-verify → Result: **REVOKED** 🟡
6. Login to MySQL → manually change `patient_name` in `medical_certificates` table
7. Re-verify → Result: **TAMPERED** 🔴

### Fraud Detection Test
Any manual modification to certificate data in the DB will cause the SHA-256 hash comparison to fail → **TAMPERED** result logged as a fraud attempt.

---

## 🔒 Production Checklist

- [ ] Change `jwt.secret` to a cryptographically random 256-bit key
- [ ] Change `crypto.aes-secret` to a strong secret
- [ ] Use HTTPS (SSL certificate)
- [ ] Change all default passwords
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate`
- [ ] Configure proper database connection pool (HikariCP)
- [ ] Add rate limiting to `/api/verify`
- [ ] Set up proper logging (ELK stack or similar)
- [ ] Configure firewall rules

---

## 📝 License

MIT License – see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Built With

- Spring Boot + Spring Security for robust backend
- React 18 for modern frontend
- MySQL for reliable data persistence
- RSA + SHA-256 for cryptographic security
- ZXing for QR code generation
- iText 7 for professional PDF generation

> **MedVerify** – _"Trust in Every Signature"_
