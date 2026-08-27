package com.medverify.crypto;

import com.medverify.entity.MedicalCertificate;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * CryptoService handles all cryptographic operations:
 * - RSA key pair generation (2048-bit) per hospital
 * - SHA-256 hashing of certificate fields
 * - RSA digital signing and verification (SHA256withRSA)
 * - AES-256-GCM encryption of private keys at rest
 */
@Service
public class CryptoService {

    static {
        // Register BouncyCastle as a security provider
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    @Value("${crypto.aes-secret}")
    private String aesSecret;

    // ─── RSA KEY PAIR GENERATION ────────────────────────────────────────────────

    /**
     * Generates a fresh 2048-bit RSA key pair for a hospital.
     */
    public KeyPair generateRSAKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048, new SecureRandom());
        return generator.generateKeyPair();
    }

    /**
     * Converts an RSA PublicKey to PEM-formatted Base64 string.
     */
    public String publicKeyToPem(PublicKey publicKey) {
        byte[] encoded = publicKey.getEncoded();
        String base64 = Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(encoded);
        return "-----BEGIN PUBLIC KEY-----\n" + base64 + "\n-----END PUBLIC KEY-----";
    }

    /**
     * Converts an RSA PrivateKey to PEM-formatted Base64 string.
     */
    public String privateKeyToPem(PrivateKey privateKey) {
        byte[] encoded = privateKey.getEncoded();
        String base64 = Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(encoded);
        return "-----BEGIN PRIVATE KEY-----\n" + base64 + "\n-----END PRIVATE KEY-----";
    }

    /**
     * Reconstructs an RSA PublicKey from its PEM string.
     */
    public PublicKey pemToPublicKey(String pem) throws Exception {
        String stripped = pem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(stripped);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePublic(spec);
    }

    /**
     * Reconstructs an RSA PrivateKey from its PEM string.
     */
    public PrivateKey pemToPrivateKey(String pem) throws Exception {
        String stripped = pem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(stripped);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(spec);
    }

    // ─── SHA-256 HASHING ────────────────────────────────────────────────────────

    /**
     * Computes a SHA-256 hash of the given string data.
     * @return Hex-encoded hash string
     */
    public String computeSHA256Hash(String data) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    /**
     * Produces a canonical string from a MedicalCertificate's immutable fields.
     * Fields are sorted by name and joined as "fieldname:value|" to prevent
     * any reordering attacks. Any change to any field invalidates the hash.
     */
    public String canonicalizeCertificate(MedicalCertificate cert) {
        return "age:" + cert.getAge() + "|" +
               "certificateId:" + cert.getCertificateId().trim() + "|" +
               "disease:" + cert.getDisease().trim().toLowerCase() + "|" +
               "doctorId:" + cert.getDoctor().getId() + "|" +
               "expiryDate:" + cert.getExpiryDate().toString() + "|" +
               "gender:" + cert.getGender().name() + "|" +
               "hospitalId:" + cert.getHospital().getId() + "|" +
               "issueDate:" + cert.getIssueDate().toString() + "|" +
               "patientName:" + cert.getPatientName().trim().toLowerCase() + "|" +
               "treatment:" + cert.getTreatment().trim().toLowerCase() + "|";
    }

    // ─── RSA SIGNING ────────────────────────────────────────────────────────────

    /**
     * Signs data (typically the SHA-256 hash) using the hospital's RSA private key.
     * Uses SHA256withRSA algorithm.
     * @return Base64-encoded digital signature
     */
    public String signData(String data, PrivateKey privateKey) throws Exception {
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(privateKey);
        signature.update(data.getBytes(StandardCharsets.UTF_8));
        byte[] signedBytes = signature.sign();
        return Base64.getEncoder().encodeToString(signedBytes);
    }

    /**
     * Verifies a digital signature against the original data using the hospital's RSA public key.
     * @param data The original data that was signed (e.g., SHA-256 hash string)
     * @param base64Signature The stored Base64 digital signature
     * @param publicKey The hospital's RSA public key
     * @return true if signature is valid, false if tampered
     */
    public boolean verifySignature(String data, String base64Signature, PublicKey publicKey) {
        try {
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            signature.update(data.getBytes(StandardCharsets.UTF_8));
            byte[] sigBytes = Base64.getDecoder().decode(base64Signature);
            return signature.verify(sigBytes);
        } catch (Exception e) {
            // Any exception during verification means the signature is invalid
            return false;
        }
    }

    // ─── AES-256-GCM ENCRYPTION OF PRIVATE KEY ──────────────────────────────────

    /**
     * Encrypts the RSA private key PEM string using AES-256-GCM.
     * A random 12-byte IV is prepended to the ciphertext before Base64 encoding.
     */
    public String encryptPrivateKey(String privatePem) throws Exception {
        byte[] keyBytes = deriveAesKey(aesSecret);
        SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");

        byte[] iv = new byte[12];
        new SecureRandom().nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

        byte[] encrypted = cipher.doFinal(privatePem.getBytes(StandardCharsets.UTF_8));

        // Prepend IV to encrypted bytes, then Base64 encode the whole thing
        byte[] combined = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

        return Base64.getEncoder().encodeToString(combined);
    }

    /**
     * Decrypts the AES-256-GCM encrypted private key back to its PEM string.
     */
    public String decryptPrivateKey(String encryptedBase64) throws Exception {
        byte[] keyBytes = deriveAesKey(aesSecret);
        SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");

        byte[] combined = Base64.getDecoder().decode(encryptedBase64);

        // Extract IV (first 12 bytes) and ciphertext (remainder)
        byte[] iv = new byte[12];
        byte[] encrypted = new byte[combined.length - 12];
        System.arraycopy(combined, 0, iv, 0, 12);
        System.arraycopy(combined, 12, encrypted, 0, encrypted.length);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

        byte[] decrypted = cipher.doFinal(encrypted);
        return new String(decrypted, StandardCharsets.UTF_8);
    }

    /**
     * Derives a 32-byte AES key from the configured secret by SHA-256 hashing.
     */
    private byte[] deriveAesKey(String secret) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return digest.digest(secret.getBytes(StandardCharsets.UTF_8));
    }
}
