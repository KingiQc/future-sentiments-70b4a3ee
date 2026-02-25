import { Send, Timer, Plus, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HighlightCard from "@/components/HighlightCard";
import LetterCard from "@/components/LetterCard";
import BottomNav from "@/components/BottomNav";
import { getSentLetters, processDeliveries } from "@/lib/letters";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const SentPage = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState(getSentLetters());

  useEffect(() => {
    const delivered = processDeliveries();
    if (delivered.length > 0) {
      setLetters(getSentLetters());
      delivered.forEach((l) => {
        toast({
          title: "📬 Letter Delivered!",
          description: `"${l.title}" has been delivered.`,
        });
      });
    }
  }, []);

  const nextDelivery = letters[0];
  const upcoming = letters.slice(1);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-5xl mx-auto px-5">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background pt-14 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <h1 className="text-[34px] font-bold text-foreground">Sent</h1>
            <button
              onClick={() => navigate("/create")}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform"
            >
              <Plus size={22} className="text-primary-foreground" />
            </button>
          </motion.div>
        </div>

        {letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-muted-foreground">
            <Mail size={48} className="mb-4 opacity-40" />
            <p className="text-[15px]">No letters sent yet</p>
            <button
              onClick={() => navigate("/create")}
              className="mt-4 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-[15px]"
            >
              Write your first letter
            </button>
          </div>
        ) : (
          <>
            {/* Delivers Next */}
            {nextDelivery && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Send size={14} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Delivers Next</span>
                </div>
                <HighlightCard letter={nextDelivery} />
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Timer size={14} className="text-foreground" />
                  <span className="text-[15px] font-medium text-foreground">
                    Upcoming Letters
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {upcoming.map((letter, i) => (
                    <LetterCard key={letter.id} letter={letter} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default SentPage;
