"use client";

import { useState, useRef } from "react";
import { useUploadDocuments, useGetDocuments, useDeleteDocument } from "@/lib/hooks/useApplicantQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Image, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Eye 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DocumentUploadProps {
  onUploadSuccess?: () => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const { toast } = useToast();
  const uploadMutation = useUploadDocuments();
  const { data: documentsData, isLoading: documentsLoading } = useGetDocuments();
  const deleteMutation = useDeleteDocument();

  // Base URL for file serving (without /api suffix)
  const fileBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const [selectedFiles, setSelectedFiles] = useState<{
    passportPhoto?: File;
    academicDocument?: File;
    additionalDocument?: File;
  }>({});

  const passportInputRef = useRef<HTMLInputElement>(null);
  const academicInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  const documents = documentsData?.data || {};

  const handleFileSelect = (type: 'passportPhoto' | 'academicDocument' | 'additionalDocument', file: File) => {
    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (type === 'passportPhoto') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Passport photo must be JPEG, JPG, or PNG",
          variant: "destructive",
        });
        return;
      }
    } else {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Documents must be PDF, JPEG, JPG, or PNG",
          variant: "destructive",
        });
        return;
      }
    }

    setSelectedFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleUpload = () => {
    if (Object.keys(selectedFiles).length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    
    Object.entries(selectedFiles).forEach(([type, file]) => {
      if (file) {
        formData.append(type, file);
      }
    });

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        setSelectedFiles({});
        // Reset file inputs
        if (passportInputRef.current) passportInputRef.current.value = '';
        if (academicInputRef.current) academicInputRef.current.value = '';
        if (additionalInputRef.current) additionalInputRef.current.value = '';
        
        if (onUploadSuccess) onUploadSuccess();
      },
    });
  };

  const handleDelete = (documentType: string) => {
    deleteMutation.mutate(documentType);
  };

  const getFileTypeIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? <FileText className="h-4 w-4" /> : <Image className="h-4 w-4" />;
  };

  const getDocumentDisplayName = (type: string) => {
    switch (type) {
      case 'passportPhoto':
        return 'Passport Photo';
      case 'academicDocument':
        return 'Academic Document (ND/HND/BSC Result)';
      case 'additionalDocument':
        return 'Additional Document';
      default:
        return type;
    }
  };

  if (documentsLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload your passport photo and academic documents. Maximum file size: 5MB each.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Documents Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Current Documents</h4>
          <div className="grid gap-3">
            {['passportPhoto', 'academicDocument', 'additionalDocument'].map((docType) => (
              <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {documents[docType] ? getFileTypeIcon(documents[docType]) : <FileText className="h-4 w-4 text-gray-400" />}
                  <div>
                    <p className="text-sm font-medium">{getDocumentDisplayName(docType)}</p>
                    {documents[docType] ? (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Not uploaded
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {documents[docType] && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`${fileBaseUrl}${documents[docType]}`, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(docType)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload New Files */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Upload New Documents</h4>
          
          {/* Passport Photo */}
          <div className="space-y-2">
            <Label htmlFor="passport-photo">Passport Photo *</Label>
            <Input
              id="passport-photo"
              type="file"
              ref={passportInputRef}
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('passportPhoto', file);
              }}
            />
            {selectedFiles.passportPhoto && (
              <p className="text-sm text-green-600">
                Selected: {selectedFiles.passportPhoto.name}
              </p>
            )}
            <p className="text-xs text-gray-500">
              JPEG, JPG, or PNG format. This will be used as your profile picture.
            </p>
          </div>

          {/* Academic Document */}
          <div className="space-y-2">
            <Label htmlFor="academic-document">Academic Document (ND/HND/BSC Result)</Label>
            <Input
              id="academic-document"
              type="file"
              ref={academicInputRef}
              accept="application/pdf,image/jpeg,image/jpg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('academicDocument', file);
              }}
            />
            {selectedFiles.academicDocument && (
              <p className="text-sm text-green-600">
                Selected: {selectedFiles.academicDocument.name}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Upload your previous academic qualification result (PDF or image format)
            </p>
          </div>

          {/* Additional Document */}
          <div className="space-y-2">
            <Label htmlFor="additional-document">Additional Document (Optional)</Label>
            <Input
              id="additional-document"
              type="file"
              ref={additionalInputRef}
              accept="application/pdf,image/jpeg,image/jpg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('additionalDocument', file);
              }}
            />
            {selectedFiles.additionalDocument && (
              <p className="text-sm text-green-600">
                Selected: {selectedFiles.additionalDocument.name}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Any additional supporting document (PDF or image format)
            </p>
          </div>

          {Object.keys(selectedFiles).length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ready to upload {Object.keys(selectedFiles).length} file(s). 
                Click "Upload Documents" to save them.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleUpload}
            disabled={uploadMutation.isPending || Object.keys(selectedFiles).length === 0}
            className="w-full"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}