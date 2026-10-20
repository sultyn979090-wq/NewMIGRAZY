// In-memory mock database store for AI Studio when Cloud SQL is not provisioned.
// Implements chainable Drizzle-compatible query methods with rich seed data.

export interface MotorModelItem {
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
  isActive: boolean;
  createdAt: Date;
}

export interface ArmadaUnitItem {
  id: number;
  kodeUnit: string;
  motorId: number;
  nomorPlat: string;
  warna: string;
  poolDefault: string;
  statusServis: string;
  kmTerakhir: number;
  tglServisTerakhir: string | null;
  namaBengkel: string | null;
  createdAt: Date;
}

export interface LacakUnitItem {
  id: number;
  unitId: number;
  kodeUnit: string;
  motorId: number;
  statusPosisi: string;
  poolParkir: string;
  namaBengkel: string | null;
  kontakBengkel: string | null;
  estimasiSelesai: string | null;
  bookingId: number | null;
  noBooking: string | null;
  namaPenyewa: string | null;
  tenggatKembali: string | null;
  catatan: string | null;
  updatedAt: Date;
  updatedBy: string;
}

export interface PenyewaanItem {
  id: number;
  noBooking: string;
  namaPenyewa: string;
  tandaPelanggan: string;
  jenisIdPendukung: string;
  poolArea: string;
  alamatPengantaran: string | null;
  alamatPenjemputan: string | null;
  motorId: number;
  unitId: number | null;
  snapshotNamaMotor: string | null;
  snapshotKodeUnit: string | null;
  jamTanggalMulai: string;
  jamTanggalSelesai: string;
  startEpoch: number;
  endEpoch: number;
  status: string;
  kategoriTarif: string;
  pilihanDurasi: string;
  totalBiaya: number;
  dendaAkhir: number;
  dendaKeterangan: string | null;
  riwayatTukarUnit: string | null;
  disewaAt: string | null;
  selesaiAt: string | null;
  luarJamOperasional: boolean;
  createdAt: Date;
}

export interface PengaturanOperasionalItem {
  id: number;
  nomorWa: string;
  bulkPricePercentage: number;
  auditLog: string | null;
  updatedAt: Date;
  updatedBy: string;
}

// Global caching for development server persistence across reloads
declare global {
  var _mockDbStore: {
    motorModels: MotorModelItem[];
    armadaUnits: ArmadaUnitItem[];
    lacakUnits: LacakUnitItem[];
    penyewaan: PenyewaanItem[];
    pengaturan: PengaturanOperasionalItem[];
    nextId: { motor: number; unit: number; lacak: number; sewa: number };
  } | undefined;
}

