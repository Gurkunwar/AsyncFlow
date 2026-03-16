export const formatRelativeTime = (dateString) => {
  const now = new Date();
  const then = new Date(dateString);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return "just now";
  const mins = Math.floor(diffInSeconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const getDiscordAvatarUrl = (avatarStr, userId) => {
  if (!avatarStr || avatarStr === "0" || avatarStr === "") {
    try {
      const id = userId ? BigInt(userId) : 0n;
      const defaultIndex = Number((id >> 22n) % 6n);
      return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    } catch (e) {
      return `https://cdn.discordapp.com/embed/avatars/0.png`;
    }
  }
  if (avatarStr.startsWith("http")) return avatarStr;
  const cleanHash = avatarStr.includes("/")
    ? avatarStr.split("/")[1]
    : avatarStr;
  return `https://cdn.discordapp.com/avatars/${userId}/${cleanHash}.png`;
};
