package com.medverify.pdf;

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.medverify.entity.MedicalCertificate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

/**
 * PDFService generates professional medical certificate PDF documents using iText 7.
 * Each PDF includes patient details, doctor info, digital signature info, and an embedded QR code.
 */
@Service
public class PDFService {

    // Brand colors
    private static final DeviceRgb COLOR_PRIMARY    = new DeviceRgb(0, 102, 204);    // Deep blue
    private static final DeviceRgb COLOR_SECONDARY  = new DeviceRgb(0, 153, 153);    // Teal
    private static final DeviceRgb COLOR_SUCCESS    = new DeviceRgb(16, 185, 129);   // Green
    private static final DeviceRgb COLOR_LIGHT_GRAY = new DeviceRgb(245, 245, 245);
    private static final DeviceRgb COLOR_DARK       = new DeviceRgb(30, 30, 60);
    private static final DeviceRgb COLOR_BORDER     = new DeviceRgb(200, 210, 230);

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMMM yyyy");

    /**
     * Generates a PDF certificate for the given MedicalCertificate with the embedded QR code.
     *
     * @param cert       The certificate entity
     * @param qrBase64   Base64-encoded PNG image of the QR code
     * @return byte[] PDF file content
     */
    public byte[] generateCertificatePDF(MedicalCertificate cert, String qrBase64) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        PdfWriter writer   = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document  = new Document(pdfDoc, PageSize.A4);
        document.setMargins(40, 50, 40, 50);

