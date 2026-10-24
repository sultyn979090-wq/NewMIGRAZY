import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import * as schema from './schema';

declare global {
  var _postgresPool: any | undefined;
  var _mockDbState: any | undefined;
}

// In-memory data store for local preview / offline fallback
const getInitialState = () => {
  const motorModels: any[] = [
    {
      id: 1,
      nama_model: 'Honda Beat CBS 2022',
      kategori: 'Matic',
      harga_1hari: 80000,
      harga_1minggu: 480000,
      harga_2minggu: 880000,
      harga_12jam: 70000,
      harga_9jam: 65000,
      harga_6jam: 50000,
      harga_3jam: 35000,
      denda_harian_per_jam: 20000,
      fasilitas: '2 Helm SNI + Jas Hujan',
      spesifikasi: '110cc eSP, Bagasi 12L, ACG Starter',
      image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=60',
      is_active: true,
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
    {
      id: 2,
      nama_model: 'Honda Vario 125 CBS-ISS',
      kategori: 'Matic',
      harga_1hari: 100000,
      harga_1minggu: 600000,
      harga_2minggu: 1100000,
      harga_12jam: 90000,
      harga_9jam: 80000,
      harga_6jam: 65000,
      harga_3jam: 45000,
      denda_harian_per_jam: 20000,
      fasilitas: '2 Helm SNI + Jas Hujan',
      spesifikasi: '125cc eSP, Smart Key, Bagasi 18L',
      image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500&auto=format&fit=crop&q=60',
      is_active: true,
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
    {
      id: 3,
      nama_model: 'Yamaha All New NMAX 155',
      kategori: 'Matic',
      harga_1hari: 140000,
      harga_1minggu: 840000,
      harga_2minggu: 1540000,
      harga_12jam: 125000,
      harga_9jam: 115000,
      harga_6jam: 95000,
      harga_3jam: 65000,
      denda_harian_per_jam: 25000,
      fasilitas: '2 Helm SNI + Jas Hujan Exclusive',
      spesifikasi: '155cc VVA, Dual Channel ABS, Sub-tank Suspension',
      image_url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=500&auto=format&fit=crop&q=60',
      is_active: true,
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
    {
      id: 4,
      nama_model: 'Honda Scoopy Prestige',
      kategori: 'Retro',
      harga_1hari: 90000,
      harga_1minggu: 540000,
      harga_2minggu: 990000,
      harga_12jam: 75000,
      harga_9jam: 70000,
      harga_6jam: 55000,
      harga_3jam: 40000,
      denda_harian_per_jam: 20000,
      fasilitas: '2 Helm SNI Retro + Jas Hujan',
      spesifikasi: '110cc eSP, Smart Key, USB Charger',
      image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=60',
      is_active: true,
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
  ];

  const armadaUnits: any[] = [
    {
      id: 1,
      kode_unit: 'B122',
      motor_id: 1,
      nomor_plat: 'N 4521 AB',
      warna: 'Hitam',
      pool_default: 'malang',
      status_servis: 'aktif',
      km_terakhir: 12450,
      tgl_servis_terakhir: '2026-09-15',
      nama_bengkel: 'AHASS Dinoyo',
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
    {
      id: 2,
      kode_unit: 'B222',
      motor_id: 1,
      nomor_plat: 'N 4890 AC',
      warna: 'Merah',
      pool_default: 'malang',
      status_servis: 'aktif',
      km_terakhir: 15200,
      tgl_servis_terakhir: '2026-09-20',
      nama_bengkel: 'AHASS Dinoyo',
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
    {
      id: 3,
      kode_unit: 'V123',
      motor_id: 2,
      nomor_plat: 'N 3112 KL',
      warna: 'Putih Matte',
      pool_default: 'batu',
      status_servis: 'aktif',
      km_terakhir: 9800,
      tgl_servis_terakhir: '2026-09-10',
      nama_bengkel: 'AHASS Batu',
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
    {
      id: 4,
      kode_unit: 'V223',
      motor_id: 2,
      nomor_plat: 'N 3199 KM',
      warna: 'Hitam Matte',
      pool_default: 'malang',
      status_servis: 'servis',
      km_terakhir: 21400,
      tgl_servis_terakhir: '2026-10-11',
      nama_bengkel: 'AHASS Soekarno Hatta Malang',
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
    {
      id: 5,
      kode_unit: 'N124',
      motor_id: 3,
      nomor_plat: 'N 6012 EE',
      warna: 'Hijau Matte',
      pool_default: 'batu',
      status_servis: 'aktif',
      km_terakhir: 11200,
      tgl_servis_terakhir: '2026-09-28',
      nama_bengkel: 'Yamaha Sentral Malang',
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
    {
      id: 6,
      kode_unit: 'S123',
      motor_id: 4,
      nomor_plat: 'N 2781 AA',
      warna: 'Cream Putih',
      pool_default: 'malang',
      status_servis: 'aktif',
      km_terakhir: 8500,
      tgl_servis_terakhir: '2026-10-01',
      nama_bengkel: 'AHASS Dinoyo',
      created_at: new Date('2026-10-01T08:00:00Z'),
    },
  ];

  const lacakUnits: any[] = [
    {
      id: 1,
      unit_id: 1,
      kode_unit: 'B122',
      motor_id: 1,
      status_posisi: 'parkir',
      pool_parkir: 'malang',
      nama_bengkel: '',
      kontak_bengkel: '',
      estimasi_selesai: '',
      booking_id: null,
      no_booking: '',
      nama_penyewa: '',
      tenggat_kembali: '',
      catatan: 'Parkir siap sewa di Dinoyo Malang',
      updated_at: new Date(),
      updated_by: 'Operator Rian',
    },
    {
      id: 2,
      unit_id: 2,
      kode_unit: 'B222',
      motor_id: 1,
      status_posisi: 'disewa',
      pool_parkir: 'malang',
      nama_bengkel: '',
      kontak_bengkel: '',
      estimasi_selesai: '',
      booking_id: 1,
      no_booking: 'RYK-20261011-004',
      nama_penyewa: 'Dian Pratama',
      tenggatKembali: '11 Okt 2026 15:00 WIB',
      tenggat_kembali: '11 Okt 2026 15:00 WIB',
      catatan: 'Disewa paket shortrent 6 jam',
      updated_at: new Date(),
      updated_by: 'Operator Rian',
    },
    {
      id: 3,
      unit_id: 3,
      kode_unit: 'V123',
      motor_id: 2,
      status_posisi: 'parkir',
      pool_parkir: 'batu',
      nama_bengkel: '',
      kontak_bengkel: '',
      estimasi_selesai: '',
      booking_id: null,
      no_booking: '',
      nama_penyewa: '',
      tenggat_kembali: '',
      catatan: 'Parkir siap sewa di Pool Batu',
      updated_at: new Date(),
      updated_by: 'Operator Dani',
    },
    {
      id: 4,
      unit_id: 4,
      kode_unit: 'V223',
      motor_id: 2,
      status_posisi: 'servis',
      pool_parkir: 'malang',
      nama_bengkel: 'AHASS Soekarno Hatta Malang',
      kontak_bengkel: '0812-3344-5566 (Pak Hendra)',
      estimasi_selesai: '11 Okt 2026 16:30 WIB',
      booking_id: null,
      no_booking: '',
      nama_penyewa: '',
      tenggat_kembali: '',
      catatan: 'Servis rutin & penggantian oli mesin',
      updated_at: new Date(),
      updated_by: 'Operator Rian',
    },
    {
      id: 5,
      unit_id: 5,
      kode_unit: 'N124',
      motor_id: 3,
      status_posisi: 'disewa',
      pool_parkir: 'batu',
      nama_bengkel: '',
      kontak_bengkel: '',
      estimasi_selesai: '',
      booking_id: 2,
      no_booking: 'RYK-20261011-007',
      nama_penyewa: 'Bagus Setiawan',
      tenggat_kembali: '12 Okt 2026 10:00 WIB',
      catatan: 'Sewa harian 24 jam eksplor wisata Batu',
      updated_at: new Date(),
      updated_by: 'Operator Dani',
    },
    {
      id: 6,
      unit_id: 6,
      kode_unit: 'S123',
      motor_id: 4,
      status_posisi: 'parkir',
      pool_parkir: 'malang',
      nama_bengkel: '',
      kontak_bengkel: '',
      estimasi_selesai: '',
      booking_id: null,
      no_booking: '',
      nama_penyewa: '',
      tenggat_kembali: '',
      catatan: 'Parkir siap sewa di Pool Malang',
      updated_at: new Date(),
      updated_by: 'Operator Rian',
    },
  ];

  const nowEpoch = Math.floor(Date.now() / 1000);

  const penyewaan: any[] = [
    {
      id: 1,
      no_booking: 'RYK-20261011-004',
      nama_penyewa: 'Dian Pratama',
      tanda_pelanggan: 'langganan',
      jenis_id_pendukung: 'SIM_C',
      pool_area: 'malang',
      alamat_pengantaran: 'Stasiun Kota Baru Malang',
      alamat_penjemputan: 'Stasiun Kota Baru Malang',
      motor_id: 1,
      unit_id: 2,
      snapshot_nama_motor: 'Honda Beat CBS 2022',
      snapshot_kode_unit: 'B222',
      jam_tanggal_mulai: '2026-10-11 09:00',
      jam_tanggal_selesai: '2026-10-11 15:00',
      start_epoch: nowEpoch - 10800,
      end_epoch: nowEpoch + 10800,
      status: 'Disewa',
      kategori_tarif: 'jam',
      pilihan_durasi: '6_jam',
      total_biaya: 50000,
      denda_akhir: 0,
      denda_keterangan: '',
      riwayat_tukar_unit: '',
      disewa_at: '2026-10-11 09:00 WIB',
      selesai_at: '',
      luar_jam_operasional: false,
      created_at: new Date('2026-10-11T02:00:00Z'),
    },
    {
      id: 2,
      no_booking: 'RYK-20261011-007',
      nama_penyewa: 'Bagus Setiawan',
      tanda_pelanggan: 'baru',
      jenis_id_pendukung: 'KTM',
      pool_area: 'batu',
      alamat_pengantaran: 'Alun-alun Wisata Batu',
      alamat_penjemputan: 'Alun-alun Wisata Batu',
      motor_id: 3,
      unit_id: 5,
      snapshot_nama_motor: 'Yamaha All New NMAX 155',
      snapshot_kode_unit: 'N124',
      jam_tanggal_mulai: '2026-10-11 10:00',
      jam_tanggal_selesai: '2026-10-12 10:00',
      start_epoch: nowEpoch - 7200,
      end_epoch: nowEpoch + 79200,
      status: 'Disewa',
      kategori_tarif: 'harian',
      pilihan_durasi: '1_hari',
      total_biaya: 140000,
      denda_akhir: 0,
      denda_keterangan: '',
      riwayat_tukar_unit: '',
      disewa_at: '2026-10-11 10:00 WIB',
      selesai_at: '',
      luar_jam_operasional: false,
      created_at: new Date('2026-10-11T03:00:00Z'),
    },
    {
      id: 3,
      no_booking: 'RYK-20261011-010',
      nama_penyewa: 'Siti Rahmawati',
      tanda_pelanggan: 'baru',
      jenis_id_pendukung: 'SIM_C',
      pool_area: 'malang',
      alamat_pengantaran: 'Terminal Arjosari Malang',
      alamat_penjemputan: 'Terminal Arjosari Malang',
      motor_id: 2,
      unit_id: null,
      snapshot_nama_motor: 'Honda Vario 125 CBS-ISS',
      snapshot_kode_unit: '',
      jam_tanggal_mulai: '2026-10-12 08:00',
      jam_tanggal_selesai: '2026-10-13 08:00',
      start_epoch: nowEpoch + 86400,
      end_epoch: nowEpoch + 172800,
      status: 'Booking',
      kategori_tarif: 'harian',
      pilihan_durasi: '1_hari',
      total_biaya: 100000,
      denda_akhir: 0,
      denda_keterangan: '',
      riwayat_tukar_unit: '',
      disewa_at: '',
      selesai_at: '',
      luar_jam_operasional: false,
      created_at: new Date('2026-10-11T04:00:00Z'),
    },
  ];

  const pengaturanOperasional: any[] = [
    {
      id: 1,
      nomor_wa: '6281234567890',
      bulk_price_percentage: 0,
      audit_log: 'Inisialisasi sistem Ryokourent v2',
      updated_at: new Date(),
      updated_by: 'Admin',
    },
  ];

  return {
    motor_models: motorModels,
    armada_units: armadaUnits,
    lacak_units: lacakUnits,
    penyewaan,
    pengaturan_operasional: pengaturanOperasional,
    users: [],
  };
};

if (!global._mockDbState) {
  global._mockDbState = getInitialState();
}

const mockState = global._mockDbState;

// Helper to parse columns from select clause
function parseSelectColumns(colsStr: string): string[] {
  const parts: string[] = [];
  let current = '';
  let parenDepth = 0;
  for (let i = 0; i < colsStr.length; i++) {
    const char = colsStr[i];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;
    else if (char === ',' && parenDepth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function getColumnValue(row: any, colExpr: string): any {
  if (/count\(/i.test(colExpr)) {
    return row._count ?? row.totalUnits ?? 0;
  }

  // Handle table.column or column
  const m = colExpr.match(/"([^"]+)"$/);
  const colName = m ? m[1] : colExpr.replace(/['"]/g, '');

  // Try direct snake_case, then camelCase
  if (row[colName] !== undefined) return row[colName];
  const camel = colName.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());
  if (row[camel] !== undefined) return row[camel];

  // Try table prefix if qualified e.g. motor_models.id
  const fullMatch = colExpr.match(/"?(\w+)"?\."?(\w+)"?/);
  if (fullMatch) {
    const field = fullMatch[2];
    if (row[field] !== undefined) return row[field];
    const fieldCamel = field.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());
    if (row[fieldCamel] !== undefined) return row[fieldCamel];
  }

  return null;
}

// In-Memory Query Engine
async function executeMockQuery(queryTextOrConfig: any, valuesArg?: any[]) {
  const text = (typeof queryTextOrConfig === 'string' ? queryTextOrConfig : queryTextOrConfig.text).trim();
  const values = valuesArg || (queryTextOrConfig && typeof queryTextOrConfig === 'object' ? queryTextOrConfig.values : []) || [];

  // --- 1. SELECT QUERIES ---
  if (/^select/i.test(text)) {
    const fromMatch = text.match(/from\s+"?(\w+)"?/i);
    const tableName = fromMatch ? fromMatch[1] : 'motor_models';

    const colMatch = text.match(/^select\s+(.+?)\s+from\s/i);
    const cols = colMatch ? parseSelectColumns(colMatch[1]) : [];

    let combinedRows: any[] = [];

    if (tableName === 'motor_models') {
      combinedRows = mockState.motor_models.map((m: any) => {
        const unitsCount = mockState.armada_units.filter((u: any) => u.motor_id === m.id).length;
        return {
          ...m,
          _count: unitsCount,
          totalUnits: unitsCount,
        };
      });
    } else if (tableName === 'armada_units') {
      combinedRows = mockState.armada_units.map((u: any) => {
        const model = mockState.motor_models.find((m: any) => m.id === u.motor_id) || {};
        const lacak = mockState.lacak_units.find((l: any) => l.unit_id === u.id) || {};
        return {
          ...u,
          nama_model: model.nama_model,
          kategori: model.kategori,
          image_url: model.image_url,
          harga_1hari: model.harga_1hari,
          lacak_id: lacak.id,
          status_posisi: lacak.status_posisi || 'parkir',
          pool_parkir: lacak.pool_parkir || u.pool_default,
          nama_bengkel: lacak.nama_bengkel || u.nama_bengkel,
          kontak_bengkel: lacak.kontak_bengkel || '',
          estimasi_selesai: lacak.estimasi_selesai || '',
          booking_id: lacak.booking_id,
          no_booking: lacak.no_booking,
          nama_penyewa: lacak.nama_penyewa,
          tenggat_kembali: lacak.tenggat_kembali,
          catatan: lacak.catatan,
          updated_at: lacak.updated_at || u.created_at,
        };
      });
    } else if (tableName === 'lacak_units') {
      combinedRows = mockState.lacak_units.map((l: any) => {
        const unit = mockState.armada_units.find((u: any) => u.id === l.unit_id) || {};
        const model = mockState.motor_models.find((m: any) => m.id === (l.motor_id || unit.motor_id)) || {};
        return {
          ...l,
          nomor_plat: unit.nomor_plat,
          warna: unit.warna,
          pool_default: unit.pool_default,
          status_servis: unit.status_servis,
          km_terakhir: unit.km_terakhir,
          nama_model: model.nama_model,
          kategori: model.kategori,
          harga_1hari: model.harga_1hari,
        };
      });
    } else if (tableName === 'penyewaan') {
      combinedRows = mockState.penyewaan.map((p: any) => {
        const model = mockState.motor_models.find((m: any) => m.id === p.motor_id) || {};
        const unit = mockState.armada_units.find((u: any) => u.id === p.unit_id) || {};
        return {
          ...p,
          nama_model: model.nama_model,
          kategori: model.kategori,
          image_url: model.image_url,
          denda_harian_per_jam: model.denda_harian_per_jam,
          kode_unit: unit.kode_unit || p.snapshot_kode_unit,
          nomor_plat: unit.nomor_plat,
          warna: unit.warna,
        };
      });
    } else if (tableName === 'pengaturan_operasional') {
      combinedRows = [...mockState.pengaturan_operasional];
    }

    // Handle WHERE filters if present
    if (/where/i.test(text)) {
      // Check for id = $1
      const idMatch = text.match(/where\s+(?:"?\w+"?\.)?"?id"?\s*=\s*\$(\d+)/i);
      if (idMatch) {
        const paramIndex = parseInt(idMatch[1], 10) - 1;
        const targetId = Number(values[paramIndex]);
        combinedRows = combinedRows.filter((r: any) => r.id === targetId);
      }
      // Check for motorId = $X
      const motorIdMatch = text.match(/(?:"?\w+"?\.)?"?motor_id"?\s*=\s*\$(\d+)/i);
      if (motorIdMatch) {
        const paramIndex = parseInt(motorIdMatch[1], 10) - 1;
        const targetMotorId = Number(values[paramIndex]);
        combinedRows = combinedRows.filter((r: any) => r.motor_id === targetMotorId);
      }
    }

    // Sort order
    if (/order by/i.test(text)) {
      if (/desc/i.test(text)) {
        combinedRows.sort((a, b) => (b.id || 0) - (a.id || 0));
      } else {
        combinedRows.sort((a, b) => (a.id || 0) - (b.id || 0));
      }
    }

    // Limit
    const limitMatch = text.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const lim = parseInt(limitMatch[1], 10);
      combinedRows = combinedRows.slice(0, lim);
    }

    // Drizzle expects array of values per row when rowMode === 'array'
    const rows = combinedRows.map((row) => {
      return cols.map((col) => getColumnValue(row, col));
    });

    return { rows, command: 'SELECT', rowCount: rows.length };
  }

  // --- 2. INSERT QUERIES ---
  if (/^insert into/i.test(text)) {
    const tableMatch = text.match(/insert into\s+"?(\w+)"?\s*\((.+?)\)\s*values/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const colNames: string[] = tableMatch[2].split(',').map((c: string): string => c.trim().replace(/['"]/g, ''));

      const newRecord: any = {};
      colNames.forEach((col: string, idx: number) => {
        newRecord[col] = values[idx] !== undefined ? values[idx] : null;
      });

      const tableArray = mockState[tableName] || [];
      const newId = tableArray.length > 0 ? Math.max(...tableArray.map((r: any) => r.id || 0)) + 1 : 1;
      newRecord.id = newId;
      if (!newRecord.created_at) newRecord.created_at = new Date();
      if (!newRecord.updated_at) newRecord.updated_at = new Date();

      tableArray.push(newRecord);
      mockState[tableName] = tableArray;

      // Check RETURNING clause
      const retMatch = text.match(/returning\s+(.+)$/i);
      if (retMatch) {
        const retCols = parseSelectColumns(retMatch[1]);
        const row = retCols.map((c: string) => getColumnValue(newRecord, c));
        return { rows: [row], command: 'INSERT', rowCount: 1 };
      }

      return { rows: [[newId]], command: 'INSERT', rowCount: 1 };
    }
  }

  // --- 3. UPDATE QUERIES ---
  if (/^update/i.test(text)) {
    const tableMatch = text.match(/update\s+"?(\w+)"?\s*set\s+(.+?)\s+where\s+(.+)$/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const setClause = tableMatch[2];
      const whereClause = tableMatch[3];

      const setAssignments: string[] = setClause.split(',').map((s: string): string => s.trim());
      const updates: Record<string, any> = {};

      setAssignments.forEach((assign: string) => {
        const m = assign.match(/"?(\w+)"?\s*=\s*\$(\d+)/);
        if (m) {
          const colName = m[1];
          const valIdx = parseInt(m[2], 10) - 1;
          updates[colName] = values[valIdx];
        }
      });

      // Find target record in where clause
      let targetId: number | null = null;
      const idMatch = whereClause.match(/(?:"?\w+"?\.)?"?id"?\s*=\s*\$(\d+)/i);
      if (idMatch) {
        const valIdx = parseInt(idMatch[1], 10) - 1;
        targetId = Number(values[valIdx]);
      }

      // Or unit_id = $X
      let unitId: number | null = null;
      const unitIdMatch = whereClause.match(/(?:"?\w+"?\.)?"?unit_id"?\s*=\s*\$(\d+)/i);
      if (unitIdMatch) {
        const valIdx = parseInt(unitIdMatch[1], 10) - 1;
        unitId = Number(values[valIdx]);
      }

      const tableArray = mockState[tableName] || [];
      const updatedRows: any[] = [];

      tableArray.forEach((r: any) => {
        const match = targetId !== null ? r.id === targetId : unitId !== null ? r.unit_id === unitId : false;
        if (match) {
          Object.assign(r, updates);
          r.updated_at = new Date();
          updatedRows.push(r);
        }
      });

      // Check RETURNING
      const retMatch = text.match(/returning\s+(.+)$/i);
      if (retMatch && updatedRows.length > 0) {
        const retCols = parseSelectColumns(retMatch[1]);
        const rows = updatedRows.map((r: any) => retCols.map((c: string) => getColumnValue(r, c)));
        return { rows, command: 'UPDATE', rowCount: updatedRows.length };
      }

      return { rows: [], command: 'UPDATE', rowCount: updatedRows.length };
    }
  }

  // --- 4. DELETE QUERIES ---
  if (/^delete from/i.test(text)) {
    const tableMatch = text.match(/delete from\s+"?(\w+)"?\s*where\s+(.+)$/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const whereClause = tableMatch[2];

      let targetId: number | null = null;
      const idMatch = whereClause.match(/(?:"?\w+"?\.)?"?id"?\s*=\s*\$(\d+)/i);
      if (idMatch) {
        const valIdx = parseInt(idMatch[1], 10) - 1;
        targetId = Number(values[valIdx]);
      }

      let unitId: number | null = null;
      const unitIdMatch = whereClause.match(/(?:"?\w+"?\.)?"?unit_id"?\s*=\s*\$(\d+)/i);
      if (unitIdMatch) {
        const valIdx = parseInt(unitIdMatch[1], 10) - 1;
        unitId = Number(values[valIdx]);
      }

      if (mockState[tableName]) {
        mockState[tableName] = mockState[tableName].filter((r: any) => {
          if (targetId !== null && r.id === targetId) return false;
          if (unitId !== null && r.unit_id === unitId) return false;
          return true;
        });
      }

      return { rows: [], command: 'DELETE', rowCount: 1 };
    }
  }

  return { rows: [], command: 'SELECT', rowCount: 0 };
}

// Create Mock Pool Object
export const createMockPool = () => ({
  query: async (queryTextOrConfig: any, values?: any[]) => {
    return executeMockQuery(queryTextOrConfig, values);
  },
  connect: async () => ({
    query: async (queryTextOrConfig: any, values?: any[]) => executeMockQuery(queryTextOrConfig, values),
    release: () => {},
  }),
  on: () => {},
  end: async () => {},
});

function isSocketAvailable(hostOrUrl?: string): boolean {
  if (!hostOrUrl) return false;
  try {
    if (hostOrUrl.startsWith('/')) {
      return fs.existsSync(hostOrUrl);
    }
    const match = hostOrUrl.match(/host=([^&]+)/);
    if (match && match[1].startsWith('/')) {
      return fs.existsSync(match[1]);
    }
  } catch {
    return false;
  }
  return true;
}

// Function to create or retrieve the connection pool
export const createPool = () => {
  const hasDbConfig = Boolean(process.env.SQL_HOST || process.env.DATABASE_URL);
  const hasValidSocketOrTcp =
    (process.env.SQL_HOST && isSocketAvailable(process.env.SQL_HOST)) ||
    (process.env.DATABASE_URL && isSocketAvailable(process.env.DATABASE_URL));

  // Enforce DB credentials strictly in production when STRICT_PROD_DB=true.
  // During build time or preview, allow fallback mock pool so builds and preview workbench remain fully functional.
  const isStrictProduction =
    process.env.NODE_ENV === 'production' &&
    process.env.STRICT_PROD_DB === 'true' &&
    process.env.NEXT_PHASE !== 'phase-production-build';

  if (!hasDbConfig || !hasValidSocketOrTcp) {
    if (isStrictProduction && hasDbConfig && !hasValidSocketOrTcp) {
      throw new Error(
        '[Database Error] Database Unix socket configured in SQL_HOST/DATABASE_URL is not mounted on disk in strict production mode.'
      );
    }
    if (isStrictProduction && !hasDbConfig) {
      throw new Error(
        '[Database Error] Database credentials not configured in production environment (missing SQL_HOST or DATABASE_URL). Refusing silent fallback to in-memory store.'
      );
    }
    if (!global._postgresPool) {
      console.log('[AI Studio] PostgreSQL credentials or Cloud SQL socket not active on disk — using in-memory mock store');
      global._postgresPool = createMockPool();
    }
    return global._postgresPool;
  }

  if (!global._postgresPool) {
    try {
      const poolConfig: any = process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            max: 10,
            connectionTimeoutMillis: 5000,
          }
        : {
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DB_NAME,
            max: 10,
            connectionTimeoutMillis: 5000,
          };

      if (process.env.NODE_ENV === 'production' && !process.env.DISABLE_DB_SSL) {
        poolConfig.ssl = { rejectUnauthorized: false };
      }

      global._postgresPool = new Pool(poolConfig);

      global._postgresPool.on('error', (err: any) => {
        console.error('Unexpected error on idle SQL pool client:', err);
      });
    } catch (e) {
      if (isStrictProduction) {
        throw new Error(`[Database Error] Failed to initialize PostgreSQL Pool: ${(e as any)?.message}`);
      }
      console.warn('[AI Studio] Failed to initialize Pool — falling back to in-memory mock', e);
      global._postgresPool = createMockPool();
    }
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance
const pool = createPool();

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool as any, { schema });
