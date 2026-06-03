import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginApi, registerApi } from "../../lib/authApi";

function toErrorMessage(err) {
  if (err?.message && !err?.response) return err.message;

  const data = err?.response?.data;
  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    if (data.detail) return data.detail;

    return Object.entries(data)
      .map(([k, v]) => {
        if (Array.isArray(v)) return `${k}: ${v.join("، ")}`;
        if (typeof v === "string") return `${k}: ${v}`;
        return `${k}: ${JSON.stringify(v)}`;
      })
      .join(" | ");
  }

  return "خطا";
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    password2: "",
  });

  const title = useMemo(
    () => (mode === "login" ? "ورود به حساب" : "ثبت‌نام در شاخص یک"),
    [mode],
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        if (!loginForm.email.trim()) throw new Error("ایمیل را وارد کنید.");
        if (!loginForm.password) throw new Error("رمز عبور را وارد کنید.");

        await loginApi({
          email: loginForm.email.trim(),
          password: loginForm.password,
        });

        navigate("/", { replace: true });
        return;
      }

      if (!registerForm.username.trim())
        throw new Error("نام کاربری را وارد کنید.");
      if (!registerForm.full_name.trim())
        throw new Error("نام و نام خانوادگی را وارد کنید.");
      if (!registerForm.email.trim()) throw new Error("ایمیل را وارد کنید.");
      if (registerForm.password.length < 8)
        throw new Error("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      if (registerForm.password !== registerForm.password2)
        throw new Error("رمز عبور و تکرار آن یکسان نیستند.");

      await registerApi({
        username: registerForm.username.trim(),
        full_name: registerForm.full_name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      });

      await loginApi({
        email: registerForm.email.trim(),
        password: registerForm.password,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setError("");
    setMode(nextMode);
  }

  return (
    <div className="h-screen bg-black flex items-center justify-center p-2 font-sans overflow-hidden">
      <div className="w-full max-w-5xl scale-[0.93] origin-center">
        <div className="flex items-center justify-between mb-3 px-1" dir="rtl">
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              ← بازگشت
            </button>

            <Link
              to="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              صفحه اصلی
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl h-[88vh]">
          {/* ── فرم ── */}
          <div className="bg-white p-5 sm:p-6 lg:p-8 flex flex-col">
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-xl bg-zinc-100 p-1">
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    mode === "register"
                      ? "bg-white shadow-sm text-zinc-900"
                      : "text-zinc-600 hover:text-zinc-800"
                  }`}
                >
                  ثبت‌نام
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    mode === "login"
                      ? "bg-white shadow-sm text-zinc-900"
                      : "text-zinc-600 hover:text-zinc-800"
                  }`}
                >
                  ورود
                </button>
              </div>
            </div>

            <div className="mb-4 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                {title}
              </h1>
              <p className="text-[13px] text-zinc-500 mt-1.5">
                به شاخص یک خوش آمدید
              </p>
            </div>

            {error && (
              <div className="mb-3 rounded-xl bg-red-50 border border-red-200 p-2 text-red-700 text-[13px]">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3 flex-1">
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-[13px] text-zinc-700 mb-1 font-medium">
                      نام کاربری
                    </label>
                    <input
                      type="text"
                      value={registerForm.username}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] focus:border-zinc-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] text-zinc-700 mb-1 font-medium">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      value={registerForm.full_name}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] focus:border-zinc-400 outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[13px] text-zinc-700 mb-1 font-medium">
                  آدرس ایمیل
                </label>
                <input
                  type="email"
                  value={
                    mode === "login" ? loginForm.email : registerForm.email
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (mode === "login") {
                      setLoginForm((prev) => ({ ...prev, email: value }));
                    } else {
                      setRegisterForm((prev) => ({ ...prev, email: value }));
                    }
                  }}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] focus:border-zinc-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] text-zinc-700 mb-1 font-medium">
                  رمز عبور
                </label>
                <input
                  type="password"
                  value={
                    mode === "login"
                      ? loginForm.password
                      : registerForm.password
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (mode === "login") {
                      setLoginForm((prev) => ({ ...prev, password: value }));
                    } else {
                      setRegisterForm((prev) => ({ ...prev, password: value }));
                    }
                  }}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] focus:border-zinc-400 outline-none"
                />
              </div>

              {mode === "login" && (
                <div className="flex justify-end -mt-1">
                  <Link
                    to="/auth/forgot-password"
                    className="text-[12px] text-zinc-600 hover:text-black"
                  >
                    فراموشی رمز عبور
                  </Link>
                </div>
              )}

              {mode === "register" && (
                <div>
                  <label className="block text-[13px] text-zinc-700 mb-1 font-medium">
                    تکرار رمز عبور
                  </label>
                  <input
                    type="password"
                    value={registerForm.password2}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        password2: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] focus:border-zinc-400 outline-none"
                  />
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full mt-1 bg-black hover:bg-zinc-900 text-white py-3 rounded-xl font-semibold text-[13px] disabled:opacity-60"
              >
                {loading
                  ? "..."
                  : mode === "login"
                    ? "ورود به حساب"
                    : "ثبت‌نام"}
              </button>

              <div className="text-center text-[13px] text-zinc-600 pt-1">
                {mode === "login" ? (
                  <>
                    حساب ندارید؟{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="font-semibold text-black hover:underline"
                    >
                      ثبت‌نام کنید
                    </button>
                  </>
                ) : (
                  <>
                    قبلاً ثبت‌نام کرده‌اید؟{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-semibold text-black hover:underline"
                    >
                      وارد شوید
                    </button>
                  </>
                )}
              </div>
            </form>

            <p className="text-center text-[11px] text-zinc-500 mt-3">
              با ادامه، قوانین و حریم خصوصی شاخص یک را می‌پذیرید.
            </p>
          </div>

          {/* ── پنل راست ── */}
          <div className="relative hidden lg:flex flex-col justify-between p-6 bg-zinc-950 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(at_40%_30%,rgba(129,140,248,0.10),transparent)]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px]">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                شاخص یک
              </div>

              <h2 className="mt-6 text-3xl lg:text-4xl font-bold leading-tight">
                خبر مهم را
                <br />
                سریع‌تر و دقیق‌تر
                <br />
                دنبال کنید
              </h2>

              <p className="mt-4 text-[13px] text-zinc-400 max-w-md leading-6">
                دسترسی سریع به خبر و تحلیل، بدون شلوغی اضافه
              </p>
            </div>

            <div className="relative z-10 mt-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-sm">سریع، دقیق، قابل اتکا</p>
                <p className="mt-1 text-zinc-400 text-[13px] leading-6">
                  تجربه‌ای ساده و حرفه‌ای از خبر
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
