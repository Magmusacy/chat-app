import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export const formatLastSeen = (lastSeen: string | null): string => {
  if (!lastSeen) return "Never";
  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  if (now.getTime() - lastSeenDate.getTime() < 5 * 60 * 1000) {
    return "Just now";
  }
  if (isToday(lastSeenDate)) {
    return `Today at ${format(lastSeenDate, "HH:mm a")}`;
  }
  if (isYesterday(lastSeenDate)) {
    return `Yesterday at ${format(lastSeenDate, "HH:mm a")}`;
  }
  if (now.getTime() - lastSeenDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(lastSeenDate, { addSuffix: true });
  }
  return format(lastSeenDate, "MMM d, yyyy");
};

export const formatMessageTime = (timestamp: string): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "HH:mm");
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "dd/MM");
  }
};
