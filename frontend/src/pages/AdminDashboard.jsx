import React, { useEffect, useState } from "react";
import API from "../api";

const AdminDashboard = () => {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    totalDoctors: 0,
    pendingDoctors: 0,
    verifiedDoctors: 0,
    totalPatients: 0,
  });

  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        API.get("/admin/stats", authHeaders),
        API.get("/doctors/admin/list?status=pending", authHeaders),
      ]);

      setStats(statsRes.data);
      setPendingDoctors(pendingRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const openReview = async (doctorId) => {
    try {
      setModalLoading(true);
      setShowRejectInput(false);
      setRejectReason("");
      const res = await API.get(`/doctors/${doctorId}`, authHeaders);
      setSelectedDoctor(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load doctor details.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeReview = () => {
    setSelectedDoctor(null);
    setShowRejectInput(false);
    setRejectReason("");
  };

  const handleApprove = async () => {
    if (!selectedDoctor) return;
    try {
      setActionLoading(true);
      await API.patch(`/doctors/${selectedDoctor._id}/approve`, {}, authHeaders);
      closeReview();
      loadDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to approve doctor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDoctor) return;
    try {
      setActionLoading(true);
      await API.patch(
        `/doctors/${selectedDoctor._id}/reject`,
        { reason: rejectReason },
        authHeaders
      );
      closeReview();
      loadDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to reject doctor.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="bg-[#F7FAF7] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F2A18]">Admin Dashboard</h1>
          <p className="text-[#3A4D3E] mt-2">Manage doctors, patients and system activities.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6">
            <h3 className="text-[#3A4D3E] font-medium">Total Doctors</h3>
            <p className="text-3xl font-bold text-[#0B3D1E] mt-3">{stats.totalDoctors}</p>
          </div>

          <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6">
            <h3 className="text-[#3A4D3E] font-medium">Pending Approval</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-3">{stats.pendingDoctors}</p>
          </div>

          <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6">
            <h3 className="text-[#3A4D3E] font-medium">Verified Doctors</h3>
            <p className="text-3xl font-bold text-green-700 mt-3">{stats.verifiedDoctors}</p>
          </div>

          <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6">
            <h3 className="text-[#3A4D3E] font-medium">Total Patients</h3>
            <p className="text-3xl font-bold text-[#0B3D1E] mt-3">{stats.totalPatients}</p>
          </div>
        </div>

        {/* Pending Doctor Approval */}
        <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6 mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0F2A18]">Pending Doctor Approvals</h2>
            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
              {pendingDoctors.length} Pending
            </span>
          </div>

          {loading ? (
            <p className="text-[#3A4D3E]">Loading...</p>
          ) : pendingDoctors.length === 0 ? (
            <p className="text-[#3A4D3E]">No pending doctors right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#D8E5DA]">
                    <th className="py-3 text-[#0F2A18]">Doctor</th>
                    <th className="text-[#0F2A18]">Specialization</th>
                    <th className="text-[#0F2A18]">Hospital</th>
                    <th className="text-[#0F2A18]">Experience</th>
                    <th className="text-[#0F2A18]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoctors.map((doctor) => (
                    <tr key={doctor._id} className="border-b border-[#D8E5DA]">
                      <td className="py-4 text-[#3A4D3E] font-medium">{doctor.name}</td>
                      <td className="text-[#3A4D3E]">{doctor.specialization}</td>
                      <td className="text-[#3A4D3E]">{doctor.hospital}</td>
                      <td className="text-[#3A4D3E]">{doctor.experience} yrs</td>
                      <td>
                        <button
                          onClick={() => openReview(doctor._id)}
                          className="bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15]"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Review Modal */}
      {(selectedDoctor || modalLoading) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">

            {modalLoading ? (
              <p className="text-center text-[#3A4D3E]">Loading doctor details...</p>
            ) : selectedDoctor && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={
                      selectedDoctor.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedDoctor.name
                      )}&background=0B3D1E&color=ffffff`
                    }
                    alt={selectedDoctor.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#D8E5DA]"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-[#0F2A18]">{selectedDoctor.name}</h3>
                    <p className="text-[#3A4D3E]">{selectedDoctor.professionalTitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-semibold">Email:</span> {selectedDoctor.email}</div>
                  <div><span className="font-semibold">Phone:</span> {selectedDoctor.phone}</div>
                  <div><span className="font-semibold">NID:</span> {selectedDoctor.nid}</div>
                  <div><span className="font-semibold">Registration No:</span> {selectedDoctor.registrationNumber}</div>
                  <div><span className="font-semibold">Specialization:</span> {selectedDoctor.specialization}</div>
                  <div><span className="font-semibold">Experience:</span> {selectedDoctor.experience} yrs</div>
                  <div><span className="font-semibold">Hospital:</span> {selectedDoctor.hospital}</div>
                  <div><span className="font-semibold">Consultation Fee:</span> ৳{selectedDoctor.consultationFee}</div>
                  <div className="col-span-2">
                    <span className="font-semibold">Qualifications:</span>{" "}
                    {(selectedDoctor.qualifications || []).join(", ")}
                  </div>
                  {selectedDoctor.description && (
                    <div className="col-span-2">
                      <span className="font-semibold">About:</span> {selectedDoctor.description}
                    </div>
                  )}
                </div>

                {showRejectInput && (
                  <div className="mt-6">
                    <label className="font-semibold text-sm">Rejection reason</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full mt-2 border rounded-lg p-3"
                      placeholder="Let the doctor know what needs to be fixed..."
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  {!showRejectInput ? (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg hover:bg-[#082B15] disabled:opacity-60"
                      >
                        {actionLoading ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        disabled={actionLoading}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        onClick={closeReview}
                        className="bg-gray-200 text-[#0F2A18] px-6 py-3 rounded-lg hover:bg-gray-300"
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-60"
                      >
                        {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                      </button>
                      <button
                        onClick={() => setShowRejectInput(false)}
                        disabled={actionLoading}
                        className="bg-gray-200 text-[#0F2A18] px-6 py-3 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;