// Builds the prescription PDF using @react-pdf/renderer. Written with
// React.createElement instead of JSX on purpose — this backend is plain
// CommonJS with no build/transpile step, so JSX syntax would not run here
// without adding a bundler. This is functionally identical to JSX, just
// more verbose.
const React = require("react");
const { Document, Page, Text, View, StyleSheet, renderToBuffer } = require("@react-pdf/renderer");

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#0F2A18" },
  header: { textAlign: "center", marginBottom: 16, borderBottomWidth: 2, borderBottomColor: "#0B3D1E", paddingBottom: 10 },
  brand: { fontSize: 20, fontWeight: 700, color: "#0B3D1E" },
  website: { fontSize: 9, color: "#3A4D3E", marginTop: 2 },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  column: { width: "48%" },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: "#0B3D1E", marginBottom: 4, textTransform: "uppercase" },
  line: { marginBottom: 2 },
  section: { marginBottom: 14 },
  table: { width: "100%" },
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#0B3D1E", paddingVertical: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#D8E5DA", paddingVertical: 4 },
  cell: { flex: 1, fontSize: 9, paddingRight: 4 },
  cellHeader: { flex: 1, fontSize: 9, fontWeight: 700, paddingRight: 4 },
  signatureArea: { marginTop: 36, alignItems: "flex-end" },
  signatureLine: { width: 160, borderTopWidth: 1, borderTopColor: "#0F2A18", textAlign: "center", paddingTop: 4, fontSize: 9 },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, textAlign: "center", fontSize: 8, color: "#6B7B6E" },
});

const MEDICINE_COLUMNS = ["Medicine", "Strength", "Dosage", "Frequency", "Duration", "Instruction"];
const MEDICINE_KEYS = ["medicine", "strength", "dosage", "frequency", "duration", "instruction"];

function buildPrescriptionDocument({ doctor, patient, appointment, prescription }) {
  const e = React.createElement;

  const appointmentDate = appointment?.date ? new Date(appointment.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const medicineHeaderCells = MEDICINE_COLUMNS.map((label, i) =>
    e(Text, { key: i, style: styles.cellHeader }, label)
  );

  const medicineRows = (prescription.medicines || []).map((m, i) =>
    e(View, { key: i, style: styles.tableRow },
      MEDICINE_KEYS.map((key, j) => e(Text, { key: j, style: styles.cell }, m[key] || "-"))
    )
  );

  const testLines = (prescription.tests || []).map((t, i) =>
    e(Text, { key: i, style: styles.line }, `\u2022 ${t.testName}`)
  );

  return e(Document, null,
    e(Page, { size: "A4", style: styles.page },
      e(View, { style: styles.header },
        e(Text, { style: styles.brand }, "EZ MediWay"),
        e(Text, { style: styles.website }, "www.ezmediway.com")
      ),

      e(View, { style: styles.topRow },
        e(View, { style: styles.column },
          e(Text, { style: styles.sectionTitle }, "Doctor"),
          e(Text, { style: styles.line }, `Dr. ${doctor?.name || "-"}`),
          doctor?.professionalTitle ? e(Text, { style: styles.line }, doctor.professionalTitle) : null,
          doctor?.specialization ? e(Text, { style: styles.line }, doctor.specialization) : null,
          e(Text, { style: styles.line }, `Reg No: ${doctor?.registrationNumber || "-"}`),
          e(Text, { style: styles.line }, doctor?.phone || "")
        ),
        e(View, { style: styles.column },
          e(Text, { style: styles.sectionTitle }, "Patient"),
          e(Text, { style: styles.line }, patient?.name || "-"),
          e(Text, { style: styles.line }, `Gender: ${patient?.gender || "-"}`),
          e(Text, { style: styles.line }, `Blood Group: ${patient?.bloodGroup || "-"}`),
          e(Text, { style: styles.line }, `Phone: ${patient?.phone || "-"}`),
          e(Text, { style: styles.line }, `Appointment: ${appointmentDate}${appointment?.timeSlot ? " \u2022 " + appointment.timeSlot : ""}`)
        )
      ),

      e(View, { style: styles.section },
        e(Text, { style: styles.sectionTitle }, "Diagnosis"),
        e(Text, null, prescription.diagnosis || "-")
      ),

      e(View, { style: styles.section },
        e(Text, { style: styles.sectionTitle }, "Medicines"),
        e(View, { style: styles.table },
          e(View, { style: styles.tableHeaderRow }, medicineHeaderCells),
          ...medicineRows
        )
      ),

      (prescription.tests || []).length > 0
        ? e(View, { style: styles.section },
            e(Text, { style: styles.sectionTitle }, "Investigations"),
            ...testLines
          )
        : null,

      prescription.advice
        ? e(View, { style: styles.section },
            e(Text, { style: styles.sectionTitle }, "Advice"),
            e(Text, null, prescription.advice)
          )
        : null,

      e(View, { style: styles.section },
        e(Text, { style: styles.sectionTitle }, "Follow-up"),
        e(Text, null, prescription.followUp || "-")
      ),

      prescription.additionalNotes
        ? e(View, { style: styles.section },
            e(Text, { style: styles.sectionTitle }, "Additional Notes"),
            e(Text, null, prescription.additionalNotes)
          )
        : null,

      e(View, { style: styles.signatureArea },
        e(Text, { style: styles.signatureLine }, "Doctor's Signature")
      ),

      e(Text, { style: styles.footer }, "This prescription was digitally generated by EZ MediWay.")
    )
  );
}

async function generatePrescriptionPdfBuffer(data) {
  const doc = buildPrescriptionDocument(data);
  return renderToBuffer(doc);
}

module.exports = {   };