import { motion } from "framer-motion";
import { ChevronRight, Moon, Lock, Download, Trash2, LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const settingsItems = [
  { icon: Moon, label: "Appearance", desc: "Dark mode" },
  { icon: Lock, label: "Passcode Lock", desc: "Protect your letters" },
  { icon: Download, label: "Export Letters", desc: "Download your data" },
  { icon: Trash2, label: "Delete Account", desc: "Permanently delete", destructive: true },
];

const SettingsPage = () => {
  const navigate = useNavigate();

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
    </div>
  );
};

export default SettingsPage;
