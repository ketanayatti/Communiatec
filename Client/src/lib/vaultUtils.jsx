import React from "react";
import {
  File,
  FileText,
  Image,
  Archive,
  Video,
  Music,
  Code,
} from "lucide-react";

export const getFileIcon = (mimeType) => {
  const iconProps = { className: "w-5 h-5", strokeWidth: 1.5 };

  if (!mimeType) return <File {...iconProps} className="w-5 h-5 text-slate-400" />;

  if (mimeType.startsWith("image/"))
    return <Image {...iconProps} className="w-5 h-5 text-cyan-400" />;
  if (mimeType.includes("pdf"))
    return <FileText {...iconProps} className="w-5 h-5 text-red-400" />;
  if (mimeType.includes("zip") || mimeType.includes("rar"))
    return <Archive {...iconProps} className="w-5 h-5 text-orange-400" />;
  if (mimeType.startsWith("video/"))
    return <Video {...iconProps} className="w-5 h-5 text-purple-400" />;
  if (mimeType.startsWith("audio/"))
    return <Music {...iconProps} className="w-5 h-5 text-pink-400" />;
  if (
    mimeType.includes("code") ||
    mimeType.includes("javascript") ||
    mimeType.includes("html") ||
    mimeType.includes("json")
  )
    return <Code {...iconProps} className="w-5 h-5 text-green-400" />;
  return <File {...iconProps} className="w-5 h-5 text-slate-400" />;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
