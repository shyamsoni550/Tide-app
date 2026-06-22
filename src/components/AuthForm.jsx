import { useState } from "react";

const AuthForm = ({ isConfigured, onSignIn, onSignUp, onContinueAsGuest }) => {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const result = isSignup
        ? await onSignUp(email, password, fullName)
        : await onSignIn(email, password);

      if (result.error) throw result.error;

      if (isSignup && !result.data.session) {
        setMessage("Account created. Check your email to confirm your address.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl md:grid-cols-2">
        <section className="flex flex-col justify-between bg-cyan-900 p-8 text-white md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-200">Coastal intelligence</p>
            <h1 className="mt-4 text-4xl font-bold">Tide Tracker</h1>
            <p className="mt-4 max-w-md text-cyan-100">
              Save coastal locations and check modeled tides, waves, wind, and activity conditions.
            </p>
          </div>
          <p className="mt-12 text-sm text-cyan-200">
            Marine forecasts are planning guidance only and are not suitable for navigation.
          </p>
        </section>

        <section className="flex items-center p-8 md:p-12">
          <div className="w-full">
            <div className="mb-8 flex border-b border-slate-200">
              {["login", "signup"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setMessage("");
                  }}
                  className={`flex-1 border-b-2 px-4 py-3 font-semibold capitalize ${
                    mode === item
                      ? "border-cyan-700 text-cyan-800"
                      : "border-transparent text-slate-500"
                  }`}
                >
                  {item === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            {!isConfigured ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `.env` to activate accounts.
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {isSignup && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Full name</span>
                    <input
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
                      autoComplete="name"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Email</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
                    autoComplete="email"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Password</span>
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                  />
                </label>
                {message && <p className="text-sm text-rose-700">{message}</p>}
                <button
                  disabled={submitting}
                  className="w-full rounded-md bg-cyan-800 px-4 py-3 font-bold text-white hover:bg-cyan-900 disabled:opacity-60"
                >
                  {submitting ? "Please wait..." : isSignup ? "Create account" : "Log in"}
                </button>
              </form>
            )}

            {!isConfigured && (
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="mt-5 w-full rounded-md border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue in guest mode
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthForm;
