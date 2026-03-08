import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Video, FileText, Mic, X, Paperclip, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

export interface Attachment {
  url: string;
  type: "image" | "video" | "audio" | "document";
  name: string;
}

interface MediaAttachmentsProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

const MediaAttachments = ({ attachments, onChange }: MediaAttachmentsProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const uploadFile = async (file: File, type: Attachment["type"]) => {
    if (!user) {
      toast({ title: "Please sign in to attach files" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("letter-attachments")
      .upload(path, file);

    if (error) {
      toast({ title: "Upload failed", description: error.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("letter-attachments")
      .getPublicUrl(path);

    onChange([...attachments, { url: urlData.publicUrl, type, name: file.name }]);
    setUploading(false);
  };

  const handleFileSelect = (accept: string, type: Attachment["type"]) => {
    const input = fileInputRef.current;
    if (input) {
      input.accept = accept;
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) uploadFile(file, type);
      };
      input.click();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        await uploadFile(file, "audio");
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast({ title: "Microphone access denied" });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const removeAttachment = (index: number) => {
    onChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" className="hidden" />

      {/* Attachment buttons */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => handleFileSelect("image/*", "image")}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Image size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleFileSelect("video/*", "video")}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Video size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleFileSelect(".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx", "document")}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileText size={16} />
        </button>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            recording ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {recording ? <Square size={14} /> : <Mic size={16} />}
        </button>
        <button
          type="button"
          onClick={() => handleFileSelect("*/*", "document")}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Paperclip size={16} />
        </button>
        {uploading && <span className="text-xs text-muted-foreground ml-2">Uploading...</span>}
      </div>

      {/* Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {attachments.map((att, i) => (
              <div
                key={i}
                className="relative bg-secondary rounded-lg overflow-hidden"
              >
                {att.type === "image" ? (
                  <img src={att.url} alt="" className="w-20 h-20 object-cover" />
                ) : att.type === "video" ? (
                  <video src={att.url} className="w-20 h-20 object-cover" />
                ) : att.type === "audio" ? (
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Mic size={20} className="text-primary" />
                  </div>
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center">
                    <FileText size={20} className="text-primary" />
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center"
                >
                  <X size={12} className="text-foreground" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaAttachments;
