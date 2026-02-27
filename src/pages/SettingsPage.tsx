import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Moon, Sun, Lock, Download, Trash2, LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { isPasscodeEnabled, setPasscode, removePasscode, verifyPasscode } from "@/lib/passcode";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeConfirm, setPasscodeConfirm] = useState("");
  const [passcodeStep, setPasscodeStep] = useState<"enter" | "confirm" | "remove">("enter");
  const [passcodeEnabled, setPasscodeEnabled] = useState(isPasscodeEnabled());

  const handlePasscodeClick = () => {
    if (passcodeEnabled) {
      setPasscodeStep("remove");
    } else {
      setPasscodeStep("enter");
    }
    setPasscodeInput("");
    setPasscodeConfirm("");
    setShowPasscodeModal(true);
  };

  const handlePasscodeSubmit = () => {
    if (passcodeStep === "enter") {
      if (passcodeInput.length < 4) {
        toast({ title: "Passcode must be at least 4 digits" });
        return;
      }
      setPasscodeStep("confirm");
      setPasscodeConfirm("");
    } else if (passcodeStep === "confirm") {
      if (passcodeConfirm !== passcodeInput) {
        toast({ title: "Passcodes don't match", description: "Please try again." });
        setPasscodeStep("enter");
        setPasscodeInput("");
        setPasscodeConfirm("");
        return;
      }
      setPasscode(passcodeInput);
      setPasscodeEnabled(true);
      setShowPasscodeModal(false);
      toast({ title: "🔒 Passcode Set", description: "Your letters are now protected." });
    } else if (passcodeStep === "remove") {
      if (verifyPasscode(passcodeInput)) {
        removePasscode();
        setPasscodeEnabled(false);
        setShowPasscodeModal(false);
        toast({ title: "🔓 Passcode Removed" });
      } else {
        toast({ title: "Incorrect passcode" });
        setPasscodeInput("");
      }
    }
  };

  const settingsItems = [
    {
      icon: theme === "dark" ? Moon : Sun,
      label: "Appearance",
      desc: theme === "dark" ? "Dark mode" : "Light mode",
      onClick: toggleTheme,
    },
    {
      icon: Lock,
      label: "Passcode Lock",
      desc: passcodeEnabled ? "Enabled" : "Protect your letters",
      onClick: handlePasscodeClick,
    },
    { icon: Download, label: "Export Letters", desc: "Download your data", onClick: () => {} },
    { icon: Trash2, label: "Delete Account", desc: "Permanently delete", destructive: true, onClick: () => {} },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-5xl mx-auto px-5">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background pt-14 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[34px] font-bold text-foreground"
          >
            Settings
          </motion.h1>
        </div>

        {/* Profile section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/profile")}
          className="bg-card rounded-lg p-4 mb-6 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold text-lg">S</span>
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-medium text-foreground">Your Profile</h3>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </motion.div>

        <div className="flex flex-col gap-2">
          {settingsItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={item.onClick}
              className="bg-card rounded-lg p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.destructive ? "bg-destructive/20" : "bg-secondary"
              }`}>
                <item.icon size={18} className={item.destructive ? "text-destructive" : "text-foreground"} />
              </div>
              <div className="flex-1">
                <h4 className={`text-[15px] font-medium ${item.destructive ? "text-destructive" : "text-foreground"}`}>
                  {item.label}
                </h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/login")}
          className="mt-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <LogOut size={16} />
          <span className="text-[15px]">Sign Out</span>
        </motion.button>
      </div>
      <BottomNav />

      {/* Passcode Modal */}
      <AnimatePresence>
        {showPasscodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-5"
            onClick={() => setShowPasscodeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-lg p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {passcodeStep === "remove" ? "Remove Passcode" : passcodeStep === "confirm" ? "Confirm Passcode" : "Set Passcode"}
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                {passcodeStep === "remove"
                  ? "Enter your current passcode to remove it."
                  : passcodeStep === "confirm"
                  ? "Re-enter your passcode to confirm."
                  : "Choose a 4+ digit passcode to protect your letters."}
              </p>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                placeholder="Enter passcode"
                value={passcodeStep === "confirm" ? passcodeConfirm : passcodeInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (passcodeStep === "confirm") {
                    setPasscodeConfirm(val);
                  } else {
                    setPasscodeInput(val);
                  }
                }}
                className="w-full bg-secondary rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] text-foreground outline-none mb-5"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasscodeModal(false)}
                  className="flex-1 py-3 rounded-lg bg-secondary text-foreground font-medium text-[15px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasscodeSubmit}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-[15px]"
                >
                  {passcodeStep === "remove" ? "Remove" : passcodeStep === "confirm" ? "Confirm" : "Next"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
