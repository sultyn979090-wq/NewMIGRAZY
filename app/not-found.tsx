import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xs border border-slate-200 p-8 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-800 mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-slate-600 mb-6">
          Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
