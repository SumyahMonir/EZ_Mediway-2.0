// controllers/paymentController.js
const { createPayment, executePayment } = require("../utils/bkash");
const Appointment = require("../models/appointmentModel"); // tomar actual path/name diye adjust koro


// Patient "Pay with bKash" e click korle ei function call hobe
const initiatePayment = async (req, res) => {
  try {
    
    const { doctorId, date, timeSlot, consultationFee } = req.body;
    const patientId = req.user._id; 

    const invoiceNumber = "INV" + Date.now();

    const callbackURL =
      `${process.env.SERVER_URL}/api/payment/bkash/callback` +
      `?doctorId=${doctorId}&patientId=${patientId}&date=${date}` +
      `&timeSlot=${encodeURIComponent(timeSlot)}&fee=${consultationFee}`;

       console.log("Callback URL:", callbackURL); 

    const paymentData = await createPayment(consultationFee, invoiceNumber, callbackURL);
    console.log("bKash createPayment response:", paymentData);
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

// bKash payment complete kore ei URL e redirect kore pathabe
const paymentCallback = async (req, res) => {
  try {
    const { paymentID, status, doctorId, patientId, date, timeSlot, fee } = req.query;

    if (status !== "success") {
      return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    }

    const executeData = await executePayment(paymentID);

    if (executeData.statusCode === "0000" && executeData.transactionStatus === "Completed") {
      const appointment = await Appointment.create({
        patientId,
        doctorId,
        consultationFee: fee,
        date,
        timeSlot,
        status: "pending",
        paymentStatus: "paid",
        paymentMethod: "bKash",
        bkashPaymentID: paymentID,
        transactionId: executeData.trxID,
      });

      //return res.redirect(`${process.env.CLIENT_URL}/payment-success?appointmentId=${appointment._id}`);
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