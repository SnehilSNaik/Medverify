package com.medverify.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * QRCodeService generates QR codes for medical certificates using ZXing.
 * Each QR encodes a JSON payload containing the certificate ID and
 * the public verification URL so verifiers can scan and verify instantly.
 */
@Service
public class QRCodeService {

    @Value("${app.base-url}")
    private String baseUrl;

    private static final int QR_SIZE = 300; // pixels

    /**
     * Generates a QR code PNG image as a byte array.
     *
     * @param certificateId The unique certificate UUID
     * @return byte[] PNG image bytes
     */
    public byte[] generateQRCode(String certificateId) throws WriterException, IOException {
        String qrContent = buildQRContent(certificateId);

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H); // High error correction
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 2);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }

    /**
     * Generates a QR code and returns it as a Base64-encoded string
     * suitable for embedding in JSON responses or HTML img src attributes.
     *
     * @param certificateId The unique certificate UUID
     * @return Base64 string of the PNG QR code
     */
    public String generateQRCodeBase64(String certificateId) throws WriterException, IOException {
        byte[] qrBytes = generateQRCode(certificateId);
        return Base64.getEncoder().encodeToString(qrBytes);
    }

    /**
     * Builds the JSON-like string content embedded in the QR code.
     * Format: {"certificateId":"<id>","verifyUrl":"<url>"}
     */
    private String buildQRContent(String certificateId) {
        // Points to the public frontend verification route configured for this deployment.
        String verifyUrl = baseUrl + "/verify/" + certificateId;
        return "{\"certificateId\":\"" + certificateId + "\",\"verifyUrl\":\"" + verifyUrl + "\"}";
    }
}
