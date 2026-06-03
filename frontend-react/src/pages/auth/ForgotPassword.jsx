import { useState } from "react";
import { api } from "../../lib/axiosClient";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      await api.get(`/user/password-reset/${email}/`);
      setMsg("کد ارسال شد");
      setStep(2);
    } catch {
      setError("خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post(`/user/password-change/`, { email, password, otp });
      setMsg("رمز با موفقیت تغییر کرد");
    } catch {
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
          <div className="bg-red-50 text-red-600 p-2 rounded text-sm">{error}</div>
        )}
        {msg && (
          <div className="bg-green-50 text-green-600 p-2 rounded text-sm">{msg}</div>
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