export function getMockStore() {
  if (!global._mockDbStore) {
    const now = new Date();
    global._mockDbStore = {
      motorModels: [
        {
          id: 1,
          namaModel: 'Honda Beat CBS 2022',
          kategori: 'Matic',
          harga1Hari: 80000,
          harga1Minggu: 480000,
          harga2Minggu: 880000,
          harga12Jam: 70000,
          harga9Jam: 65000,
          harga6Jam: 50000,
          harga3Jam: 35000,
          dendaHarianPerJam: 20000,
          fasilitas: '2 Helm SNI + Jas Hujan',
          spesifikasi: '110cc, eSP, ISS, Bagasi 12L',
          imageUrl: '',
          isActive: true,
          createdAt: now,
        },
        {
          id: 2,
          namaModel: 'Honda Vario 125 CBS-ISS',
          kategori: 'Matic',
          harga1Hari: 100000,
          harga1Minggu: 600000,
          harga2Minggu: 1100000,
          harga12Jam: 90000,
          harga9Jam: 80000,
          harga6Jam: 65000,
          harga3Jam: 45000,
          dendaHarianPerJam: 20000,
          fasilitas: '2 Helm SNI + Jas Hujan',
          spesifikasi: '125cc, eSP, ISS, Bagasi 18L',
          imageUrl: '',
          isActive: true,
          createdAt: now,
        },
        {
          id: 3,
          namaModel: 'Yamaha All New NMAX 155',
          kategori: 'Matic',
          harga1Hari: 140000,
          harga1Minggu: 840000,
          harga2Minggu: 1540000,
          harga12Jam: 125000,
          harga9Jam: 115000,
          harga6Jam: 95000,
          harga3Jam: 65000,
          dendaHarianPerJam: 25000,
          fasilitas: '2 Helm SNI + Jas Hujan',
          spesifikasi: '155cc, VVA, ABS, Bagasi 24L',
          imageUrl: '',
          isActive: true,
          createdAt: now,
        },
        {
          id: 4,
          namaModel: 'Honda Scoopy Prestige',
          kategori: 'Retro',
          harga1Hari: 95000,
          harga1Minggu: 570000,
          harga2Minggu: 1045000,
          harga12Jam: 85000,
          harga9Jam: 75000,
          harga6Jam: 60000,
          harga3Jam: 40000,
          dendaHarianPerJam: 20000,
          fasilitas: '2 Helm SNI + Jas Hujan',
          spesifikasi: '110cc, Smart Key, Charger USB',
          imageUrl: '',
          isActive: true,
          createdAt: now,
        },
      ],
      armadaUnits: [
        {
          id: 1,
          kodeUnit: 'B122',
          motorId: 1,
          nomorPlat: 'N 4521 AB',
          warna: 'Hitam',
          poolDefault: 'malang',
          statusServis: 'aktif',
          kmTerakhir: 14200,
          tglServisTerakhir: '2026-09-10',
          namaBengkel: null,
          createdAt: now,
        },
        {
          id: 2,
          kodeUnit: 'B222',
          motorId: 1,
          nomorPlat: 'N 4890 AC',
          warna: 'Merah',
          poolDefault: 'malang',
          statusServis: 'aktif',
          kmTerakhir: 9800,
          tglServisTerakhir: '2026-09-15',
          namaBengkel: null,
          createdAt: now,
        },
        {
          id: 3,
          kodeUnit: 'V123',
          motorId: 2,
          nomorPlat: 'N 3112 KL',
          warna: 'Putih Matte',
          poolDefault: 'batu',
          statusServis: 'aktif',
          kmTerakhir: 11500,
          tglServisTerakhir: '2026-09-20',
          namaBengkel: null,
          createdAt: now,
        },
        {
          id: 4,
          kodeUnit: 'V223',
          motorId: 2,
          nomorPlat: 'N 3199 KM',
          warna: 'Hitam Matte',
          poolDefault: 'malang',
          statusServis: 'servis',
          kmTerakhir: 16800,
          tglServisTerakhir: '2026-10-11',
          namaBengkel: 'AHASS Soekarno Hatta Malang',
          createdAt: now,
        },
        {
          id: 5,
          kodeUnit: 'N124',
          motorId: 3,
          nomorPlat: 'N 6012 EE',
          warna: 'Hijau Matte',
          poolDefault: 'batu',
          statusServis: 'aktif',
          kmTerakhir: 7400,
          tglServisTerakhir: '2026-09-25',
          namaBengkel: null,
          createdAt: now,
        },
        {
          id: 6,
          kodeUnit: 'S123',
          motorId: 4,
          nomorPlat: 'N 2781 AA',
          warna: 'Cream Putih',
          poolDefault: 'malang',
          statusServis: 'aktif',
          kmTerakhir: 6200,
          tglServisTerakhir: '2026-09-28',
          namaBengkel: null,
          createdAt: now,
        },
      ],
      lacakUnits: [
        {
          id: 1,
          unitId: 1,
          kodeUnit: 'B122',
          motorId: 1,
          statusPosisi: 'parkir',
          poolParkir: 'malang',
          namaBengkel: null,
          kontakBengkel: null,
          estimasiSelesai: null,
          bookingId: null,
          noBooking: null,
          namaPenyewa: null,
          tenggatKembali: null,
          catatan: 'Parkir rapi siap jalan',
          updatedAt: now,
          updatedBy: 'Operator Rian',
        },
        {
          id: 2,
          unitId: 2,
          kodeUnit: 'B222',
          motorId: 1,
          statusPosisi: 'disewa',
          poolParkir: 'malang',
          namaBengkel: null,
          kontakBengkel: null,
          estimasiSelesai: null,
          bookingId: 1,
          noBooking: 'RYK-20261011-004',
          namaPenyewa: 'Dian Pratama',
          tenggatKembali: '11 Okt 2026 15:00 WIB',
          catatan: 'Paket ShortRent 6 Jam',
          updatedAt: now,
          updatedBy: 'Operator Rian',
        },
        {
          id: 3,
          unitId: 3,
          kodeUnit: 'V123',
          motorId: 2,
          statusPosisi: 'parkir',
          poolParkir: 'batu',
          namaBengkel: null,
          kontakBengkel: null,
          estimasiSelesai: null,
          bookingId: null,
          noBooking: null,
          namaPenyewa: null,
          tenggatKembali: null,
          catatan: 'Standby pool Batu',
          updatedAt: now,
          updatedBy: 'Operator Dani',
        },
        {
          id: 4,
          unitId: 4,
          kodeUnit: 'V223',
          motorId: 2,
          statusPosisi: 'servis',
          poolParkir: 'malang',
          namaBengkel: 'AHASS Soekarno Hatta Malang',
          kontakBengkel: '0812-3344-5566 (Pak Hendra)',
          estimasiSelesai: '11 Okt 2026 16:30 WIB',
          bookingId: null,
          noBooking: null,
          namaPenyewa: null,
          tenggatKembali: null,
          catatan: 'Ganti oli & kampas rem',
          updatedAt: now,
          updatedBy: 'Operator Rian',
        },
        {
          id: 5,
          unitId: 5,
          kodeUnit: 'N124',
          motorId: 3,
          statusPosisi: 'disewa',
          poolParkir: 'batu',
          namaBengkel: null,
          kontakBengkel: null,
          estimasiSelesai: null,
          bookingId: 2,
          noBooking: 'RYK-20261011-007',
          namaPenyewa: 'Bagus Setiawan',
          tenggatKembali: '12 Okt 2026 10:00 WIB',
          catatan: 'Sewa Harian 24 Jam',
          updatedAt: now,
          updatedBy: 'Operator Dani',
        },
        {
          id: 6,
          unitId: 6,
          kodeUnit: 'S123',
          motorId: 4,
          statusPosisi: 'parkir',
          poolParkir: 'malang',
          namaBengkel: null,
          kontakBengkel: null,
          estimasiSelesai: null,
          bookingId: null,
          noBooking: null,
          namaPenyewa: null,
          tenggatKembali: null,
          catatan: 'Siap pakai',
          updatedAt: now,
          updatedBy: 'Operator Rian',
        },
      ],
      penyewaan: [
        {
          id: 1,
          noBooking: 'RYK-20261011-004',
          namaPenyewa: 'Dian Pratama',
          tandaPelanggan: 'baru',
          jenisIdPendukung: 'SIM_C',
          poolArea: 'malang',
          alamatPengantaran: 'Stasiun Kota Baru Malang',
          alamatPenjemputan: 'Stasiun Kota Baru Malang',
          motorId: 1,
          unitId: 2,
          snapshotNamaMotor: 'Honda Beat CBS 2022',
          snapshotKodeUnit: 'B222',
          jamTanggalMulai: '2026-10-11T09:00',
          jamTanggalSelesai: '2026-10-11T15:00',
          startEpoch: 1791709200,
          endEpoch: 1791730800,
          status: 'Disewa',
          kategoriTarif: 'jam',
          pilihanDurasi: '6_jam',
          totalBiaya: 50000,
          dendaAkhir: 0,
          dendaKeterangan: null,
          riwayatTukarUnit: null,
          disewaAt: '11 Okt 2026 09:00 WIB',
          selesaiAt: null,
          luarJamOperasional: false,
          createdAt: now,
        },
        {
          id: 2,
          noBooking: 'RYK-20261011-007',
          namaPenyewa: 'Bagus Setiawan',
          tandaPelanggan: 'langganan',
          jenisIdPendukung: 'SIM_A',
          poolArea: 'batu',
          alamatPengantaran: 'Hotel Golden Tulip Batu',
          alamatPenjemputan: 'Hotel Golden Tulip Batu',
          motorId: 3,
          unitId: 5,
          snapshotNamaMotor: 'Yamaha All New NMAX 155',
          snapshotKodeUnit: 'N124',
          jamTanggalMulai: '2026-10-11T10:00',
          jamTanggalSelesai: '2026-10-12T10:00',
          startEpoch: 1791712800,
          endEpoch: 1791799200,
          status: 'Disewa',
          kategoriTarif: 'harian',
          pilihanDurasi: '1_hari',
          totalBiaya: 140000,
          dendaAkhir: 0,
          dendaKeterangan: null,
          riwayatTukarUnit: null,
          disewaAt: '11 Okt 2026 10:00 WIB',
          selesaiAt: null,
          luarJamOperasional: false,
          createdAt: now,
        },
      ],
      pengaturan: [
        {
          id: 1,
          nomorWa: '6281234567890',
          bulkPricePercentage: 0,
          auditLog: 'Inisialisasi sistem Ryokourent v2',
          updatedAt: now,
          updatedBy: 'Admin',
        },
      ],
      nextId: {
        motor: 5,
        unit: 7,
        lacak: 7,
        sewa: 3,
      },
    };
  }
  return global._mockDbStore;
}

