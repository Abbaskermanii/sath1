"use client";

import { useState } from "react";
import axios from "axios";

const BASE_URL = "YOUR_API_URL"; // ← اینو ست کن

export default function Page() {
  const [step, setStep] = useState(1); // 1: email , 2: change

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // STEP 1 → درخواست OTP
  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.get(`${BASE_URL}/user/password-reset/${email}/`);
      setMsg("کد ارسال شد");
      setStep(2);
    } catch (e) {
      setError("خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 → تغییر رمز
  const handleChange = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`${BASE_URL}/user/password-change/`, {
        email,
        password,
        otp,
      });

      setMsg("رمز با موفقیت تغییر کرد");
    } catch (e) {
      setError("خطا در تغییر رمز");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-center">
          {step === 1 ? "بازیابی رمز" : "تغییر رمز"}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
            {error}
          </div>
        )}

        {msg && (
          <div className="bg-green-50 text-green-600 p-2 rounded text-sm">
            {msg}
          </div>
        )}

        {step === 1 && (
          <>
            <input
              placeholder="ایمیل"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg"
            >
              {loading ? "..." : "ارسال کد"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              placeholder="کد OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              type="password"
              placeholder="رمز جدید"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            <button
              onClick={handleChange}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg"
            >
              {loading ? "..." : "تغییر رمز"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
