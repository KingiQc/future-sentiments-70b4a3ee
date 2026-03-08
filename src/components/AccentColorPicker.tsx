import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ACCENT_PRESETS, saveAccentColor, getAccentColor } from "@/hooks/use-accent-color";
import { useAuth } from "@/hooks/use-auth";

const AccentColorPicker = () => {
  const { user } = useAuth();
  const [current, setCurrent] = useState(getAccentColor());
  const [customHue, setCustomHue] = useState(27);

  const handlePreset = (hsl: string) => {
    setCurrent(hsl);
    saveAccentColor(hsl, user?.id);
  };

  const handleCustomHue = (hue: number) => {
    setCustomHue(hue);
    const hsl = `${hue} 76% 60%`;
    setCurrent(hsl);
    saveAccentColor(hsl, user?.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {ACCENT_PRESETS.map((preset) => {
          const isActive = current === preset.hsl;
          return (
            <motion.button
              key={preset.name}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePreset(preset.hsl)}
              className="relative w-10 h-10 rounded-full border-2 transition-all"
              style={{
                backgroundColor: `hsl(${preset.hsl})`,
                borderColor: isActive ? "hsl(var(--foreground))" : "transparent",
              }}
            >
              {isActive && (
                <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Custom hue slider */}
      <div className="mt-2">
        <label className="text-xs text-muted-foreground mb-2 block">Custom Color</label>
        <div className="relative h-8 rounded-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, hsl(0,76%,60%), hsl(60,76%,60%), hsl(120,76%,60%), hsl(180,76%,60%), hsl(240,76%,60%), hsl(300,76%,60%), hsl(360,76%,60%))",
            }}
          />
          <input
            type="range"
            min="0"
            max="360"
            value={customHue}
            onChange={(e) => handleCustomHue(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1 w-6 h-6 rounded-full border-2 border-white shadow-lg pointer-events-none"
            style={{
              left: `calc(${(customHue / 360) * 100}% - 12px)`,
              backgroundColor: `hsl(${customHue}, 76%, 60%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AccentColorPicker;
