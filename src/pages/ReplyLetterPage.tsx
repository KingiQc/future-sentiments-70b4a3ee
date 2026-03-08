import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Lock, Send } from "lucide-react";
import { saveSentLetter, getReceivedLetters, Letter } from "@/lib/letters";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import MediaAttachments, { Attachment } from "@/components/MediaAttachments";
import { scheduleLetterNotification } from "@/lib/notifications";

const ReplyLetterPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const originalLetter = getReceivedLetters().find((l) => l.id === id);

  const [title, setTitle] = useState(
    originalLetter ? `Re: ${originalLetter.title}` : ""
  );
  const [body, setBody] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  if (!originalLetter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <p className="text-muted-foreground text-[15px]">Original letter not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-[15px]"
        >
          Go back
        </button>
      </div>
    );
  }

  const handleSend = () => {
    const letter: Letter = {
      id: crypto.randomUUID(),
      title,
      body,
      sentDate: new Date().toISOString(),
      deliveryDate: deliveryTime
        ? new Date(`${deliveryDate}T${deliveryTime}`).toISOString()
        : new Date(deliveryDate).toISOString(),
      isLocked,
      recipientName: originalLetter.recipientName || undefined,
      recipientPhone: originalLetter.recipientPhone || undefined,
      status: "sent",
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    saveSentLetter(letter);
    scheduleLetterNotification(title, deliveryDate, originalLetter.recipientName || undefined);
    toast({
      title: "✉️ Reply Scheduled!",
      description: `"${title}" will be delivered on ${new Date(letter.deliveryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.`,
    });
    navigate("/received");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-5 pt-10 pb-10">
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
          <h1 className="text-2xl font-bold text-foreground">Reply Letter</h1>
        </motion.div>

        {/* Original letter preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg p-4 mb-4 border border-border"
        >
          <p className="text-xs text-muted-foreground mb-1">Replying to</p>
          <h4 className="text-[15px] font-medium text-foreground">{originalLetter.title}</h4>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{originalLetter.body}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          {/* Title */}
          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-2 block">Title</label>
            <input
              type="text"
              placeholder="Reply title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-medium text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
          </div>

          {/* Body */}
          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-2 block">Your Reply</label>
            <textarea
              placeholder="Write your reply..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Attachments */}
          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-2 block">Attachments</label>
            <MediaAttachments attachments={attachments} onChange={setAttachments} />
          </div>

          {/* Delivery Date & Time */}
          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-2 block">Delivery Date</label>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-primary" />
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={`flex-1 bg-transparent text-[15px] text-foreground outline-none ${theme === "dark" ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
              />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Clock size={16} className="text-primary" />
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
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
            Schedule Reply
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ReplyLetterPage;