// Helper to create a chainable query builder that simulates Drizzle in memory
export function createMockDrizzleDb() {
  const store = getMockStore();

  return {
    select: (fieldsObj?: any) => {
      let targetTable: any = null;
      let joins: Array<{ table: any; on: any; type: 'left' | 'inner' }> = [];
      let whereClause: any = null;
      let orderByClause: any = null;

      const chain = {
        from: (table: any) => {
          targetTable = table;
          return chain;
        },
        leftJoin: (table: any, on: any) => {
          joins.push({ table, on, type: 'left' });
          return chain;
        },
        innerJoin: (table: any, on: any) => {
          joins.push({ table, on, type: 'inner' });
          return chain;
        },
        where: (clause: any) => {
          whereClause = clause;
          return chain;
        },
        groupBy: (..._args: any[]) => chain,
        orderBy: (...args: any[]) => {
          orderByClause = args;
          return chain;
        },
        limit: (_n: number) => chain,
        offset: (_n: number) => chain,
        then: (resolve: (data: any[]) => void, reject?: (err: any) => void) => {
          try {
            const result = executeSelect(store, targetTable, joins, whereClause, fieldsObj);
            resolve(result);
          } catch (e) {
            if (reject) reject(e);
            else resolve([]);
          }
        },
      };

      return chain;
    },

    insert: (table: any) => {
      let valuesToInsert: any = null;
      const chain = {
        values: (val: any) => {
          valuesToInsert = val;
          return chain;
        },
        returning: () => chain,
        then: (resolve: (data: any[]) => void, reject?: (err: any) => void) => {
          try {
            const inserted = executeInsert(store, table, valuesToInsert);
            resolve(inserted);
          } catch (e) {
            if (reject) reject(e);
            else resolve([]);
          }
        },
      };
      return chain;
    },

    update: (table: any) => {
      let updatePayload: any = null;
      let whereClause: any = null;
      const chain = {
        set: (payload: any) => {
          updatePayload = payload;
          return chain;
        },
        where: (clause: any) => {
          whereClause = clause;
          return chain;
        },
        returning: () => chain,
        then: (resolve: (data: any[]) => void, reject?: (err: any) => void) => {
          try {
            const updated = executeUpdate(store, table, updatePayload, whereClause);
            resolve(updated);
          } catch (e) {
            if (reject) reject(e);
            else resolve([]);
          }
        },
      };
      return chain;
    },

    delete: (table: any) => {
      let whereClause: any = null;
      const chain = {
        where: (clause: any) => {
          whereClause = clause;
          return chain;
        },
        returning: () => chain,
        then: (resolve: (data: any[]) => void, reject?: (err: any) => void) => {
          try {
            const deleted = executeDelete(store, table, whereClause);
            resolve(deleted);
          } catch (e) {
            if (reject) reject(e);
            else resolve([]);
          }
        },
      };
      return chain;
    },

    transaction: async (cb: (tx: any) => Promise<any>) => {
      // Mock transaction executes callback directly
      return await cb(createMockDrizzleDb());
    },

    execute: async (_query: any) => {
      return { rows: [] };
    },
  };
}

