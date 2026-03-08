import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, Mail, AtSign, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getSentLetters } from "@/lib/letters";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name, username: username || null, phone: phone || null })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message });
    } else {
      await refreshProfile();
      setEditing(false);
      toast({ title: "Profile updated!" });
    }
  };

  const displayName = profile?.name || "User";
  const initial = displayName[0]?.toUpperCase() || "U";
  const letterCount = getSentLetters().length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-5xl mx-auto px-5 pt-10 w-full flex-1 flex flex-col">
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
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <div className="flex-1" />
          {!editing ? (
            <button onClick={() => setEditing(true)} className="text-sm text-primary font-medium">
              Edit
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-sm text-primary font-medium">
              <Save size={14} />
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-3 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary text-3xl font-bold">{initial}</span>
            )}
          </div>
          <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
          {profile?.username && (
            <p className="text-sm text-primary">@{profile.username}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Member since {new Date(profile?.created_at || "").toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {[
            { icon: User, label: "Name", value: editing ? undefined : (profile?.name || "Not set"), editable: true, editValue: name, onChange: setName },
            { icon: AtSign, label: "Username", value: editing ? undefined : (profile?.username || "Not set"), editable: true, editValue: username, onChange: setUsername },
            { icon: Phone, label: "Phone", value: editing ? undefined : (profile?.phone || "Not set"), editable: true, editValue: phone, onChange: setPhone },
            { icon: Mail, label: "Letters Sent", value: String(letterCount) },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-card rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <item.icon size={16} className="text-foreground" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                {editing && item.editable ? (
                  <input
                    type="text"
                    value={item.editValue}
                    onChange={(e) => item.onChange?.(e.target.value)}
                    className="block w-full bg-transparent text-[15px] text-foreground font-medium outline-none mt-0.5"
                    placeholder={`Enter ${item.label.toLowerCase()}`}
                  />
                ) : (
                  <p className="text-[15px] text-foreground font-medium">{item.value}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
