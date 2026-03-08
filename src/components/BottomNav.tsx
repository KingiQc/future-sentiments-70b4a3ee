import { Send, Mail, Settings, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getUnreadCount } from "@/lib/letters";
import { useState, useEffect } from "react";

const tabs = [
  { path: "/", label: "Sent", icon: Send },
  { path: "/received", label: "Received", icon: Mail },
  { path: "/follow", label: "Follow", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUnread(getUnreadCount());
    const interval = setInterval(() => setUnread(getUnreadCount()), 2000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md z-50">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex items-center justify-around rounded-full bg-card/90 backdrop-blur-lg border border-border py-2 px-2"
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={18} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.label === "Received" && unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomNav;
