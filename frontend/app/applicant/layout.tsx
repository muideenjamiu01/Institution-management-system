'use client';

import { ApplicantAuthProvider } from '@/lib/applicant-auth-context';

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicantAuthProvider>{children}</ApplicantAuthProvider>;
}
