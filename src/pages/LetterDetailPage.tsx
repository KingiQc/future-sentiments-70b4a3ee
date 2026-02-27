import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Unlock, Send, User, Phone, Calendar, Trash2 } from "lucide-react";
import { getSentLetters, getReceivedLetters, calculateProgress, formatDate, getCountdownText, isDelivered, deleteSentLetter, deleteReceivedLetter } from "@/lib/letters";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const LetterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const allLetters = [...getSentLetters(), ...getReceivedLetters()];
  const letter = allLetters.find((l) => l.id === id);

  useEffect(() => {
    if (letter && isDelivered(letter.deliveryDate)) {
      setUnlocked(true);
    }
  }, [letter]);

  if (!letter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <p className="text-muted-foreground text-[15px]">Letter not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-[15px]"
        >
          Go back
        </button>
      </div>
    );
  }

  const progress = calculateProgress(letter.sentDate, letter.deliveryDate);
  const percent = Math.round(progress * 100);
  const delivered = isDelivered(letter.deliveryDate);

  const handleUnlock = () => {
    if (!delivered || unlocked) return;
    setUnlocking(true);
    setTimeout(() => {
      setUnlocking(false);
      setUnlocked(true);
    }, 800);
  };

  const handleDelete = () => {
    if (letter.status === "delivered") {
      deleteReceivedLetter(letter.id);
    } else {
      deleteSentLetter(letter.id);
    }
    toast({
      title: "🗑️ Letter Deleted",
      description: `"${letter.title}" has been removed.`,
    });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="max-w-5xl mx-auto px-5">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background pt-14 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <h1 className="text-xl font-semibold text-foreground truncate flex-1">
              {letter.title}
            </h1>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center"
            >
              <Trash2 size={16} className="text-destructive" />
            </button>
          </motion.div>
        </div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-lg p-5 mb-6"
          style={{
            background: "linear-gradient(135deg, hsl(27, 68%, 53%), hsl(20, 60%, 48%))",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Send size={12} className="text-primary-foreground" />
              <span className="text-sm text-primary-foreground">
                {delivered ? "Delivered" : getCountdownText(letter.deliveryDate)}
              </span>
            </div>
            {delivered ? (
              <Unlock size={18} className="text-primary-foreground/70" />
            ) : (
              <Lock size={18} className="text-primary-foreground/70" />
            )}
          </div>

          <div className="mt-4">
            <div className="w-full h-1.5 bg-primary-foreground/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-primary-foreground rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-primary-foreground/60">Sent</span>
              <span className="text-xs text-primary-foreground/80">{percent}%</span>
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-3 mb-6"
        >
          <div className="bg-card rounded-lg p-4 flex items-center gap-3">
            <Calendar size={16} className="text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Sent</p>
              <p className="text-[15px] text-foreground">{formatDate(letter.sentDate)}</p>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 flex items-center gap-3">
            <Calendar size={16} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Delivery Date</p>
              <p className="text-[15px] text-foreground">{formatDate(letter.deliveryDate)}</p>
            </div>
          </div>
          {letter.recipientName && (
            <div className="bg-card rounded-lg p-4 flex items-center gap-3">
              <User size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Recipient</p>
                <p className="text-[15px] text-foreground">{letter.recipientName}</p>
              </div>
            </div>
          )}
          {letter.recipientPhone && (
            <div className="bg-card rounded-lg p-4 flex items-center gap-3">
              <Phone size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-[15px] text-foreground">{letter.recipientPhone}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Letter Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-lg p-5"
        >
          <h3 className="text-[15px] font-medium text-muted-foreground mb-3">Letter Content</h3>
          {unlocked || !letter.isLocked ? (
            <p className="text-[15px] text-foreground leading-relaxed whitespace-pre-wrap">
              {letter.body}
            </p>
          ) : (
            <div className="flex flex-col items-center py-8 gap-3">
              <motion.div
                animate={unlocking ? { rotate: [0, -20, 20, 0], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6 }}
              >
                <Lock size={32} className="text-muted-foreground" />
              </motion.div>
              <p className="text-sm text-muted-foreground text-center">
                This letter is locked until delivery
              </p>
              {delivered && (
                <button
                  onClick={handleUnlock}
                  className="mt-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[15px]"
                >
                  Unlock Letter
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-5"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-lg p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Letter?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This will permanently delete "{letter.title}". This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-lg bg-secondary text-foreground font-medium text-[15px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-lg bg-destructive text-destructive-foreground font-medium text-[15px]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LetterDetailPage;
