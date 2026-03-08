import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserMinus, UserPlus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

interface FollowedUser {
  id: string;
  user_id: string;
  name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
  follow_id: string;
}

interface SearchResult {
  id: string;
  user_id: string;
  name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_following: boolean;
}

const FollowPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [searching, setSearching] = useState(false);

  const loadFollowed = async () => {
    if (!user) return;
    const { data: follows } = await supabase
      .from("follows")
      .select("id, following_id")
      .eq("follower_id", user.id);

    if (follows && follows.length > 0) {
      const followingIds = follows.map((f) => f.following_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", followingIds);

      if (profiles) {
        const mapped = profiles.map((p) => ({
          ...p,
          follow_id: follows.find((f) => f.following_id === p.user_id)?.id || "",
        }));
        setFollowedUsers(mapped);
      }
    } else {
      setFollowedUsers([]);
    }
  };

  useEffect(() => {
    loadFollowed();
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    setSearching(true);

    const query = searchQuery.trim();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", user.id)
      .or(`username.ilike.%${query}%,name.ilike.%${query}%,phone.ilike.%${query}%`);

    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followingIds = new Set(follows?.map((f) => f.following_id) || []);

    setSearchResults(
      (profiles || []).map((p) => ({
        ...p,
        is_following: followingIds.has(p.user_id),
      }))
    );
    setSearching(false);
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user) return;
    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetUserId,
    });
    if (!error) {
      toast({ title: "Followed!" });
      setSearchResults((prev) =>
        prev.map((r) => (r.user_id === targetUserId ? { ...r, is_following: true } : r))
      );
      loadFollowed();
    }
  };

  const handleUnfollow = async (followId: string, targetUserId: string) => {
    const { error } = await supabase.from("follows").delete().eq("id", followId);
    if (!error) {
      toast({ title: "Unfollowed" });
      setFollowedUsers((prev) => prev.filter((u) => u.follow_id !== followId));
      setSearchResults((prev) =>
        prev.map((r) => (r.user_id === targetUserId ? { ...r, is_following: false } : r))
      );
    }
  };

  const UserAvatar = ({ url, name }: { url: string | null; name: string | null }) => (
    <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-primary font-semibold text-sm">
          {(name || "?")[0].toUpperCase()}
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-5xl mx-auto px-5">
        <div className="sticky top-0 z-40 bg-background pt-10 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[34px] font-bold text-foreground mb-4"
          >
            Follow
          </motion.h1>

          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 bg-card rounded-lg px-4 py-3 flex items-center gap-3">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by username, name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={searching}
              className="px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
            >
              Search
            </motion.button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-6">
            <span className="text-sm text-muted-foreground mb-3 block">Search Results</span>
            <div className="flex flex-col gap-2">
              {searchResults.map((r) => (
                <motion.div
                  key={r.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg p-4 flex items-center gap-3"
                >
                  <UserAvatar url={r.avatar_url} name={r.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-foreground truncate">
                      {r.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.username ? `@${r.username}` : r.phone || ""}
                    </p>
                  </div>
                  {r.is_following ? (
                    <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-secondary">
                      Following
                    </span>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFollow(r.user_id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium"
                    >
                      <UserPlus size={14} />
                      Follow
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Followed Users */}
        <div>
          <span className="text-sm text-muted-foreground mb-3 block">
            Following ({followedUsers.length})
          </span>
          {followedUsers.length === 0 ? (
            <div className="flex flex-col items-center pt-16 text-muted-foreground">
              <UserPlus size={48} className="mb-4 opacity-40" />
              <p className="text-[15px]">Search for users to follow</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {followedUsers.map((u, i) => (
                <motion.div
                  key={u.follow_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="bg-card rounded-lg p-4 flex items-center gap-3"
                >
                  <UserAvatar url={u.avatar_url} name={u.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-foreground truncate">
                      {u.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.username ? `@${u.username}` : u.phone || ""}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUnfollow(u.follow_id, u.user_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium"
                  >
                    <UserMinus size={14} />
                    Unfollow
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default FollowPage;