function getTableName(table: any): string {
  if (!table) return '';
  if (typeof table === 'string') return table;
  return table[Symbol.for('drizzle:Name')] || table._?.name || '';
}

function executeSelect(
  store: ReturnType<typeof getMockStore>,
  table: any,
  _joins: any[],
  whereClause: any,
  _fieldsObj: any
): any[] {
  const tName = getTableName(table);

  if (tName === 'motor_models') {
    return store.motorModels.map((m) => {
      const units = store.armadaUnits.filter((u) => u.motorId === m.id);
      return {
        ...m,
        totalUnits: units.length,
      };
    });
  }

  if (tName === 'armada_units') {
    let result = store.armadaUnits.map((u) => {
      const model = store.motorModels.find((m) => m.id === u.motorId);
      const lacak = store.lacakUnits.find((l) => l.unitId === u.id);
      return {
        id: u.id,
        kodeUnit: u.kodeUnit,
        motorId: u.motorId,
        nomorPlat: u.nomorPlat,
        warna: u.warna,
        poolDefault: u.poolDefault,
        statusServis: u.statusServis,
        kmTerakhir: u.kmTerakhir,
        tglServisTerakhir: u.tglServisTerakhir,
        namaBengkel: u.namaBengkel,
        createdAt: u.createdAt,
        namaModel: model?.namaModel || '',
        kategori: model?.kategori || '',
        harga1Hari: model?.harga1Hari || 0,
        lacakPosisi: lacak?.statusPosisi || 'parkir',
        lacakPool: lacak?.poolParkir || u.poolDefault,
      };
    });

    if (whereClause) {
      result = applySimpleFilter(result, whereClause);
    }
    return result;
  }

  if (tName === 'lacak_units') {
    let result = store.lacakUnits.map((l) => {
      const u = store.armadaUnits.find((unit) => unit.id === l.unitId);
      const m = store.motorModels.find((model) => model.id === l.motorId);
      return {
        ...l,
        nomorPlat: u?.nomorPlat || '',
        warna: u?.warna || '',
        poolDefault: u?.poolDefault || 'malang',
        statusServis: u?.statusServis || 'aktif',
        kmTerakhir: u?.kmTerakhir || 0,
        namaModel: m?.namaModel || '',
        kategori: m?.kategori || '',
        harga1Hari: m?.harga1Hari || 0,
      };
    });

    if (whereClause) {
      result = applySimpleFilter(result, whereClause);
    }
    return result;
  }

  if (tName === 'penyewaan') {
    let result = store.penyewaan.map((p) => {
      const m = store.motorModels.find((model) => model.id === p.motorId);
      const u = p.unitId ? store.armadaUnits.find((unit) => unit.id === p.unitId) : null;
      return {
        ...p,
        namaModel: m?.namaModel || p.snapshotNamaMotor || '',
        kategori: m?.kategori || '',
        imageUrl: m?.imageUrl || '',
        dendaHarianPerJam: m?.dendaHarianPerJam || 20000,
        unitKode: u?.kodeUnit || p.snapshotKodeUnit || null,
        unitPlat: u?.nomorPlat || null,
        unitWarna: u?.warna || null,
      };
    });

    if (whereClause) {
      result = applySimpleFilter(result, whereClause);
    }
    return result;
  }

  return [];
}

function executeInsert(
  store: ReturnType<typeof getMockStore>,
  table: any,
  payload: any
): any[] {
  const tName = getTableName(table);
  const now = new Date();

  if (tName === 'motor_models') {
    const newItem: MotorModelItem = {
      id: store.nextId.motor++,
      namaModel: payload.namaModel || '',
      kategori: payload.kategori || 'Matic',
      harga1Hari: payload.harga1Hari || 80000,
      harga1Minggu: payload.harga1Minggu || 480000,
      harga2Minggu: payload.harga2Minggu || 880000,
      harga12Jam: payload.harga12Jam || 70000,
      harga9Jam: payload.harga9Jam || 65000,
      harga6Jam: payload.harga6Jam || 50000,
      harga3Jam: payload.harga3Jam || 35000,
      dendaHarianPerJam: payload.dendaHarianPerJam || 20000,
      fasilitas: payload.fasilitas || '2 Helm SNI + Jas Hujan',
      spesifikasi: payload.spesifikasi || '',
      imageUrl: payload.imageUrl || '',
      isActive: payload.isActive !== false,
      createdAt: now,
    };
    store.motorModels.push(newItem);
    return [newItem];
  }

  if (tName === 'armada_units') {
    const newItem: ArmadaUnitItem = {
      id: store.nextId.unit++,
      kodeUnit: payload.kodeUnit || `U${store.nextId.unit}`,
      motorId: payload.motorId,
      nomorPlat: payload.nomorPlat || 'N 0000 XX',
      warna: payload.warna || 'Hitam',
      poolDefault: payload.poolDefault || 'malang',
      statusServis: payload.statusServis || 'aktif',
      kmTerakhir: payload.kmTerakhir || 0,
      tglServisTerakhir: payload.tglServisTerakhir || null,
      namaBengkel: payload.namaBengkel || null,
      createdAt: now,
    };
    store.armadaUnits.push(newItem);

    // Auto-create matching lacak unit (1 Unit Fisik = 1 Baris Aktif - D-26)
    const newLacak: LacakUnitItem = {
      id: store.nextId.lacak++,
      unitId: newItem.id,
      kodeUnit: newItem.kodeUnit,
      motorId: newItem.motorId,
      statusPosisi: 'parkir',
      poolParkir: newItem.poolDefault,
      namaBengkel: null,
      kontakBengkel: null,
      estimasiSelesai: null,
      bookingId: null,
      noBooking: null,
      namaPenyewa: null,
      tenggatKembali: null,
      catatan: 'Unit baru siap jalan',
      updatedAt: now,
      updatedBy: 'System',
    };
    store.lacakUnits.push(newLacak);

    return [newItem];
  }

  if (tName === 'lacak_units') {
    const newItem: LacakUnitItem = {
      id: store.nextId.lacak++,
      unitId: payload.unitId,
      kodeUnit: payload.kodeUnit || '',
      motorId: payload.motorId,
      statusPosisi: payload.statusPosisi || 'parkir',
      poolParkir: payload.poolParkir || 'malang',
      namaBengkel: payload.namaBengkel || null,
      kontakBengkel: payload.kontakBengkel || null,
      estimasiSelesai: payload.estimasiSelesai || null,
      bookingId: payload.bookingId || null,
      noBooking: payload.noBooking || null,
      namaPenyewa: payload.namaPenyewa || null,
      tenggatKembali: payload.tenggatKembali || null,
      catatan: payload.catatan || null,
      updatedAt: now,
      updatedBy: payload.updatedBy || 'System',
    };
    store.lacakUnits.push(newItem);
    return [newItem];
  }

  if (tName === 'penyewaan') {
    const newItem: PenyewaanItem = {
      id: store.nextId.sewa++,
      noBooking: payload.noBooking,
      namaPenyewa: payload.namaPenyewa || '',
      tandaPelanggan: payload.tandaPelanggan || 'baru',
      jenisIdPendukung: payload.jenisIdPendukung || 'SIM_C',
      poolArea: payload.poolArea || 'malang',
      alamatPengantaran: payload.alamatPengantaran || null,
      alamatPenjemputan: payload.alamatPenjemputan || null,
      motorId: payload.motorId,
      unitId: payload.unitId || null,
      snapshotNamaMotor: payload.snapshotNamaMotor || '',
      snapshotKodeUnit: payload.snapshotKodeUnit || '',
      jamTanggalMulai: payload.jamTanggalMulai,
      jamTanggalSelesai: payload.jamTanggalSelesai,
      startEpoch: payload.startEpoch || Math.floor(Date.now() / 1000),
      endEpoch: payload.endEpoch || Math.floor(Date.now() / 1000) + 86400,
      status: payload.status || 'Booking',
      kategoriTarif: payload.kategoriTarif || 'harian',
      pilihanDurasi: payload.pilihanDurasi || '1_hari',
      totalBiaya: payload.totalBiaya || 0,
      dendaAkhir: payload.dendaAkhir || 0,
      dendaKeterangan: payload.dendaKeterangan || null,
      riwayatTukarUnit: payload.riwayatTukarUnit || null,
      disewaAt: payload.disewaAt || null,
      selesaiAt: payload.selesaiAt || null,
      luarJamOperasional: Boolean(payload.luarJamOperasional),
      createdAt: now,
    };
    store.penyewaan.push(newItem);
    return [newItem];
  }

  return [payload];
}

function executeUpdate(
  store: ReturnType<typeof getMockStore>,
  table: any,
  payload: any,
  whereClause: any
): any[] {
  const tName = getTableName(table);
  const targetId = extractIdFromWhere(whereClause);

  if (tName === 'motor_models') {
    const idx = store.motorModels.findIndex((m) => targetId === undefined || m.id === targetId);
    if (idx !== -1) {
      store.motorModels[idx] = { ...store.motorModels[idx], ...payload };
      return [store.motorModels[idx]];
    }
  }

  if (tName === 'armada_units') {
    const idx = store.armadaUnits.findIndex((u) => targetId === undefined || u.id === targetId);
    if (idx !== -1) {
      store.armadaUnits[idx] = { ...store.armadaUnits[idx], ...payload };
      return [store.armadaUnits[idx]];
    }
  }

  if (tName === 'lacak_units') {
    const idx = store.lacakUnits.findIndex(
      (l) => targetId === undefined || l.id === targetId || l.unitId === targetId
    );
    if (idx !== -1) {
      store.lacakUnits[idx] = { ...store.lacakUnits[idx], ...payload, updatedAt: new Date() };
      return [store.lacakUnits[idx]];
    }
  }

  if (tName === 'penyewaan') {
    const idx = store.penyewaan.findIndex((p) => targetId === undefined || p.id === targetId);
    if (idx !== -1) {
      store.penyewaan[idx] = { ...store.penyewaan[idx], ...payload };
      return [store.penyewaan[idx]];
    }
  }

  return [payload];
}

