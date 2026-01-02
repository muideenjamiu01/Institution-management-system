"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Camera } from "lucide-react";
import { useGetDocuments } from "@/lib/hooks/useApplicantQueries";

interface ProfilePictureProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg" | "xl";
  showUploadHint?: boolean;
  className?: string;
}

export default function ProfilePicture({ 
  firstName, 
  lastName, 
  size = "md",
  showUploadHint = false,
  className = ""
}: ProfilePictureProps) {
  const { data: documentsData } = useGetDocuments();
  const documents = documentsData?.data || {};
  const passportPhoto = documents.passportPhoto;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-20 w-20",
    xl: "h-32 w-32"
  };

  const getInitials = () => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getImageUrl = () => {
    if (passportPhoto) {
      // Use base URL without /api suffix for file serving
      const fileBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${fileBaseUrl}${passportPhoto}`;
    }
    return undefined;
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={getImageUrl()} 
            alt={`${firstName} ${lastName}`}
          />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
            {getInitials() || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        
        {!passportPhoto && showUploadHint && (
          <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1">
            <Camera className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      
      {showUploadHint && (
        <div className="text-center">
          {passportPhoto ? (
            <Badge variant="secondary" className="text-green-600">
              Photo uploaded
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600">
              Upload passport photo
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}