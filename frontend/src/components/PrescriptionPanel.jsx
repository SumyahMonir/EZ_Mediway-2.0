import React, { useEffect, useState } from "react";
import API from "../api";

const FOLLOW_UP_OPTIONS = ["3 Days", "5 Days", "7 Days", "14 Days", "1 Month", "Custom"];

const emptyMedicine = () => ({
  medicine: "", strength: "", dosage: "", frequency: "", duration: "", instruction: "",
});

// Slide-over side panel — opened from DoctorWaitingRoom via "Prescribe Now".
// Props: doctorId, patientId, appointmentId, date, timeSlot, socket, onClose
const PrescriptionPanel = ({ doctorId, patientId, appointmentId, date, timeSlot, socket, onClose }) => {
  const token = localStorage.getItem("token");

  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const [prescriptionId, setPrescriptionId] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [tests, setTests] = useState([]);
  const [advice, setAdvice] = useState("");
  const [followUpOption, setFollowUpOption] = useState("7 Days");
  const [followUpCustom, setFollowUpCustom] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [status, setStatus] = useState("draft");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [saving, setSaving] = useState(null); // "draft" | "send" | null
  const [error, setError] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Load doctor + patient profile info for the info card / PDF header
  useEffect(() => {
    const loadInfo = async () => {
      try {
        setLoadingInfo(true);
        const [doctorRes, patientRes] = await Promise.all([
          API.get("/doctors/me", authHeaders),
          API.get(`/users/${patientId}`, authHeaders),
        ]);
        setDoctor(doctorRes.data);
        setPatient(patientRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load patient/doctor info.");
      } finally {
        setLoadingInfo(false);
      }
    };
    loadInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const resolvedFollowUp = followUpOption === "Custom" ? followUpCustom.trim() : followUpOption;

  const buildPayload = () => ({
    patientId,
    appointmentId,
    diagnosis,
    medicines,
    tests,
    advice,
    followUp: resolvedFollowUp,
    additionalNotes,
  });

  // Creates the prescription on first save, updates it on every save after that.
  const ensureSaved = async (statusOverride) => {
    const payload = { ...buildPayload(), status: statusOverride };

    if (!prescriptionId) {
      const res = await API.post("/prescriptions", payload, authHeaders);
      setPrescriptionId(res.data._id);
      setStatus(res.data.status);
      return res.data._id;
    }

    const res = await API.put(`/prescriptions/${prescriptionId}`, payload, authHeaders);
    setStatus(res.data.status);
    return prescriptionId;
  };

  const handleSaveDraft = async () => {
    try {
      setSaving("draft");
      setError("");
      await ensureSaved("draft");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save draft.");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAndSend = async () => {
    try {
      setSaving("send");
      setError("");
      const id = await ensureSaved("completed");
      const res = await API.post(`/prescriptions/${id}/send`, {}, authHeaders);
      setStatus(res.data.status);
      setPdfUrl(res.data.pdfUrl);

      // Notify the patient in real time via the doctor's already-open
      // waiting-room socket — the backend relays this to everyone in the
      // same room, and the patient's page filters for their own patientId.
      socket?.emit("waiting-room:prescription-sent", {
        patientId,
        pdfUrl: res.data.pdfUrl,
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to send prescription.");
    } finally {
      setSaving(null);
    }
  };

  // ---- Medicines ----
  const updateMedicine = (index, field, value) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };
  const addMedicine = () => setMedicines((prev) => [...prev, emptyMedicine()]);
  const removeMedicine = (index) => setMedicines((prev) => prev.filter((_, i) => i !== index));

  // ---- Tests ----
  const updateTest = (index, value) => {
    setTests((prev) => prev.map((t, i) => (i === index ? { testName: value } : t)));
  };
  const addTest = () => setTests((prev) => [...prev, { testName: "" }]);
  const removeTest = (index) => setTests((prev) => prev.filter((_, i) => i !== index));

  const inputClass = "w-full border border-[#D8E5DA] rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Side panel */}
      <div className="relative bg-[#F7FAF7] w-full sm:w-[95vw] lg:w-[85vw] xl:w-[75vw] h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#D8E5DA] px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-[#0F2A18]">Write Prescription</h2>
          <button onClick={onClose} className="text-[#3A4D3E] hover:text-[#0F2A18] text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Patient Info Card */}
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mb-6">
            {loadingInfo ? (
              <p className="text-[#6B7B6E]">Loading patient info...</p>
            ) : (
              <div className="flex items-center gap-6">
                <img
                  src={patient?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.name || "Patient")}&background=0B3D1E&color=ffffff`}
                  alt={patient?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#D8E5DA]"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                  <p><span className="font-semibold text-[#0F2A18]">Name:</span> {patient?.name || "-"}</p>
                  <p><span className="font-semibold text-[#0F2A18]">Gender:</span> {patient?.gender || "-"}</p>
                  <p><span className="font-semibold text-[#0F2A18]">Blood Group:</span> {patient?.bloodGroup || "-"}</p>
                  <p><span className="font-semibold text-[#0F2A18]">Phone:</span> {patient?.phone || "-"}</p>
                  <p><span className="font-semibold text-[#0F2A18]">Appointment Date:</span> {date}</p>
                  <p><span className="font-semibold text-[#0F2A18]">Appointment Time:</span> {timeSlot}</p>
                  <p className="col-span-2"><span className="font-semibold text-[#0F2A18]">Patient ID:</span> {patientId}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* ---- Left: Form ---- */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
                <h3 className="font-semibold text-[#0F2A18] mb-3">Diagnosis</h3>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={3}
                  placeholder="Enter diagnosis..."
                  className={inputClass}
                />
              </div>

              <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
                <h3 className="font-semibold text-[#0F2A18] mb-3">Medicines</h3>
                <div className="space-y-3">
                  {medicines.map((m, i) => (
                    <div key={i} className="border border-[#EEF5EF] rounded-lg p-3 space-y-2 relative">
                      <button
                        onClick={() => removeMedicine(i)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                        type="button"
                      >
                        Remove
                      </button>
                      <input className={inputClass} placeholder="Medicine name" value={m.medicine} onChange={(e) => updateMedicine(i, "medicine", e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inputClass} placeholder="Strength" value={m.strength} onChange={(e) => updateMedicine(i, "strength", e.target.value)} />
                        <input className={inputClass} placeholder="Dosage" value={m.dosage} onChange={(e) => updateMedicine(i, "dosage", e.target.value)} />
                        <input className={inputClass} placeholder="Frequency" value={m.frequency} onChange={(e) => updateMedicine(i, "frequency", e.target.value)} />
                        <input className={inputClass} placeholder="Duration" value={m.duration} onChange={(e) => updateMedicine(i, "duration", e.target.value)} />
                      </div>
                      <input className={inputClass} placeholder="Instruction" value={m.instruction} onChange={(e) => updateMedicine(i, "instruction", e.target.value)} />
                    </div>
                  ))}
                </div>
                <button onClick={addMedicine} type="button" className="mt-3 text-[#0B3D1E] font-medium hover:underline text-sm">
                  + Add Medicine
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
                <h3 className="font-semibold text-[#0F2A18] mb-3">Tests</h3>
                <div className="space-y-2">
                  {tests.map((t, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={inputClass} placeholder="Test name" value={t.testName} onChange={(e) => updateTest(i, e.target.value)} />
                      <button onClick={() => removeTest(i)} type="button" className="text-red-500 hover:text-red-700 text-sm px-2">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addTest} type="button" className="mt-3 text-[#0B3D1E] font-medium hover:underline text-sm">
                  + Add Test
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
                <h3 className="font-semibold text-[#0F2A18] mb-3">Advice</h3>
                <textarea value={advice} onChange={(e) => setAdvice(e.target.value)} rows={3} className={inputClass} />
              </div>

              <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
                <h3 className="font-semibold text-[#0F2A18] mb-3">Follow-up</h3>
                <select value={followUpOption} onChange={(e) => setFollowUpOption(e.target.value)} className={inputClass}>
                  {FOLLOW_UP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {followUpOption === "Custom" && (
                  <input
                    className={`${inputClass} mt-2`}
                    placeholder="Enter custom follow-up"
                    value={followUpCustom}
                    onChange={(e) => setFollowUpCustom(e.target.value)}
                  />
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
                <h3 className="font-semibold text-[#0F2A18] mb-3">Additional Notes</h3>
                <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={2} className={inputClass} />
              </div>
            </div>

            {/* ---- Right: Live Preview ---- */}
            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 h-fit lg:sticky lg:top-24">
              <div className="text-center border-b border-[#D8E5DA] pb-3 mb-4">
                <p className="text-lg font-bold text-[#0B3D1E]">EZ MediWay</p>
                <p className="text-xs text-[#3A4D3E]">www.ezmediway.com</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <p className="font-semibold text-[#0F2A18]">Doctor</p>
                  <p>Dr. {doctor?.name || "-"}</p>
                  <p>{doctor?.professionalTitle || ""}</p>
                  <p>Reg No: {doctor?.registrationNumber || "-"}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F2A18]">Patient</p>
                  <p>{patient?.name || "-"}</p>
                  <p>{patient?.gender || "-"} &bull; {patient?.bloodGroup || "-"}</p>
                  <p>{date} &bull; {timeSlot}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-[#0F2A18] text-sm">Diagnosis</p>
                <p className="text-sm text-[#3A4D3E]">{diagnosis || "-"}</p>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-[#0F2A18] text-sm mb-1">Medicines</p>
                {medicines.filter((m) => m.medicine.trim()).length === 0 ? (
                  <p className="text-sm text-[#6B7B6E]">-</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#D8E5DA] text-left">
                        <th className="py-1">Medicine</th><th>Strength</th><th>Dosage</th><th>Frequency</th><th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.filter((m) => m.medicine.trim()).map((m, i) => (
                        <tr key={i} className="border-b border-[#EEF5EF]">
                          <td className="py-1">{m.medicine}</td><td>{m.strength || "-"}</td><td>{m.dosage || "-"}</td><td>{m.frequency || "-"}</td><td>{m.duration || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {tests.filter((t) => t.testName.trim()).length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-[#0F2A18] text-sm mb-1">Investigations</p>
                  {tests.filter((t) => t.testName.trim()).map((t, i) => (
                    <p key={i} className="text-sm text-[#3A4D3E]">&bull; {t.testName}</p>
                  ))}
                </div>
              )}

              {advice && (
                <div className="mb-4">
                  <p className="font-semibold text-[#0F2A18] text-sm">Advice</p>
                  <p className="text-sm text-[#3A4D3E]">{advice}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="font-semibold text-[#0F2A18] text-sm">Follow-up</p>
                <p className="text-sm text-[#3A4D3E]">{resolvedFollowUp || "-"}</p>
              </div>

              {additionalNotes && (
                <div className="mb-4">
                  <p className="font-semibold text-[#0F2A18] text-sm">Additional Notes</p>
                  <p className="text-sm text-[#3A4D3E]">{additionalNotes}</p>
                </div>
              )}

              <div className="text-right mt-8">
                <p className="text-xs border-t border-[#0F2A18] inline-block pt-1 px-4">Doctor's Signature</p>
              </div>

              <p className="text-center text-[10px] text-[#6B7B6E] mt-6">
                This prescription was digitally generated by EZ MediWay.
              </p>

              {pdfUrl && (
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="block text-center mt-4 text-sm text-[#0B3D1E] underline">
                  View generated PDF
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 mt-6 pb-6">
            <button
              onClick={handleSaveDraft}
              disabled={saving !== null}
              className="border border-[#D8E5DA] text-[#0F2A18] px-6 py-3 rounded-lg hover:bg-[#EEF5EF] transition disabled:opacity-50"
            >
              {saving === "draft" ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={handleSaveAndSend}
              disabled={saving !== null}
              className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg hover:bg-[#082B15] transition disabled:opacity-50"
            >
              {saving === "send" ? "Sending..." : "Save & Send to Patient"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPanel;