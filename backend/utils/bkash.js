// utils/bkash.js
const BKASH_BASE_URL = process.env.BKASH_BASE_URL;
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;
const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;

let cachedToken = null;
let tokenExpiry = 0;

const getToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: BKASH_USERNAME,
      password: BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    }),
  });
  const data = await res.json();

console.log("Grant Token Response:", data);

  if (!data.id_token) throw new Error("Token grant failed: " + JSON.stringify(data));

  cachedToken = data.id_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
};

const createPayment = async (amount, invoiceNumber, callbackURL) => {
  const token = await getToken();
  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      "X-App-Key": BKASH_APP_KEY,
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: " ",
      callbackURL,
      amount: String(amount),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: invoiceNumber,
    }),
  });
  const data = await res.json();

console.log("Create Payment Response:", data);

return data;
};

const executePayment = async (paymentID) => {
  const token = await getToken();
  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      "X-App-Key": BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID }),
  });
  const data = await res.json();

console.log("Execute Payment Response:", data);

return data;
};

module.exports = { getToken, createPayment, executePayment };