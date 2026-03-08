import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Moon, Sun, Lock, Download, Trash2, LogOut, Palette, Camera, Bell } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AccentColorPicker from "@/components/AccentColorPicker";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { isPasscodeEnabled, setPasscode, removePasscode, verifyPasscode } from "@/lib/passcode";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { requestNotificationPermission, isNotificationEnabled } from "@/lib/notifications";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeConfirm, setPasscodeConfirm] = useState("");
  const [passcodeStep, setPasscodeStep] = useState<"enter" | "confirm" | "remove">("enter");
  const [passcodeEnabled, setPasscodeEnabled] = useState(isPasscodeEnabled());
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [notificationsOn, setNotificationsOn] = useState(isNotificationEnabled());

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsOn(granted);
    toast({ title: granted ? "🔔 Notifications enabled" : "Notifications blocked by browser" });
  };

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    await supabase.storage.from("avatars").remove([path]);
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    await refreshProfile();
    setUploadingAvatar(false);
    toast({ title: "Profile picture updated!" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = profile?.name || "User";
  const initial = displayName[0]?.toUpperCase() || "U";

  const settingsItems = [
    {
      icon: theme === "dark" ? Moon : Sun,
      label: "Appearance",
      desc: theme === "dark" ? "Dark mode" : "Light mode",
      onClick: toggleTheme,
    },
    {
      icon: Palette,
      label: "Accent Color",
      desc: "Customize your theme color",
      onClick: () => setShowColorPicker(!showColorPicker),
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
        <div className="sticky top-0 z-40 bg-background pt-10 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[34px] font-bold text-foreground"
          >
            Settings
          </motion.h1>
        </div>

        {/* Profile section with avatar upload */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/profile")}
          className="bg-card rounded-lg p-4 mb-6 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-semibold text-lg">{initial}</span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                avatarInputRef.current?.click();
              }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
            >
              <Camera size={13} className="text-primary-foreground" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-medium text-foreground">
              {uploadingAvatar ? "Uploading..." : displayName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile?.username ? `@${profile.username}` : "Manage your account"}
            </p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </motion.div>

        <div className="flex flex-col gap-2">
          {settingsItems.map((item, i) => (
            <div key={item.label}>
              <motion.div
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

              {/* Color picker inline */}
              <AnimatePresence>
                {item.label === "Accent Color" && showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-card rounded-lg p-4 mt-1">
                      <AccentColorPicker />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleSignOut}
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
              <div className="flex gap-3 justify-center mb-5">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    autoFocus={i === 0}
                    value={
                      passcodeStep === "confirm"
                        ? passcodeConfirm[i] || ""
                        : passcodeInput[i] || ""
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (passcodeStep === "confirm") {
                        const arr = passcodeConfirm.split("");
                        arr[i] = val.slice(-1);
                        setPasscodeConfirm(arr.join(""));
                      } else {
                        const arr = passcodeInput.split("");
                        arr[i] = val.slice(-1);
                        setPasscodeInput(arr.join(""));
                      }
                      if (val && i < 3) {
                        const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                        next?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const current = passcodeStep === "confirm" ? passcodeConfirm : passcodeInput;
                        if (!current[i] && i > 0) {
                          const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement;
                          prev?.focus();
                        }
                      }
                    }}
                    className="w-14 h-14 rounded-xl bg-secondary text-center text-2xl font-bold text-foreground outline-none border-2 border-border focus:border-primary transition-colors"
                  />
                ))}
              </div>
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
