<?php
/**
 * Shortcode Katalog `[ryokou_katalog]` & Form Pemesanan Publik `[ryokou_booking_form]`
 *
 * Menerapkan:
 * - D-05: Indikator stok biner tegas (`Tersedia` [Hijau] / `Habis` [Merah]) tanpa mengekspos jumlah angka stok riil.
 * - D-06: Peringatan otomatis bila jadwal ambil/kembali di luar jam operasional reguler 07.00–23.00 WIB.
 * - D-10 & D-21: Field Honeypot (`ryokou_hp_website`), Signed Time Token (`ryokou_time_token`), Pilihan Jenis ID Pendukung (tanpa NIK).
 * - D-18: Katalog menampilkan Harga 1 Hari sebagai harga utama + Cascading Dropdown (Kategori -> Durasi).
 * - D-26 & Opsi 2A: Dropdown Area/Pool Terdekat + 2 Kolom Lokasi (Alamat Pengantaran & Alamat Penjemputan).
 * - D-27: Kotak informasi `#ryokou_denda_shortrent_note` untuk aturan denda ShortRent Step-Up 60 menit & 12 Jam = Denda Harian.
 *
 * @package Ryokourent_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 1. Enqueue CSS & JS Publik beserta Data Tarif Bertingkat (`ryokouPublicVars`)
 */
function ryokourent_enqueue_public_assets() {
	$enable_frontend_css = get_option( 'ryokourent_enable_frontend_css', '1' );
	if ( '1' === $enable_frontend_css ) {
		wp_enqueue_style(
			'ryokourent-public-css',
			RYOKOURENT_PLUGIN_URL . 'assets/css/ryokourent-public.css',
			array(),
			RYOKOURENT_VERSION
		);
	}

	wp_enqueue_script(
		'ryokourent-booking-js',
		RYOKOURENT_PLUGIN_URL . 'assets/js/ryokourent-booking.js',
		array(),
		RYOKOURENT_VERSION,
		true
	);

	$motors = ryokourent_get_all_motors_with_fallback();

	$motors_pricing = array();
	foreach ( $motors as $m ) {
		$motors_pricing[ $m->ID ] = ryokourent_get_motor_tiered_pricing( $m->ID );
	}

	$issued_at  = time();
	$time_token = $issued_at . '.' . wp_hash( 'ryokou_form_time_' . $issued_at );

	wp_localize_script(
		'ryokourent-booking-js',
		'ryokouPublicVars',
		array(
			'ajax_url'       => admin_url( 'admin-ajax.php' ),
			'nonce'          => wp_create_nonce( 'ryokourent_public_booking_nonce' ),
			'time_token'     => $time_token,
			'motors_pricing' => $motors_pricing,
		)
	);
}
add_action( 'wp_enqueue_scripts', 'ryokourent_enqueue_public_assets' );

/**
 * 2. Shortcode `[ryokou_katalog]` — Menampilkan Kartu Katalog Motor Lengkap (Kategori, Spesifikasi, Fasilitas & Multi-Tier D-18)
 */
