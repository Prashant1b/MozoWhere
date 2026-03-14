import { Check, Palette, PenTool, Eye } from "lucide-react";

const STEPS = [
  { label: "Options", icon: Palette },
  { label: "Design", icon: PenTool },
  { label: "Preview", icon: Eye },
];

export default function StepsBar({ step }) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            const Icon = s.icon;

            return (
              <div key={s.label} className="flex flex-1 items-center">
                {/* Circle */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                      done
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                        : active
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200"
                        : "bg-slate-100 text-slate-400",
                    ].join(" ")}
                  >
                    {done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                  </div>
                  <span
                    className={[
                      "text-[10px] font-semibold uppercase tracking-wider transition-colors sm:text-xs",
                      done ? "text-emerald-600" : active ? "text-indigo-600" : "text-slate-400",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="mx-2 h-[2px] flex-1 rounded-full bg-slate-100 sm:mx-4">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500 transition-all duration-500"
                      style={{ width: done ? "100%" : active ? "50%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
