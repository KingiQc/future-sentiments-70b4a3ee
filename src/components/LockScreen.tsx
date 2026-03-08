import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { isAppLocked, verifyPasscode, unlockApp } from "@/lib/passcode";

const LockScreen = ({ children }: { children: React.ReactNode }) => {
  const [locked, setLocked] = useState(isAppLocked());
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (locked) {
      inputRefs.current[0]?.focus();
    }
  }, [locked]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const fullCode = newCode.join("");
      if (fullCode.length === 4) {
        if (verifyPasscode(fullCode)) {
          unlockApp();
          setLocked(false);
        } else {
          setError(true);
          setCode(["", "", "", ""]);
          setTimeout(() => inputRefs.current[0]?.focus(), 300);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (!locked) return <>{children}</>;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            {error ? (
              <motion.div
                animate={{ x: [-10, 10, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                <Lock size={28} className="text-destructive" />
              </motion.div>
            ) : (
              <ShieldCheck size={28} className="text-muted-foreground" />
            )}
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-2">
            Enter Passcode
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {error ? "Incorrect passcode. Try again." : "Enter your 4-digit passcode to unlock"}
          </p>

          <div className="flex gap-3 mb-8">
            {code.map((digit, i) => (
              <motion.input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={`w-14 h-14 rounded-xl text-center text-2xl font-bold outline-none transition-colors ${
                  error
                    ? "bg-destructive/20 border-2 border-destructive text-destructive"
                    : "bg-card border-2 border-border text-foreground focus:border-primary"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LockScreen;