function ryokourent_render_katalog_shortcode() {
	$motors = ryokourent_get_all_motors_with_fallback();

	ob_start();
	?>
	<div class="ryokou-katalog-grid">
		<?php foreach ( $motors as $m ) : ?>
			<?php
			$pricing     = ryokourent_get_motor_tiered_pricing( $m->ID );
			$indicator   = ryokourent_get_public_stock_indicator( $m->ID );
			$fasilitas   = ! empty( $m->fasilitas ) ? $m->fasilitas : '2 Helm SNI & Jas Hujan';
			$spesifikasi = ! empty( $m->spesifikasi ) ? $m->spesifikasi : '';
			$kat_lower   = strtolower( preg_replace( '/[^a-zA-Z0-9]/', '', $m->kategori ) );
			?>
			<div class="ryokou-motor-card" data-motor-id="<?php echo esc_attr( $m->ID ); ?>">
				<div class="ryokou-card-header">
					<div>
						<span class="ryokou-cat-badge <?php echo esc_attr( $kat_lower ); ?>"><?php echo esc_html( $m->kategori ); ?></span>
						<h3 class="ryokou-motor-title" style="margin-top:6px;"><?php echo esc_html( $m->post_title ); ?></h3>
					</div>
					<span class="ryokou-indicator-badge <?php echo esc_attr( $indicator['status'] ); ?>">
						<?php echo esc_html( $indicator['label'] ); ?>
					</span>
				</div>

				<?php if ( ! empty( $spesifikasi ) ) : ?>
					<p class="ryokou-spesifikasi-text">⚙️ <?php echo esc_html( $spesifikasi ); ?></p>
				<?php endif; ?>

				<div class="ryokou-main-price-box">
					<span class="ryokou-price-label"><?php esc_html_e( 'Tarif Sewa 1 Hari (24 Jam) [Utama]:', 'ryokourent' ); ?></span>
					<strong class="ryokou-price-amount"><?php echo esc_html( $pricing['harga_utama_format'] ); ?></strong>
				</div>

				<p class="ryokou-fasilitas-text">✨ <?php echo esc_html( $fasilitas ); ?></p>
				<p class="ryokou-denda-text">⏱️ <?php echo esc_html( sprintf( __( 'Denda Terlambat / ShortRent 12 Jam: %s/jam', 'ryokourent' ), $pricing['denda_harian_format'] ) ); ?></p>

				<!-- Cascading Dropdown Simulasi Tarif di Kartu Katalog (D-18) -->
				<div class="ryokou-card-tier-selector">
					<label><?php esc_html_e( 'Cek Kategori & Paket Durasi:', 'ryokourent' ); ?></label>
					<select class="ryokou-card-cat-select" data-motor-id="<?php echo esc_attr( $m->ID ); ?>">
						<?php foreach ( $pricing['kategori'] as $cat_key => $cat_data ) : ?>
							<option value="<?php echo esc_attr( $cat_key ); ?>"><?php echo esc_html( $cat_data['label'] ); ?></option>
						<?php endforeach; ?>
					</select>
				</div>

				<a href="#ryokou-booking-section" class="ryokou-select-motor-btn" data-motor-id="<?php echo esc_attr( $m->ID ); ?>">
					<?php echo ( 'habis' === $indicator['status'] ) ? esc_html__( 'Pesan via WA (Konfirmasi Ketersediaan)', 'ryokourent' ) : esc_html__( 'Pilih Unit & Pesan Sekarang', 'ryokourent' ); ?>
				</a>
			</div>
		<?php endforeach; ?>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'ryokou_katalog', 'ryokourent_render_katalog_shortcode' );

/**
 * 3. Shortcode `[ryokou_booking_form]` — Formulir Pemesanan Publik Lengkap (Opsi 2A, D-18, D-21, D-26, D-27)
 */
