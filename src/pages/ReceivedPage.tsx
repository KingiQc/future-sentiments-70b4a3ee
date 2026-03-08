import { Mail, Unlock, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { getReceivedLetters, clearUnread, formatDate, isDelivered } from "@/lib/letters";
import { useState, useEffect } from "react";

const ReceivedPage = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [letters, setLetters] = useState(getReceivedLetters());
  const [unlocking, setUnlocking] = useState<string | null>(null);

  useEffect(() => {
    clearUnread();
  }, []);

  const handleOpen = (letterId: string) => {
    if (openId === letterId) {
      setOpenId(null);
      return;
    }
    const letter = letters.find((l) => l.id === letterId);
    if (letter && isDelivered(letter.deliveryDate)) {
      setUnlocking(letterId);
      setTimeout(() => {
        setUnlocking(null);
        setOpenId(letterId);
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-5xl mx-auto px-5">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background pt-10 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[34px] font-bold text-foreground"
          >
            Received
          </motion.h1>
        </div>

        {letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-muted-foreground">
            <Mail size={48} className="mb-4 opacity-40" />
            <p className="text-[15px]">No letters received yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {letters.map((letter, i) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => handleOpen(letter.id)}
                className="bg-card rounded-lg p-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Delivered {formatDate(letter.deliveryDate)}
                    </span>
                    <h4 className="text-[15px] font-medium text-foreground mt-1">
                      {letter.title}
                    </h4>
                  </div>
                  <AnimatePresence mode="wait">
                    {unlocking === letter.id ? (
                      <motion.div
                        key="unlocking"
                        initial={{ rotate: -20, scale: 1.2 }}
                        animate={{ rotate: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Unlock size={16} className="text-primary mt-1" />
                      </motion.div>
                    ) : openId === letter.id ? (
                      <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Unlock size={16} className="text-primary mt-1" />
                      </motion.div>
                    ) : (
                      <Lock size={16} className="text-muted-foreground mt-1" />
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {openId === letter.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {letter.body}
                      </p>
                      {letter.recipientName && (
                        <p className="text-xs text-primary mt-2">To: {letter.recipientName}</p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        Sent {formatDate(letter.sentDate)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ReceivedPage;
