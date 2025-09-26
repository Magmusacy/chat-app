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

export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);

  // Format: "Today, 3:45 PM" or "Yesterday, 3:45 PM" or "Sep 24, 3:45 PM"
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Format time
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const timeString = date.toLocaleTimeString(undefined, timeOptions);

  // Check if date is today, yesterday, or earlier
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${timeString}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeString}`;
  } else {
    // Format: "Sep 24"
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    const dateString = date.toLocaleDateString(undefined, dateOptions);
    return `${dateString}, ${timeString}`;
  }
};
