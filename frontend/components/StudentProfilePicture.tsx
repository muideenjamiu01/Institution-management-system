"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useStudentAuth } from "@/lib/student-auth-context";

interface StudentProfilePictureProps {
  firstName?: string;
  lastName?: string;
  profilePicture?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function StudentProfilePicture({ 
  firstName, 
  lastName, 
  profilePicture,
  size = "md",
  className = ""
}: StudentProfilePictureProps) {
  const { student } = useStudentAuth();

  // Use props or fall back to auth context
  const fName = firstName || student?.firstName || '';
  const lName = lastName || student?.lastName || '';
  const pic = profilePicture !== undefined ? profilePicture : student?.profilePicture;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-20 w-20",
    xl: "h-32 w-32"
  };

  const getInitials = () => {
    return `${fName?.charAt(0) || ''}${lName?.charAt(0) || ''}`.toUpperCase();
  };

  const getImageUrl = () => {
    if (pic) {
      // If it's already a full URL, return as is
      if (pic.startsWith('http')) {
        return pic;
      }
      
      // Use base URL without /api suffix for file serving
      const fileBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${fileBaseUrl}${pic}`;
    }
    return undefined;
  };

  const imageUrl = getImageUrl();

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`} key={pic || 'no-pic'}>
      <AvatarImage 
        src={imageUrl} 
        alt={`${fName} ${lName}`}
      />
      <AvatarFallback className="bg-green-100 text-green-600 font-medium">
        {getInitials() || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
