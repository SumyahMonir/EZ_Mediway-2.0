// testBkashToken.js
// Run: node testBkashToken.js
// Purpose: sandbox credentials diye Grant Token API kaj kortese kina check kora

const BKASH_BASE_URL = "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
const BKASH_USERNAME = "sandboxTokenizedUser02";
const BKASH_PASSWORD = "sandboxTokenizedUser02@12345";
const BKASH_APP_KEY = "4f6o0cjiki2rfm34kfdadl1eqq";
const BKASH_APP_SECRET = "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b";

async function grantToken() {
  try {
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
    console.log("Response Status:", res.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));

    if (data.id_token) {
      console.log("\n✅ SUCCESS! Token pawa geche, credentials thik ache.");
      console.log("id_token:", data.id_token);
    } else {
      console.log("\n❌ FAILED. Upore error message dekho.");
    }
  } catch (err) {
    console.error("❌ Request e error hoyeche:", err.message);
  }
}

grantToken();