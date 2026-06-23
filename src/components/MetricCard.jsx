import { motion as Motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

const MetricCard = ({ label, value, unit = "", icon: Icon, accent = "cyan", delay = 0 }) => {
  const IconComponent = Icon;
  const numericValue = typeof value === "number" ? value : Number.parseFloat(value);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (Number.isNaN(numericValue)) return value ?? "N/A";
    return numericValue >= 10 ? Math.round(latest).toString() : latest.toFixed(1);
  });

  useEffect(() => {
    if (Number.isNaN(numericValue)) return undefined;
    const controls = animate(count, numericValue, { duration: 1.2, delay, ease: "easeOut" });
    return controls.stop;
  }, [count, delay, numericValue]);

  const palette = accent === "teal"
    ? "from-ocean-teal/25 to-ocean-teal/5 text-ocean-teal shadow-tealGlow"
    : "from-ocean-cyan/25 to-ocean-cyan/5 text-ocean-cyan shadow-glow";

  return (
    <Motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <div className="mt-3 flex items-baseline gap-1 font-display text-3xl font-bold tracking-tight text-white">
            {Number.isNaN(numericValue) ? (
              <span>{value ?? "N/A"}</span>
            ) : (
            <Motion.span>{rounded}</Motion.span>
            )}
            {unit && <span className="text-base font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br p-3 ${palette}`}>
          <IconComponent className="h-5 w-5" />
        </div>
      </div>
    </Motion.div>
  );
};

export default MetricCard;
