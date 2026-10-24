'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bike,
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  User,
  CreditCard,
  Phone,
  AlertCircle,
  X,
  RefreshCw,
  Check,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

export interface MotorCatalogItem {
  id: number;
  namaModel: string;
  kategori: string;
  harga1Hari: number;
  harga1Minggu: number;
  harga2Minggu: number;
  harga12Jam: number;
  harga9Jam: number;
  harga6Jam: number;
  harga3Jam: number;
  dendaHarianPerJam: number;
  fasilitas: string | null;
  spesifikasi: string | null;
  imageUrl: string | null;
  isActive: boolean | null;
  totalUnits?: number;
  availableUnits?: number;
}

function formatRp(val: number) {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
}

export default function CustomerBookingPortal({
  onBookingSuccess,
}: {
  onBookingSuccess?: (bookingData: any) => void;
}) {
  const [catalog, setCatalog] = useState<MotorCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeDurationView, setActiveDurationView] = useState<
    '1_hari' | '1_minggu' | '2_minggu' | '12_jam' | '9_jam' | '6_jam' | '3_jam'
  >('1_hari');

  // Booking Form State
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedMotor, setSelectedMotor] = useState<MotorCatalogItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  // Form Fields
  const [formData, setFormData] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    return {
      namaPenyewa: '',
      tandaPelanggan: 'baru' as 'baru' | 'langganan',
      jenisIdPendukung: 'SIM_C',
      nomorWa: '',
      poolArea: 'malang' as 'malang' | 'batu',
      alamatPengantaran: '',
      alamatPenjemputan: '',
      jamTanggalMulai: tomorrow.toISOString().slice(0, 16),
      jamTanggalSelesai: dayAfter.toISOString().slice(0, 16),
      pilihanDurasi: '1_hari',
    };
  });

  // Fetch Catalog & Live Stock Status
  const fetchCatalogData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resModels, resLacak] = await Promise.all([
        fetch('/api/motor-models'),
        fetch('/api/lacak-units'),
      ]);

      const jsonModels = await resModels.json();
      const jsonLacak = await resLacak.json();

      if (jsonModels.success) {
        const rawModels: MotorCatalogItem[] = jsonModels.data || [];
        const trackingList: any[] = jsonLacak.success ? jsonLacak.data || [] : [];

        // Calculate live stock per model (Opsi 3A live count)
        const enriched = rawModels.map((m) => {
          const modelUnits = trackingList.filter((u) => u.motorId === m.id);
          const availableUnits = modelUnits.filter((u) => u.statusPosisi === 'parkir').length;
          return {
            ...m,
            totalUnits: modelUnits.length,
            availableUnits,
          };
        });

        setCatalog(enriched);
        if (enriched.length > 0 && !selectedMotor) {
          setSelectedMotor(enriched[0]);
        }
      } else {
        throw new Error(jsonModels.error || 'Gagal memuat katalog motor');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([fetch('/api/motor-models'), fetch('/api/lacak-units')])
      .then(async ([resModels, resLacak]) => {
        const jsonModels = await resModels.json();
        const jsonLacak = await resLacak.json();
        if (!ignore && jsonModels.success) {
          const rawModels: MotorCatalogItem[] = jsonModels.data || [];
          const trackingList: any[] = jsonLacak.success ? jsonLacak.data || [] : [];

          const enriched = rawModels.map((m) => {
            const modelUnits = trackingList.filter((u) => u.motorId === m.id);
            const availableUnits = modelUnits.filter((u) => u.statusPosisi === 'parkir').length;
            return {
              ...m,
              totalUnits: modelUnits.length,
              availableUnits,
            };
          });

          setCatalog(enriched);
          if (enriched.length > 0) setSelectedMotor(enriched[0]);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter((m) => {
      if (selectedCategory !== 'Semua' && m.kategori !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [catalog, selectedCategory]);

  // Handle Motor Select
  const handleSelectMotor = (motor: MotorCatalogItem) => {
    setSelectedMotor(motor);
    setFormData((prev) => ({
      ...prev,
      pilihanDurasi: activeDurationView,
    }));
    // Scroll smoothly to booking form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Get active price for selected duration
  const getActivePrice = (motor: MotorCatalogItem, dur: string) => {
    switch (dur) {
      case '1_hari':
        return motor.harga1Hari;
      case '1_minggu':
        return motor.harga1Minggu;
      case '2_minggu':
        return motor.harga2Minggu;
      case '12_jam':
        return motor.harga12Jam;
      case '9_jam':
        return motor.harga9Jam;
      case '6_jam':
        return motor.harga6Jam;
      case '3_jam':
        return motor.harga3Jam;
      default:
        return motor.harga1Hari;
    }
  };

  // Calculate Duration End Date dynamically when duration changes
  const handleDurationChange = (dur: string) => {
    setFormData((prev) => {
      const start = new Date(prev.jamTanggalMulai);
      const end = new Date(start);

      if (dur === '1_hari') end.setDate(end.getDate() + 1);
      else if (dur === '1_minggu') end.setDate(end.getDate() + 7);
      else if (dur === '2_minggu') end.setDate(end.getDate() + 14);
      else if (dur === '12_jam') end.setHours(end.getHours() + 12);
      else if (dur === '9_jam') end.setHours(end.getHours() + 9);
      else if (dur === '6_jam') end.setHours(end.getHours() + 6);
      else if (dur === '3_jam') end.setHours(end.getHours() + 3);

      return {
        ...prev,
        pilihanDurasi: dur,
        jamTanggalSelesai: end.toISOString().slice(0, 16),
      };
    });
  };

  // Submit Customer Booking (BR-05: Strict UU PDP No NIK)
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMotor) {
      setError('Silakan pilih salah satu model motor terlebih dahulu.');
      return;
    }
    if (!formData.namaPenyewa || !formData.jenisIdPendukung || !formData.jamTanggalMulai || !formData.jamTanggalSelesai) {
      setError('Mohon lengkapi seluruh kolom formulir pemesanan.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const calcTotal = getActivePrice(selectedMotor, formData.pilihanDurasi);

      const res = await fetch('/api/penyewaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaPenyewa: formData.namaPenyewa,
          tandaPelanggan: formData.tandaPelanggan,
          jenisIdPendukung: formData.jenisIdPendukung,
          poolArea: formData.poolArea,
          alamatPengantaran: formData.alamatPengantaran,
          alamatPenjemputan: formData.alamatPenjemputan,
          motorId: selectedMotor.id,
          jamTanggalMulai: formData.jamTanggalMulai,
          jamTanggalSelesai: formData.jamTanggalSelesai,
          pilihanDurasi: formData.pilihanDurasi,
          totalBiayaManual: calcTotal,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengirimkan pemesanan');
      }

      setBookingSuccessData(json.data);
      if (onBookingSuccess) onBookingSuccess(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* ======================================================== */}
      {/* 1. HERO SECTION & TRUST BADGES                           */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-8 md:p-12 shadow-lg border border-emerald-900/40">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Portal Pemesanan Publik Modern Ryokourent</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Sewa Motor Nyaman di <span className="text-emerald-400">Malang & Kota Batu</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            Layanan sewa motor terpercaya dengan jaminan unit prima dan pilihan tarif hemat. Bebas ribet, gratis 2 helm SNI + jas hujan, siap antar-jemput stasiun atau hotel Anda.
          </p>

          {/* Trust Badges */}
          <div className="pt-3 flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <strong>Syarat Praktis:</strong> Cukup Identitas Pendukung (SIM/KTM)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              <Clock className="w-4 h-4 text-blue-400" />
              <strong>Pilihan Fleksibel:</strong> Harian & ShortRent 3-12 Jam
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              <MapPin className="w-4 h-4 text-amber-400" />
              <strong>2 Pool Resmi:</strong> Malang Kota & Wisata Batu
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ======================================================== */}
      {/* 2. CATALOG & LIVE BINARY STOCK (AC-02)                   */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
              Katalog Armada Terawat
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              Pilihan Motor & Tarif Multi-Tier
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Status ketersediaan terhubung langsung ke database Cloud SQL PostgreSQL secara real-time.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
            {['Semua', 'Matic', 'Sport', 'Trail', 'Retro'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Duration View Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <span className="text-slate-400 font-semibold shrink-0">Lihat Tarif:</span>
          {[
            { id: '1_hari', label: '1 Hari (24 Jam) [Utama]' },
            { id: '1_minggu', label: '1 Minggu' },
            { id: '2_minggu', label: '2 Minggu' },
            { id: '12_jam', label: '12 Jam' },
            { id: '9_jam', label: '9 Jam' },
            { id: '6_jam', label: '6 Jam' },
            { id: '3_jam', label: '3 Jam' },
          ].map((dur) => (
            <button
              key={dur.id}
              onClick={() => {
                setActiveDurationView(dur.id as any);
                if (selectedMotor) {
                  setFormData((prev) => ({ ...prev, pilihanDurasi: dur.id }));
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 transition-colors ${
                activeDurationView === dur.id
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {dur.label}
            </button>
          ))}
        </div>

        {/* Catalog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.map((motor) => {
            const isSelected = selectedMotor?.id === motor.id;
            const price = getActivePrice(motor, activeDurationView);
            // Live Binary Stock Indicator (AC-02)
            const hasAvailableStock = (motor.availableUnits || 0) > 0;

            return (
              <div
                key={motor.id}
                onClick={() => handleSelectMotor(motor)}
                className={`group bg-white rounded-3xl border-2 transition-all p-6 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-600 shadow-md ring-4 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Selected Ribbon */}
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-xs flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Motor Dipilih
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top: Category & LIVE STOCK INDICATOR */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {motor.kategori}
                    </span>

                    {/* INDIKATOR STOK BINER LIVE (AC-02 & D-18) */}
                    {hasAvailableStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Tersedia ({motor.availableUnits} Unit Siap)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Habis / Disewa ({motor.totalUnits} Terdaftar)
                      </span>
                    )}
                  </div>

                  {/* Motor Icon / Visual */}
                  <div className="w-full h-32 rounded-2xl bg-linear-to-br from-slate-50 to-emerald-50/40 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-102 transition-transform">
                    <Bike className="w-16 h-16 text-emerald-700/60" />
                  </div>

                  {/* Name & Rate */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {motor.namaModel}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-emerald-700">{formatRp(price)}</span>
                      <span className="text-xs text-slate-400 font-medium">
                        / {activeDurationView.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Spesifikasi & Fasilitas */}
                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{motor.fasilitas || '2 Helm SNI + Jas Hujan'}</span>
                    </div>
                    {motor.spesifikasi && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">{motor.spesifikasi}</p>
                    )}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-4 mt-2">
                  <button
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-800'
                    }`}
                  >
                    <span>{isSelected ? 'Lengkapi Formulir di Bawah' : 'Pilih Motor Ini'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE BOOKING FORM (ANTI-NIK UU PDP AC-02)      */}
      {/* ======================================================== */}
      <section ref={formRef} className="scroll-mt-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          {/* Form Header */}
          <div className="p-6 md:p-8 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Langkah Terakhir
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                Formulir Pemesanan Sewa Motor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lengkapi data pemesanan berikut untuk reservasi unit secara langsung.
              </p>
            </div>

            {selectedMotor && (
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Motor Pilihan</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedMotor.namaModel}</span>
                  <span className="text-xs text-emerald-700 font-bold block">
                    {formatRp(getActivePrice(selectedMotor, formData.pilihanDurasi))} /{' '}
                    {formData.pilihanDurasi.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmitBooking} className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Gagal Mengirimkan Pemesanan</p>
                  <p className="text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* SEKSI 1: IDENTITAS PENYEWA */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                1. Data Penyewa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nama Lengkap Penyewa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaPenyewa}
                    onChange={(e) => setFormData({ ...formData, namaPenyewa: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Jenis ID Pendukung <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.jenisIdPendukung}
                    onChange={(e) => setFormData({ ...formData, jenisIdPendukung: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white focus:outline-hidden font-medium"
                  >
                    <option value="SIM_C">SIM C (Surat Izin Mengemudi Motor)</option>
                    <option value="KTM">KTM (Kartu Tanda Mahasiswa)</option>
                    <option value="SIM_A">SIM A (Surat Izin Mengemudi Mobil)</option>
                    <option value="PASPOR">Paspor (Wisatawan Asing)</option>
                    <option value="NPWP">NPWP</option>
                    <option value="ID_KARYAWAN">ID Karyawan Perusahaan</option>
                    <option value="LAINNYA">ID Resmi Lainnya</option>
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Pilih identitas yang akan ditunjukkan saat serah terima
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.nomorWa}
                    onChange={(e) => setFormData({ ...formData, nomorWa: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Untuk konfirmasi serah terima motor
                  </span>
                </div>
              </div>
            </div>

            {/* SEKSI 2: POOL & LAYANAN ANTAR-JEMPUT */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                2. Lokasi Pool & Alamat Pengantaran
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Pilihan Lokasi Pool <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.poolArea}
                    onChange={(e) =>
                      setFormData({ ...formData, poolArea: e.target.value as 'malang' | 'batu' })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white focus:outline-hidden font-medium"
                  >
                    <option value="malang">Pool Malang Kota (Stasiun Kotabaru)</option>
                    <option value="batu">Pool Kota Wisata Batu (Alun-alun Batu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-700 mb-1 font-bold">
                    Alamat / Titik Pengantaran
                  </label>
                  <input
                    type="text"
                    value={formData.alamatPengantaran}
                    onChange={(e) => setFormData({ ...formData, alamatPengantaran: e.target.value })}
                    placeholder="Misal: Stasiun Kotabaru / Hotel Tugu Malang"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 mb-1 font-bold">
                    Alamat / Titik Penjemputan
                  </label>
                  <input
                    type="text"
                    value={formData.alamatPenjemputan}
                    onChange={(e) => setFormData({ ...formData, alamatPenjemputan: e.target.value })}
                    placeholder="Misal: Villa Batu / Terminal Arjosari"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SEKSI 3: JADWAL & DURASI SEWA */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                3. Paket Durasi & Jadwal Sewa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Paket Durasi Sewa <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.pilihanDurasi}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white focus:outline-hidden font-bold text-slate-800"
                  >
                    <optgroup label="Paket Harian (Paling Populer)">
                      <option value="1_hari">1 Hari (24 Jam Penuh)</option>
                      <option value="1_minggu">1 Minggu (7 Hari - Diskon Mingguan)</option>
                      <option value="2_minggu">2 Minggu (14 Hari)</option>
                    </optgroup>
                    <optgroup label="Paket ShortRent (Jam Fleksibel)">
                      <option value="12_jam">12 Jam</option>
                      <option value="9_jam">9 Jam</option>
                      <option value="6_jam">6 Jam</option>
                      <option value="3_jam">3 Jam</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Waktu Mulai Sewa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.jamTanggalMulai}
                    onChange={(e) => setFormData({ ...formData, jamTanggalMulai: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Waktu Selesai (Tenggat Kembali) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.jamTanggalSelesai}
                    onChange={(e) => setFormData({ ...formData, jamTanggalSelesai: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            {/* TOTAL ESTIMASI & SUBMIT BUTTON */}
            {selectedMotor && (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Total Estimasi Biaya Sewa:</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-emerald-800">
                      {formatRp(getActivePrice(selectedMotor, formData.pilihanDurasi))}
                    </span>
                    <span className="text-xs text-slate-500">
                      (Termasuk 2 Helm SNI + Jas Hujan)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Aturan keterlambatan transparan (D-27): ShortRent toleransi 60 menit step-up paket jam di atasnya.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengirimkan Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <span>Konfirmasi & Buat Pesanan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. MODAL KONFIRMASI SUKSES PEMESANAN                     */}
      {/* ======================================================== */}
      {bookingSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Pemesanan Berhasil Diterima
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Terima Kasih, {bookingSuccessData.namaPenyewa}!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Pesanan Anda telah tercatat di sistem dengan nomor resmi di bawah ini:
              </p>
            </div>

            {/* Receipt Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500">Nomor Booking:</span>
                <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {bookingSuccessData.noBooking}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model Motor:</span>
                <span className="font-bold text-slate-800">{bookingSuccessData.snapshotNamaMotor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durasi:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {bookingSuccessData.pilihanDurasi.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jadwal Mulai:</span>
                <span className="font-semibold text-slate-800">{bookingSuccessData.jamTanggalMulai}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-sm">
                <span>Total Biaya:</span>
                <span className="text-emerald-700">{formatRp(bookingSuccessData.totalBiaya)}</span>
              </div>
            </div>

            {/* WA Notification Link */}
            <div className="space-y-2">
              <a
                href={`https://wa.me/6281234567890?text=Halo%20Admin%20Ryokourent,%20saya%20sudah%20melakukan%20pemesanan%20dengan%20No%20Booking:%20${bookingSuccessData.noBooking}%20atas%20nama%20${encodeURIComponent(bookingSuccessData.namaPenyewa)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Konfirmasi ke WhatsApp Admin</span>
              </a>

              <button
                type="button"
                onClick={() => setBookingSuccessData(null)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Tutup Jendela Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
