import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ryokourent V2 — Lacak Unit & Kalkulator Denda ShortRent',
  description:
    'Audit penyelesaian migrasi Ryokourent v2 (D-26 & D-27): CPT Lacak Unit (Pool Parkir, Bengkel Servis, Posisi Sewa) & Kalkulator Denda ShortRent Step-Up 60 Menit.',
  openGraph: {
    title: 'Ryokourent V2 — Lacak Unit & Kalkulator Denda ShortRent',
    description:
      'Audit penyelesaian migrasi Ryokourent v2 (D-26 & D-27): CPT Lacak Unit (Pool Parkir, Bengkel Servis, Posisi Sewa) & Kalkulator Denda ShortRent Step-Up 60 Menit.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ryokourent V2 — Lacak Unit & Kalkulator Denda ShortRent',
    description:
      'Audit penyelesaian migrasi Ryokourent v2 (D-26 & D-27): CPT Lacak Unit (Pool Parkir, Bengkel Servis, Posisi Sewa) & Kalkulator Denda ShortRent Step-Up 60 Menit.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
