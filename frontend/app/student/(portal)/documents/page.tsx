'use client';

import { documentsApi, downloadFile } from '@/lib/api-student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, CreditCard, IdCard, GraduationCap, FileCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

interface Document {
  id: string;
  title: string;
  description: string;
  icon: any;
  downloadFn: () => Promise<Blob>;
  filename: string;
}

export default function DocumentsPage() {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const documents: Document[] = [
    {
      id: 'admission-letter',
      title: 'Admission Letter',
      description: 'Download your official admission letter',
      icon: FileCheck,
      downloadFn: documentsApi.downloadAdmissionLetter,
      filename: 'admission_letter.pdf',
    },
    {
      id: 'id-card',
      title: 'Student ID Card',
      description: 'Download your student identification card',
      icon: IdCard,
      downloadFn: documentsApi.downloadIDCard,
      filename: 'student_id_card.pdf',
    },
    {
      id: 'transcript',
      title: 'Academic Transcript',
      description: 'Download your complete academic transcript',
      icon: GraduationCap,
      downloadFn: documentsApi.downloadTranscript,
      filename: 'academic_transcript.pdf',
    },
  ];

  const handleDownload = async (document: Document) => {
    try {
      setDownloading(document.id);
      const blob = await document.downloadFn();
      downloadFile(blob, document.filename);
      toast({
        title: 'Success',
        description: `${document.title} downloaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to download ${document.title}`,
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-1">
          Download your academic and administrative documents
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => {
          const Icon = document.icon;
          return (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{document.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{document.description}</CardDescription>
                <Button
                  className="w-full"
                  onClick={() => handleDownload(document)}
                  disabled={downloading === document.id}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading === document.id ? 'Downloading...' : 'Download'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3 text-sm">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">File Format</p>
              <p className="text-muted-foreground">All documents are available in PDF format</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 text-sm">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Payment Receipts</p>
              <p className="text-muted-foreground">
                Payment receipts can be downloaded from the Payments page
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 text-sm">
            <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Transcript Availability</p>
              <p className="text-muted-foreground">
                Transcripts are only available after results have been published
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
