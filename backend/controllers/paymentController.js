const { createPayment, executePayment } = require("../utils/bkash");
const Appointment = require("../models/appointmentmodel");
const Doctor = require("../models/doctormodel");
const Users = require("../models/usermodel");

// Patient clicks "Pay with bKash" — this creates the bKash payment session.
// The fee is looked up from the Doctor's own record here, NEVER trusted
// from the request body — otherwise a patient could tamper with the amount
// client-side and pay whatever they want.
const initiatePayment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: "doctorId, date and timeSlot are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.verificationStatus !== "verified") {
      return res.status(404).json({ success: false, message: "Doctor not available for booking" });
    }

    const consultationFee = doctor.consultationFee;
    const patientId = req.user._id;

    const invoiceNumber = "INV" + Date.now();

    const callbackURL =
      `${process.env.SERVER_URL}/api/payment/bkash/callback` +
      `?doctorId=${doctorId}&patientId=${patientId}&date=${encodeURIComponent(date)}` +
      `&timeSlot=${encodeURIComponent(timeSlot)}&fee=${consultationFee}`;

    const paymentData = await createPayment(consultationFee, invoiceNumber, callbackURL);

    if (paymentData.bkashURL) {
      return res.status(200).json({
        success: true,
        bkashURL: paymentData.bkashURL,
      });
    }

    return res.status(400).json({ success: false, message: "Payment creation failed", data: paymentData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// bKash redirects the patient's browser here once they've completed (or
// abandoned) the payment on bKash's own page.
const paymentCallback = async (req, res) => {
  try {
    const { paymentID, status, doctorId, patientId, date, timeSlot, fee } = req.query;

    if (status !== "success") {
      return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    }

    // Guard against bKash (or the patient hitting back/refresh) calling this
    // callback twice for the same payment — without this, a duplicate
    // appointment would get created on the second hit.
    const existing = await Appointment.findOne({ bkashPaymentID: paymentID });
    if (existing) {
      return res.redirect(`${process.env.CLIENT_URL}/book-appointment?appointmentId=${existing._id}`);
    }

    const executeData = await executePayment(paymentID);

    const patient = await Users.findOne({ UserAuthId: patientId });
    if (!patient) {
      return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    }

    if (executeData.statusCode === "0000" && executeData.transactionStatus === "Completed") {
      const appointment = await Appointment.create({
        patientId: patient._id,
        doctorId,
        consultationFee: fee,
        date,
        timeSlot,
        status: "Pending",
        paymentStatus: "Paid",
        paymentMethod: "bKash",
        bkashPaymentID: paymentID,
        transactionId: executeData.trxID,
      });

      return res.redirect(
        `${process.env.CLIENT_URL}/book-appointment?appointmentId=${appointment._id}`
      );
    }

    return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
  } catch (error) {
    console.error(error);
    return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
  }
};

module.exports = { initiatePayment, paymentCallback };