function executeDelete(
  store: ReturnType<typeof getMockStore>,
  table: any,
  whereClause: any
): any[] {
  const tName = getTableName(table);
  const targetId = extractIdFromWhere(whereClause);

  if (tName === 'motor_models' && targetId !== undefined) {
    const idx = store.motorModels.findIndex((m) => m.id === targetId);
    if (idx !== -1) {
      return store.motorModels.splice(idx, 1);
    }
  }

  if (tName === 'armada_units' && targetId !== undefined) {
    const idx = store.armadaUnits.findIndex((u) => u.id === targetId);
    if (idx !== -1) {
      return store.armadaUnits.splice(idx, 1);
    }
  }

  if (tName === 'lacak_units' && targetId !== undefined) {
    const idx = store.lacakUnits.findIndex((l) => l.id === targetId);
    if (idx !== -1) {
      return store.lacakUnits.splice(idx, 1);
    }
  }

  return [];
}

function extractIdFromWhere(whereClause: any): number | undefined {
  if (!whereClause) return undefined;
  if (typeof whereClause === 'number') return whereClause;
  if (whereClause.value !== undefined) return Number(whereClause.value);
  if (whereClause.right?.value !== undefined) return Number(whereClause.right.value);
  return undefined;
}

function applySimpleFilter(list: any[], whereClause: any): any[] {
  if (!whereClause) return list;
  // If motorId filter
  const targetId = extractIdFromWhere(whereClause);
  if (targetId !== undefined && !isNaN(targetId)) {
    return list.filter((item) => item.motorId === targetId || item.id === targetId || item.unitId === targetId);
  }
  return list;
}