function ryokourent_render_booking_form_shortcode() {
	$motors = ryokourent_get_all_motors_with_fallback();

	$issued_at  = time();
	$time_token = $issued_at . '.' . wp_hash( 'ryokou_form_time_' . $issued_at );
	$nonce      = wp_create_nonce( 'ryokourent_public_booking_nonce' );

	ob_start();
	?>
	<div id="ryokou-booking-section" class="ryokou-booking-wrapper">
		<form id="ryokou-public-booking-form" class="ryokou-booking-form" novalidate>
			<input type="hidden" id="ryokou_nonce_field" name="nonce" value="<?php echo esc_attr( $nonce ); ?>" />
			<input type="hidden" id="ryokou_time_token_field" name="ryokou_time_token" value="<?php echo esc_attr( $time_token ); ?>" />
			<input type="hidden" id="ryokou_label_durasi_input" name="label_durasi" value="1 Hari (24 Jam)" />

			<!-- Field Honeypot Anti-Bot (D-10, QA-03: Wajib tersembunyi & kosong) -->
			<div style="position:absolute;left:-9999px;top:-9999px;" aria-hidden="true">
				<label for="ryokou_hp_website">Website</label>
				<input type="text" id="ryokou_hp_website" name="ryokou_hp_website" value="" tabindex="-1" autocomplete="off" />
			</div>

			<div id="ryokou-form-error-msg" class="ryokou-error-box" style="display:none;"></div>

			<!-- Baris 1: Pilih Model Motor & Area/Pool Layanan Terdekat -->
			<div class="ryokou-form-row">
				<div class="ryokou-form-group">
					<label for="ryokou_motor_select"><?php esc_html_e( '1. Pilih Model Motor', 'ryokourent' ); ?></label>
					<select id="ryokou_motor_select" name="motor_id" required>
						<?php foreach ( $motors as $m ) : ?>
							<?php $pricing = ryokourent_get_motor_tiered_pricing( $m->ID ); ?>
							<option value="<?php echo esc_attr( $m->ID ); ?>" data-harga="<?php echo esc_attr( $pricing['harga_utama_1hari'] ); ?>">
								<?php echo esc_html( sprintf( '%s (%s) — %s/hari', $m->post_title, $m->kategori, $pricing['harga_utama_format'] ) ); ?>
							</option>
						<?php endforeach; ?>
					</select>
				</div>

				<div class="ryokou-form-group">
					<label for="ryokou_pool_select"><?php esc_html_e( '2. Area / Pool Terdekat (D-26)', 'ryokourent' ); ?></label>
					<select id="ryokou_pool_select" name="pool" required>
						<option value="malang"><?php esc_html_e( 'Pool Malang (Dinoyo — Area Kota Malang)', 'ryokourent' ); ?></option>
						<option value="batu"><?php esc_html_e( 'Pool Batu (Diponegoro — Area Kota Wisata Batu)', 'ryokourent' ); ?></option>
					</select>
				</div>
			</div>

			<!-- Indikator Stok Biner Live (D-05: Tersedia / Habis) -->
			<div id="ryokou-stock-indicator" class="ryokou-stock-box" style="display:none;">
				<span id="ryokou-indicator-badge" class="ryokou-indicator-badge tersedia"><?php esc_html_e( 'Tersedia', 'ryokourent' ); ?></span>
				<span id="ryokou-indicator-text"></span>
			</div>

			<!-- Baris 2: Cascading Dropdown Kategori Sewa & Pilihan Durasi (D-18) -->
			<div class="ryokou-form-row">
				<div class="ryokou-form-group">
					<label for="ryokou_form_category_select"><?php esc_html_e( '3. Kategori Sewa (D-18)', 'ryokourent' ); ?></label>
					<select id="ryokou_form_category_select" name="kategori_tarif">
						<option value="harian"><?php esc_html_e( 'Sewa Harian / Mingguan (1 Hari, 1 Minggu, 2 Minggu)', 'ryokourent' ); ?></option>
						<option value="jam"><?php esc_html_e( 'Sewa Jam / ShortRent (12, 9, 6, 3 Jam)', 'ryokourent' ); ?></option>
						<option value="paket"><?php esc_html_e( 'Paket Promo Khusus', 'ryokourent' ); ?></option>
						<option value="kustom"><?php esc_html_e( 'Atur Bebas (Kustom Tanggal & Jam)', 'ryokourent' ); ?></option>
					</select>
				</div>

				<div class="ryokou-form-group">
					<label for="ryokou_form_subtier_select"><?php esc_html_e( '4. Pilihan Paket Durasi & Harga', 'ryokourent' ); ?></label>
					<select id="ryokou_form_subtier_select" name="pilihan_durasi"></select>
				</div>
			</div>

			<!-- Kotak Informasi Aturan Denda ShortRent (D-27) -->
			<div id="ryokou_denda_shortrent_note" class="ryokou-shortrent-note" style="display:none;">
				<strong><?php esc_html_e( 'Ketentuan Denda ShortRent (D-27):', 'ryokourent' ); ?></strong>
				<?php esc_html_e( 'Keterlambatan pengembalian >= 60 menit otomatis masuk ke kategori paket jam di atasnya (Contoh: Sewa 3 Jam telat 60 menit masuk kategori 6 Jam; 6 Jam -> 9 Jam; 9 Jam -> 12 Jam). Khusus paket 12 Jam, denda keterlambatan sama dengan denda harian.', 'ryokourent' ); ?>
			</div>

			<!-- Baris 3: Waktu Mulai & Waktu Selesai -->
			<div class="ryokou-form-row">
				<div class="ryokou-form-group">
					<label for="ryokou_tgl_mulai"><?php esc_html_e( '5. Tanggal & Jam Mulai Sewa (WIB)', 'ryokourent' ); ?></label>
					<input type="datetime-local" id="ryokou_tgl_mulai" name="tanggal_mulai" required />
				</div>

				<div class="ryokou-form-group">
					<label for="ryokou_tgl_selesai"><?php esc_html_e( '6. Tanggal & Jam Selesai Sewa (WIB)', 'ryokourent' ); ?></label>
					<input type="datetime-local" id="ryokou_tgl_selesai" name="tanggal_selesai" required />
				</div>
			</div>

			<!-- Peringatan Jam Operasional 07.00 - 23.00 WIB (D-06) -->
			<div id="ryokou-operating-hours-warning" class="ryokou-warning-box" style="display:none;">
				<span>⚠️ <?php esc_html_e( 'Jadwal berada di luar jam operasional reguler (07.00–23.00 WIB). Pemesanan tetap dapat dikirim namun memerlukan kesepakatan ketersediaan petugas via WhatsApp.', 'ryokourent' ); ?></span>
			</div>

			<!-- Baris 4: Identitas Penyewa (Nama, WhatsApp, Status Pelanggan, & Jenis ID) -->
			<div class="ryokou-form-row">
				<div class="ryokou-form-group">
					<label for="ryokou_nama"><?php esc_html_e( '7. Nama Lengkap Penyewa (Sesuai KTP)', 'ryokourent' ); ?></label>
					<input type="text" id="ryokou_nama" name="nama" placeholder="Masukkan nama lengkap" required />
				</div>

				<div class="ryokou-form-group">
					<label for="ryokou_nomor_wa"><?php esc_html_e( '8. Nomor WhatsApp / HP Aktif', 'ryokourent' ); ?></label>
					<input type="tel" id="ryokou_nomor_wa" name="nomor_wa" placeholder="Contoh: 08123456789" required />
				</div>
			</div>

			<div class="ryokou-form-row">
				<div class="ryokou-form-group">
					<label for="ryokou_tanda_pelanggan"><?php esc_html_e( '9. Status Pelanggan', 'ryokourent' ); ?></label>
					<select id="ryokou_tanda_pelanggan" name="tanda_pelanggan">
						<option value="baru"><?php esc_html_e( 'Pelanggan Baru', 'ryokourent' ); ?></option>
						<option value="langganan"><?php esc_html_e( 'Pelanggan Langganan (Repeat Order)', 'ryokourent' ); ?></option>
					</select>
				</div>

				<div class="ryokou-form-group">
					<label for="ryokou_jenis_id"><?php esc_html_e( '10. Jenis Identitas Pendukung', 'ryokourent' ); ?></label>
					<select id="ryokou_jenis_id" name="jenis_id_pendukung" required>
						<option value="SIM_C"><?php esc_html_e( 'SIM C Aktif', 'ryokourent' ); ?></option>
						<option value="KTM"><?php esc_html_e( 'KTM (Kartu Tanda Mahasiswa)', 'ryokourent' ); ?></option>
						<option value="SIM_A"><?php esc_html_e( 'SIM A', 'ryokourent' ); ?></option>
						<option value="ID_KARYAWAN"><?php esc_html_e( 'ID Card Karyawan / Instansi', 'ryokourent' ); ?></option>
						<option value="PASPOR"><?php esc_html_e( 'Paspor', 'ryokourent' ); ?></option>
						<option value="NPWP"><?php esc_html_e( 'NPWP', 'ryokourent' ); ?></option>
						<option value="LAINNYA"><?php esc_html_e( 'Identitas Pendukung Lainnya', 'ryokourent' ); ?></option>
					</select>
				</div>
			</div>

			<!-- Baris 5: Lokasi Pengantaran & Lokasi Penjemputan Terpisah (Opsi 2A) -->
			<div class="ryokou-form-row">
				<div class="ryokou-form-group">
					<label for="ryokou_alamat_antar"><?php esc_html_e( '11. Lokasi Pengantaran / Ambil Unit', 'ryokourent' ); ?></label>
					<input type="text" id="ryokou_alamat_antar" name="alamat_pengantaran" placeholder="Contoh: Ambil di Pool Malang / Stasiun Malang Kota Baru / Nama Hotel" required />
				</div>

				<div class="ryokou-form-group">
					<label for="ryokou_alamat_jemput"><?php esc_html_e( '12. Lokasi Penjemputan / Kembali Unit', 'ryokourent' ); ?></label>
					<input type="text" id="ryokou_alamat_jemput" name="alamat_penjemputan" placeholder="Contoh: Kembali di Pool Batu / Alun-Alun Batu / Nama Hotel" required />
				</div>
			</div>

			<!-- Ringkasan Estimasi Biaya -->
			<div class="ryokou-summary-box">
				<div><span><?php esc_html_e( 'Paket / Durasi:', 'ryokourent' ); ?></span> <strong id="ryokou-display-durasi">-</strong></div>
				<div><span><?php esc_html_e( 'Skema Tarif:', 'ryokourent' ); ?></span> <strong id="ryokou-display-tarif-harian">-</strong></div>
				<div class="ryokou-summary-total"><span><?php esc_html_e( 'Estimasi Total Sewa:', 'ryokourent' ); ?></span> <strong id="ryokou-display-total">-</strong></div>
			</div>

			<button type="submit" id="ryokou-submit-btn" class="ryokou-submit-button">
				<span class="ryokou-btn-text"><?php esc_html_e( 'Lanjutkan Pemesanan via WhatsApp', 'ryokourent' ); ?></span>
			</button>
		</form>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'ryokou_booking_form', 'ryokourent_render_booking_form_shortcode' );
