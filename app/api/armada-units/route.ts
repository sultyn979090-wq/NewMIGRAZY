import { NextResponse } from 'next/server';
import { db, armadaUnits, motorModels, lacakUnits, penyewaan } from '@/lib/db';
import { eq, asc, desc, and, or, ilike, sql } from 'drizzle-orm';

// GET /api/armada-units - Daftar unit armada fisik beserta info model dan status lacak real-time
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pool = searchParams.get('pool');
    const statusServis = searchParams.get('statusServis');
    const motorId = searchParams.get('motorId');
    const search = searchParams.get('search');

    const query = db
      .select({
        id: armadaUnits.id,
        kodeUnit: armadaUnits.kodeUnit,
        motorId: armadaUnits.motorId,
        nomorPlat: armadaUnits.nomorPlat,
        warna: armadaUnits.warna,
        poolDefault: armadaUnits.poolDefault,
        statusServis: armadaUnits.statusServis,
        kmTerakhir: armadaUnits.kmTerakhir,
        tglServisTerakhir: armadaUnits.tglServisTerakhir,
        namaBengkel: armadaUnits.namaBengkel,
        createdAt: armadaUnits.createdAt,
        // Model relation
        namaModel: motorModels.namaModel,
        kategori: motorModels.kategori,
        imageUrl: motorModels.imageUrl,
        harga1Hari: motorModels.harga1Hari,
        // Lacak relation
        lacakId: lacakUnits.id,
        statusPosisi: lacakUnits.statusPosisi,
        poolParkir: lacakUnits.poolParkir,
        lacakNamaBengkel: lacakUnits.namaBengkel,
        kontakBengkel: lacakUnits.kontakBengkel,
        estimasiSelesai: lacakUnits.estimasiSelesai,
        bookingId: lacakUnits.bookingId,
        noBooking: lacakUnits.noBooking,
        namaPenyewa: lacakUnits.namaPenyewa,
        tenggatKembali: lacakUnits.tenggatKembali,
        lacakCatatan: lacakUnits.catatan,
        lacakUpdatedAt: lacakUnits.updatedAt,
      })
      .from(armadaUnits)
      .innerJoin(motorModels, eq(armadaUnits.motorId, motorModels.id))
      .leftJoin(lacakUnits, eq(lacakUnits.unitId, armadaUnits.id))
      .orderBy(asc(armadaUnits.kodeUnit));

    const allUnits = await query;

    // Apply filtering in memory or conditional where
    let filtered: any[] = allUnits;

    if (pool && pool !== 'semua') {
      filtered = filtered.filter((u: any) => u.poolDefault?.toLowerCase() === pool.toLowerCase());
    }

    if (statusServis && statusServis !== 'semua') {
      filtered = filtered.filter((u: any) => u.statusServis?.toLowerCase() === statusServis.toLowerCase());
    }

    if (motorId && motorId !== 'semua') {
      const mId = parseInt(motorId, 10);
      filtered = filtered.filter((u: any) => u.motorId === mId);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (u: any) =>
          u.kodeUnit?.toLowerCase().includes(q) ||
          u.nomorPlat?.toLowerCase().includes(q) ||
          u.warna?.toLowerCase().includes(q) ||
          (u.namaModel && u.namaModel.toLowerCase().includes(q)) ||
          (u.namaPenyewa && u.namaPenyewa.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  } catch (error: any) {
    console.error('Error fetching armada units:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/armada-units - Mendaftarkan unit fisik baru dengan kode_unit unik (AC-01 & AC-03)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      kodeUnit,
      motorId,
      nomorPlat,
      warna,
      poolDefault = 'malang',
      statusServis = 'aktif',
      kmTerakhir = 0,
      tglServisTerakhir,
      namaBengkel,
      kontakBengkel,
      estimasiSelesai,
      catatan,
    } = body;

    // Validasi field wajib
    if (!kodeUnit || !motorId || !nomorPlat || !warna) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kode unit, Model motor, Nomor plat, dan Warna wajib diisi.',
        },
        { status: 400 }
      );
    }

    const cleanKode = kodeUnit.trim().toUpperCase();
    const cleanPlat = nomorPlat.trim().toUpperCase();
    const cleanWarna = warna.trim();
    const cleanPool = poolDefault === 'batu' ? 'batu' : 'malang';
    const cleanStatus = statusServis === 'servis' ? 'servis' : 'aktif';

    // 1. Cek keunikan kode_unit
    const existingCode = await db
      .select({ id: armadaUnits.id })
      .from(armadaUnits)
      .where(eq(armadaUnits.kodeUnit, cleanKode))
      .limit(1);

    if (existingCode.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Kode unit "${cleanKode}" sudah terdaftar. Kode unit harus unik!`,
        },
        { status: 400 }
      );
    }

    // 2. Cek apakah motor model valid
    const model = await db
      .select({ id: motorModels.id, namaModel: motorModels.namaModel })
      .from(motorModels)
      .where(eq(motorModels.id, parseInt(motorId, 10)))
      .limit(1);

    if (model.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Model motor dengan ID ${motorId} tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    // 3. Insert ke tabel armada_units
    const [newUnit] = await db
      .insert(armadaUnits)
      .values({
        kodeUnit: cleanKode,
        motorId: parseInt(motorId, 10),
        nomorPlat: cleanPlat,
        warna: cleanWarna,
        poolDefault: cleanPool,
        statusServis: cleanStatus,
        kmTerakhir: Number(kmTerakhir) || 0,
        tglServisTerakhir: tglServisTerakhir || null,
        namaBengkel: cleanStatus === 'servis' ? (namaBengkel || 'Bengkel Rekanan') : null,
      })
      .returning();

    // 4. SINKRONISASI OTOMATIS KE MODUL LACAK UNIT (AC-03 & D-26: 1 Unit Fisik = 1 Baris)
    const lacakStatusPosisi = cleanStatus === 'servis' ? 'servis' : 'parkir';
    await db.insert(lacakUnits).values({
      unitId: newUnit.id,
      kodeUnit: cleanKode,
      motorId: parseInt(motorId, 10),
      statusPosisi: lacakStatusPosisi,
      poolParkir: cleanPool,
      namaBengkel: cleanStatus === 'servis' ? (namaBengkel || 'Bengkel Rekanan') : null,
      kontakBengkel: cleanStatus === 'servis' ? (kontakBengkel || null) : null,
      estimasiSelesai: cleanStatus === 'servis' ? (estimasiSelesai || null) : null,
      catatan: catatan || `Unit baru didaftarkan ke Pool ${cleanPool.toUpperCase()}`,
      updatedBy: 'Admin (Pendaftaran Unit)',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Unit fisik ${cleanKode} berhasil didaftarkan dan tersinkronisasi ke modul lacak.`,
        data: newUnit,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating armada unit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