        PdfFont boldFont    = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
        PdfFont regularFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);
        PdfFont italicFont  = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_OBLIQUE);

        // ── HEADER ────────────────────────────────────────────────────────────────
        addHeader(document, cert, boldFont, regularFont);

        // ── CERTIFICATE TITLE ────────────────────────────────────────────────────
        Paragraph title = new Paragraph("MEDICAL CERTIFICATE")
                .setFont(boldFont)
                .setFontSize(18)
                .setFontColor(COLOR_PRIMARY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20)
                .setMarginBottom(5);
        document.add(title);

        Paragraph subtitle = new Paragraph("Certificate of Medical Examination & Treatment")
                .setFont(italicFont)
                .setFontSize(11)
                .setFontColor(COLOR_SECONDARY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(subtitle);

        // Divider line
        document.add(createDivider(COLOR_PRIMARY));

        // ── CERTIFICATE ID BANNER ────────────────────────────────────────────────
        addCertificateBanner(document, cert, boldFont, regularFont);

        // ── PATIENT INFORMATION ──────────────────────────────────────────────────
        document.add(createSectionTitle("PATIENT INFORMATION", boldFont));
        Table patientTable = createTwoColumnTable();
        addTableRow(patientTable, "Patient Name", cert.getPatientName(), boldFont, regularFont);
        addTableRow(patientTable, "Age", String.valueOf(cert.getAge()) + " years", boldFont, regularFont);
        addTableRow(patientTable, "Gender", cert.getGender().name(), boldFont, regularFont);
        document.add(patientTable);

        // ── MEDICAL INFORMATION ──────────────────────────────────────────────────
        document.add(createSectionTitle("MEDICAL INFORMATION", boldFont));
        Table medTable = createTwoColumnTable();
        addTableRow(medTable, "Diagnosis / Disease", cert.getDisease(), boldFont, regularFont);
        addTableRow(medTable, "Treatment Given", cert.getTreatment(), boldFont, regularFont);
        addTableRow(medTable, "Issue Date", cert.getIssueDate().format(DATE_FMT), boldFont, regularFont);
        addTableRow(medTable, "Valid Until", cert.getExpiryDate().format(DATE_FMT), boldFont, regularFont);
        document.add(medTable);

        // ── DOCTOR & HOSPITAL ────────────────────────────────────────────────────
        document.add(createSectionTitle("ISSUING AUTHORITY", boldFont));
        Table authTable = createTwoColumnTable();
        addTableRow(authTable, "Doctor Name", "Dr. " + cert.getDoctor().getName(), boldFont, regularFont);
        addTableRow(authTable, "Registration No.", cert.getDoctor().getRegistrationNumber(), boldFont, regularFont);
        addTableRow(authTable, "Specialization", cert.getDoctor().getSpecialization(), boldFont, regularFont);
        addTableRow(authTable, "Hospital", cert.getHospital().getName(), boldFont, regularFont);
        addTableRow(authTable, "Hospital License", cert.getHospital().getLicenseNumber(), boldFont, regularFont);
        document.add(authTable);

        // ── DIGITAL VERIFICATION SECTION ─────────────────────────────────────────
        document.add(createSectionTitle("DIGITAL VERIFICATION", boldFont));
        addVerificationSection(document, cert, boldFont, regularFont, italicFont, qrBase64);

        // ── FOOTER ───────────────────────────────────────────────────────────────
        addFooter(document, cert, italicFont, regularFont);

        document.close();
        return baos.toByteArray();
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────────

    private void addHeader(Document document, MedicalCertificate cert, PdfFont boldFont, PdfFont regularFont) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{3, 1})).useAllAvailableWidth();
        headerTable.setBorder(Border.NO_BORDER);

        // Left side: hospital name and contact
        Cell leftCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph("MedVerify")
                        .setFont(boldFont).setFontSize(22).setFontColor(COLOR_PRIMARY))
                .add(new Paragraph(cert.getHospital().getName())
                        .setFont(boldFont).setFontSize(13).setFontColor(COLOR_DARK))
                .add(new Paragraph("🏥 Verified Medical Institution | License: " + cert.getHospital().getLicenseNumber())
                        .setFont(regularFont).setFontSize(9).setFontColor(ColorConstants.GRAY));
        headerTable.addCell(leftCell);

        // Right side: "DIGITALLY SIGNED" badge
        Cell rightCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph("✓ DIGITALLY SIGNED")
                        .setFont(boldFont).setFontSize(10).setFontColor(COLOR_SUCCESS))
                .add(new Paragraph("SHA-256 + RSA Secured")
                        .setFont(regularFont).setFontSize(8).setFontColor(ColorConstants.GRAY));
        headerTable.addCell(rightCell);

        document.add(headerTable);
    }

    private void addCertificateBanner(Document document, MedicalCertificate cert, PdfFont boldFont, PdfFont regularFont) {
        Table bannerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1})).useAllAvailableWidth();
        bannerTable.setBackgroundColor(COLOR_LIGHT_GRAY)
                   .setBorder(new SolidBorder(COLOR_BORDER, 1))
                   .setMarginBottom(15)
                   .setPadding(10);

        Cell idCell = new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph("Certificate ID").setFont(boldFont).setFontSize(9).setFontColor(ColorConstants.GRAY))
                .add(new Paragraph(cert.getCertificateId()).setFont(boldFont).setFontSize(11).setFontColor(COLOR_PRIMARY));
        bannerTable.addCell(idCell);

        Cell statusCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph("Status").setFont(boldFont).setFontSize(9).setFontColor(ColorConstants.GRAY))
                .add(new Paragraph(cert.getStatus().name())
                        .setFont(boldFont).setFontSize(12)
                        .setFontColor(cert.getStatus().name().equals("ACTIVE") ? COLOR_SUCCESS : new DeviceRgb(220, 53, 69)));
        bannerTable.addCell(statusCell);

        document.add(bannerTable);
    }

    private void addVerificationSection(Document document, MedicalCertificate cert,
                                        PdfFont boldFont, PdfFont regularFont, PdfFont italicFont,
                                        String qrBase64) throws Exception {
        Table verTable = new Table(UnitValue.createPercentArray(new float[]{2, 1})).useAllAvailableWidth();
        verTable.setBorder(new SolidBorder(COLOR_BORDER, 1))
                .setMarginBottom(15);

        // Left: hash info
        Cell infoCell = new Cell().setPadding(10).setBorder(Border.NO_BORDER)
                .add(new Paragraph("This certificate is protected by cryptographic security:")
                        .setFont(regularFont).setFontSize(10))
                .add(new Paragraph("• SHA-256 Content Hash")
                        .setFont(boldFont).setFontSize(9).setFontColor(COLOR_PRIMARY))
                .add(new Paragraph(cert.getCertificateHash().substring(0, 32) + "...")
                        .setFont(italicFont).setFontSize(8).setFontColor(ColorConstants.GRAY))
                .add(new Paragraph("• RSA Digital Signature (2048-bit)")
                        .setFont(boldFont).setFontSize(9).setFontColor(COLOR_PRIMARY).setMarginTop(5))
                .add(new Paragraph("Signed by: " + cert.getHospital().getName())
                        .setFont(regularFont).setFontSize(9))
                .add(new Paragraph("\nVerify authenticity by scanning the QR code →")
                        .setFont(italicFont).setFontSize(9).setFontColor(COLOR_SECONDARY));
        verTable.addCell(infoCell);

        // Right: QR code image
        if (qrBase64 != null && !qrBase64.isEmpty()) {
            byte[] qrBytes = Base64.getDecoder().decode(qrBase64);
            ImageData imageData = ImageDataFactory.create(qrBytes);
            Image qrImage = new Image(imageData).setWidth(100).setHeight(100);
            Cell qrCell = new Cell().setPadding(10)
                    .setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.CENTER)
                    .add(qrImage)
                    .add(new Paragraph("Scan to Verify")
                            .setFont(regularFont).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
            verTable.addCell(qrCell);
        }

        document.add(verTable);
    }

    private void addFooter(Document document, MedicalCertificate cert, PdfFont italicFont, PdfFont regularFont) {
        document.add(createDivider(COLOR_BORDER));
        document.add(new Paragraph("Verify this certificate online at: http://localhost:5173/verify/" + cert.getCertificateId())
                .setFont(italicFont).setFontSize(9).setFontColor(COLOR_PRIMARY)
                .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("This is a digitally signed document. Any alteration will invalidate the digital signature.")
                .setFont(regularFont).setFontSize(8).setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Generated by MedVerify – Fake Medical Certificate Prevention System")
                .setFont(italicFont).setFontSize(8).setFontColor(ColorConstants.LIGHT_GRAY)
                .setTextAlignment(TextAlignment.CENTER));
    }

    private Paragraph createSectionTitle(String title, PdfFont boldFont) {
        return new Paragraph(title)
                .setFont(boldFont)
                .setFontSize(11)
                .setFontColor(COLOR_PRIMARY)
                .setMarginTop(15)
                .setMarginBottom(5)
                .setBorderBottom(new SolidBorder(COLOR_SECONDARY, 1))
                .setPaddingBottom(3);
    }

    private Table createTwoColumnTable() {
        return new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth()
                .setMarginBottom(5);
    }

    private void addTableRow(Table table, String label, String value, PdfFont boldFont, PdfFont regularFont) {
        table.addCell(new Cell().setBorder(Border.NO_BORDER)
                .setBackgroundColor(COLOR_LIGHT_GRAY)
                .setPadding(6)
                .add(new Paragraph(label).setFont(boldFont).setFontSize(9).setFontColor(COLOR_DARK)));
        table.addCell(new Cell().setBorder(Border.NO_BORDER)
                .setPadding(6)
                .add(new Paragraph(value != null ? value : "N/A").setFont(regularFont).setFontSize(10)));
    }

    private LineSeparator createDivider(DeviceRgb color) {
        com.itextpdf.kernel.pdf.canvas.draw.SolidLine line = new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(1f);
        line.setColor(color);
        return new LineSeparator(line).setMarginTop(5).setMarginBottom(5);
    }
}
