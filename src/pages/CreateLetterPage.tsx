import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Lock, Send, User, Phone } from "lucide-react";
import { saveSentLetter, Letter } from "@/lib/letters";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";

const CreateLetterPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isLocked, setIsLocked] = useState(true);

  const handleSend = () => {
    const letter: Letter = {
      id: crypto.randomUUID(),
      title,
      body,
      sentDate: new Date().toISOString(),
      deliveryDate: new Date(deliveryDate).toISOString(),
      isLocked,
      recipientPhone: recipientPhone || undefined,
      recipientName: recipientName || undefined,
      status: "sent",
    };
    saveSentLetter(letter);
    toast({
      title: "✉️ Letter Scheduled!",
      description: `"${title}" will be delivered on ${new Date(deliveryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.`,
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-5 pt-14 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">New Letter</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          {/* Recipient */}
          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-2 block">Recipient</label>
            <div className="flex items-center gap-3 mb-3">
              <User size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Recipient name (or yourself)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-muted-foreground" />
              <input
                type="tel"
                placeholder="Phone number or username"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-2 block">Title</label>
            <input
              type="text"
              placeholder="Give your letter a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-medium text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
          </div>

          {/* Body */}
          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-2 block">Your Message</label>
            <textarea
              placeholder="Write your letter..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Delivery Date */}
          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-2 block">Delivery Date</label>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-primary" />
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={`flex-1 bg-transparent text-[15px] text-foreground outline-none ${theme === "dark" ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
              />
            </div>
          </div>

          {/* Lock Toggle */}
          <div className="bg-card rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-primary" />
              <div>
                <span className="text-[15px] text-foreground">Lock until delivery</span>
                <p className="text-xs text-muted-foreground">
                  Recipient can't open until the date
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`w-12 h-7 rounded-full transition-colors ${
                isLocked ? "bg-primary" : "bg-secondary"
              } relative`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-foreground absolute top-1 transition-all ${
                  isLocked ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Send */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSend}
            disabled={!title || !deliveryDate}
            className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            <Send size={18} />
            Schedule Letter
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateLetterPage;
