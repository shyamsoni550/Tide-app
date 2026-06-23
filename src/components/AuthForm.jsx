import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Anchor, Waves } from "lucide-react";

const bubbles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 17) % 86)}%`,
  size: `${6 + (index % 5) * 4}px`,
  delay: `${index * 0.65}s`,
  duration: `${8 + (index % 6)}s`,
}));

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
    <main className="relative min-h-screen overflow-hidden bg-ocean-night text-white">
      <div className="absolute inset-0 bg-ocean-radial" />
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="pointer-events-none absolute bottom-[-40px] rounded-full border border-ocean-cyan/30 bg-ocean-cyan/10 animate-float-up"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animationDelay: bubble.delay,
            animationDuration: bubble.duration,
          }}
        />
      ))}

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 ocean-grid opacity-60" />
          <svg
            className="absolute inset-x-[-8%] bottom-[-4rem] h-[64%] w-[116%] text-ocean-cyan/35 animate-wave-drift"
            viewBox="0 0 1440 560"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M0,320L60,304C120,288,240,256,360,266.7C480,277,600,331,720,330.7C840,331,960,277,1080,250.7C1200,224,1320,224,1380,224L1440,224L1440,560L1380,560C1320,560,1200,560,1080,560C960,560,840,560,720,560C600,560,480,560,360,560C240,560,120,560,60,560L0,560Z"
            />
            <path
              fill="rgba(0, 229, 160, 0.22)"
              d="M0,384L80,368C160,352,320,320,480,325.3C640,331,800,373,960,362.7C1120,352,1280,288,1360,256L1440,224L1440,560L1360,560C1280,560,1120,560,960,560C800,560,640,560,480,560C320,560,160,560,80,560L0,560Z"
            />
          </svg>

          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative max-w-xl"
          >
            <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-ocean-cyan/25 bg-white/5 px-4 py-2 text-sm font-semibold text-ocean-muted">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-ocean-teal opacity-60 animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-ocean-teal" />
              </span>
              Live marine intelligence
            </div>
            <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-3xl border border-ocean-cyan/25 bg-ocean-cyan/10 text-ocean-cyan shadow-glow animate-pulse-glow">
              <Waves className="h-8 w-8" />
            </div>
            <h1 className="font-display text-6xl font-bold uppercase leading-none tracking-[0.18em] text-white xl:text-7xl">
              Tide Tracker
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-ocean-muted">
              Forecast tides, wind, waves, and coastal windows from a dashboard that feels as sharp as the data behind it.
            </p>
          </Motion.div>

          <div className="relative flex items-center gap-3 text-sm text-slate-400">
            <Anchor className="h-4 w-4 text-ocean-teal" />
            Marine forecasts are guidance only, not navigation advice.
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <Motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="glass-panel w-full max-w-md rounded-[2rem] p-6 sm:p-8"
          >
            <div className="mb-8 lg:hidden">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-cyan/10 text-ocean-cyan shadow-glow">
                <Waves className="h-6 w-6" />
              </div>
              <h1 className="font-display text-4xl font-bold uppercase tracking-[0.14em]">Tide Tracker</h1>
              <p className="mt-3 text-sm text-ocean-muted">Live coastal intelligence for your next tide window.</p>
            </div>

            <div className="mb-8 rounded-full border border-white/10 bg-white/[0.04] p-1">
              {["login", "signup"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setMessage("");
                  }}
                  className={`w-1/2 rounded-full px-4 py-3 text-sm font-bold capitalize transition ${
                    mode === item
                      ? "bg-gradient-to-r from-ocean-cyan to-ocean-teal text-ocean-night shadow-glow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            {!isConfigured ? (
              <div className="rounded-2xl border border-ocean-teal/30 bg-ocean-teal/10 p-4 text-sm text-ocean-muted">
                Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env to activate accounts.
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {isSignup && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-300">Full name</span>
                    <input
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="input-glow w-full rounded-2xl px-4 py-3.5"
                      autoComplete="name"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Email</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="input-glow w-full rounded-2xl px-4 py-3.5"
                    autoComplete="email"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Password</span>
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="input-glow w-full rounded-2xl px-4 py-3.5"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                  />
                </label>
                {message && <p className="text-sm text-ocean-teal">{message}</p>}
                <Motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  className="w-full rounded-full bg-gradient-to-r from-ocean-cyan to-ocean-teal px-5 py-4 font-display text-sm font-bold uppercase tracking-[0.22em] text-ocean-night shadow-glow transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Please wait..." : isSignup ? "Create account" : "Log in"}
                </Motion.button>
              </form>
            )}

            <button
              type="button"
              onClick={onContinueAsGuest}
              className="mt-5 w-full rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-ocean-cyan/40 hover:text-white"
            >
              Continue in guest mode
            </button>
          </Motion.div>
        </section>
      </div>
    </main>
  );
};

export default AuthForm;
