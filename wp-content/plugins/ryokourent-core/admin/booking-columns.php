<?php
/**
 * Kolom Admin Penyewaan, Aksi Cepat State Machine 4 Status, & Halaman Pengaturan Operasional (Nomor WA + Bulk Pricing)
 *
 * Menerapkan:
 * - D-04: Tombol aksi langsung di tabel `penyewaan`:
 *   1) `Approve & Kunci Unit` (memilih unit global beserta info posisi parkirnya dari `ryokou_lacak`)
 *   2) `Serah Terima (Mulai Sewa)`
 *   3) `Tukar Unit` (`D-19`)
 *   4) `Selesai & Hitung Denda` (`D-27`)
 *   5) `Reject / Cancel` 2 langkah (`D-20`)
 * - D-22 & D-23 (Opsi 1B): Submenu `Pengaturan & Bulk Tarif` di bawah menu Penyewaan untuk:
 *   a) Ganti Nomor WhatsApp Admin beserta Audit Log (mencatat user & waktu WIB).
 *   b) Penyesuaian Harga Massal (*Bulk Price Adjustment*) `-50%` s/d `+200%` (pembulatan ke ribuan terdekat).
 *
 * @package Ryokourent_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 1. Definisi Kolom Tabel Admin CPT `penyewaan`
 */
function ryokourent_booking_admin_columns( $columns ) {
	return array(
		'cb'             => '<input type="checkbox" />',
		'no_booking'     => __( 'No. Booking & Penyewa', 'ryokourent' ),
		'motor_dan_unit' => __( 'Model & Kode Unit', 'ryokourent' ),
		'jadwal_durasi'  => __( 'Jadwal & Kategori Durasi', 'ryokourent' ),
		'lokasi_pool'    => __( 'Pool & Lokasi Antar/Jemput', 'ryokourent' ),
		'status_denda'   => __( 'Status & Kalkulasi Denda (D-27)', 'ryokourent' ),
		'aksi_operator'  => __( 'Tindakan State Machine (D-04)', 'ryokourent' ),
	);
}
add_filter( 'manage_penyewaan_posts_columns', 'ryokourent_booking_admin_columns' );

/**
 * 2. Render Isi Kolom Tabel Admin CPT `penyewaan`
 */
function ryokourent_booking_render_columns( $column, $post_id ) {
	$post       = get_post( $post_id );
	$status     = $post->post_status;
	$no_booking = get_post_meta( $post_id, '_ryokou_no_booking', true );
	$nama       = get_post_meta( $post_id, '_ryokou_nama', true );
	$nomor_wa   = get_post_meta( $post_id, '_ryokou_nomor_wa', true );
	$jenis_id   = get_post_meta( $post_id, '_ryokou_jenis_id_pendukung', true );
	$tanda      = get_post_meta( $post_id, '_ryokou_tanda_pelanggan', true );
	$motor_id   = absint( get_post_meta( $post_id, '_ryokou_motor_id', true ) );
	$motor_nama = get_post_meta( $post_id, '_ryokou_snapshot_nama_motor', true );
	$unit_id    = absint( get_post_meta( $post_id, '_ryokou_unit_id', true ) );
	$kode_unit  = get_post_meta( $post_id, '_ryokou_snapshot_kode_unit', true );
	$mulai      = get_post_meta( $post_id, '_ryokou_jam_tanggal_mulai', true );
	$selesai    = get_post_meta( $post_id, '_ryokou_jam_tanggal_selesai', true );
	$durasi_lbl = get_post_meta( $post_id, '_ryokou_label_durasi', true );
	$total_est  = absint( get_post_meta( $post_id, '_ryokou_total_harga_estimasi', true ) );

	switch ( $column ) {
		case 'no_booking':
			echo '<strong><a href="' . esc_url( get_edit_post_link( $post_id ) ) . '">' . esc_html( $no_booking ? $no_booking : '#' . $post_id ) . '</a></strong>';
			echo '<br>' . esc_html( $nama ) . ' <small style="color:#475569;">(ID: ' . esc_html( $jenis_id ? $jenis_id : 'SIM_C' ) . ')</small>';
			if ( $nomor_wa ) {
				echo '<br><small style="color:#0f766e;font-weight:600;">📱 ' . esc_html( $nomor_wa ) . '</small>';
			}
			if ( $tanda ) {
				$tanda_bg = ( 'langganan' === $tanda ) ? '#dbeafe' : '#f1f5f9';
				$tanda_fg = ( 'langganan' === $tanda ) ? '#1e40af' : '#334155';
				$tanda_tx = ( 'langganan' === $tanda ) ? 'Langganan' : 'Baru';
				echo '<br><span style="font-size:11px;padding:1px 6px;border-radius:3px;background:' . $tanda_bg . ';color:' . $tanda_fg . ';font-weight:600;">' . esc_html( $tanda_tx ) . '</span>';
			}
			break;

		case 'motor_dan_unit':
			echo '<strong>' . esc_html( $motor_nama ? $motor_nama : get_the_title( $motor_id ) ) . '</strong><br>';
			if ( $unit_id && $kode_unit ) {
				$track = ryokourent_get_unit_tracking_summary( $unit_id );
				echo '<span style="color:#0f766e;font-weight:700;">Unit: ' . esc_html( $kode_unit ) . '</span>';
				echo '<br><small style="color:#64748b;">' . esc_html( $track['label_ringkas'] ) . '</small>';
			} else {
				echo '<span style="color:#b45309;font-size:12px;">Belum dikunci unit</span>';
			}
			break;

		case 'jadwal_durasi':
			echo '<strong>' . esc_html( $durasi_lbl ? $durasi_lbl : '1 Hari' ) . '</strong> — Rp ' . esc_html( number_format( $total_est, 0, ',', '.' ) ) . '<br>';
			echo '<small>' . esc_html( $mulai ) . ' s/d ' . esc_html( $selesai ) . ' WIB</small>';
			if ( '1' === (string) get_post_meta( $post_id, '_ryokou_luar_jam_operasional', true ) ) {
				echo '<br><span style="color:#b45309;font-size:11px;font-weight:600;">⚠️ Luar Jam Reguler (07:00-23:00 WIB)</span>';
			}
			break;

		case 'lokasi_pool':
			$pool          = get_post_meta( $post_id, '_ryokou_pool', true );
			$pool_label    = ( 'batu' === $pool ) ? 'Pool Batu' : 'Pool Malang';
			$alamat_antar  = get_post_meta( $post_id, '_ryokou_alamat_pengantaran', true );
			$alamat_jemput = get_post_meta( $post_id, '_ryokou_alamat_penjemputan', true );
			echo '<strong>' . esc_html( $pool_label ) . '</strong><br>';
			echo '<small><strong>Antar:</strong> ' . esc_html( $alamat_antar ? $alamat_antar : '-' ) . '</small><br>';
			echo '<small><strong>Jemput:</strong> ' . esc_html( $alamat_jemput ? $alamat_jemput : '-' ) . '</small>';
			break;

		case 'status_denda':
			$badges = array(
				'ryokou_booking'  => array( 'bg' => '#fef3c7', 'fg' => '#92400e', 'txt' => '1. Booking (Baru)' ),
				'ryokou_approved' => array( 'bg' => '#e0e7ff', 'fg' => '#1e40af', 'txt' => '2. Approve Booking' ),
				'ryokou_disewa'   => array( 'bg' => '#dcfce7', 'fg' => '#166534', 'txt' => '3. Sedang Disewa' ),
				'ryokou_selesai'  => array( 'bg' => '#f1f5f9', 'fg' => '#334155', 'txt' => '4. Selesai' ),
			);
			$b = isset( $badges[ $status ] ) ? $badges[ $status ] : array( 'bg' => '#f1f5f9', 'fg' => '#475569', 'txt' => $status );
			echo '<span style="display:inline-block;padding:3px 8px;border-radius:4px;background:' . esc_attr( $b['bg'] ) . ';color:' . esc_attr( $b['fg'] ) . ';font-weight:700;font-size:12px;">' . esc_html( $b['txt'] ) . '</span>';

			if ( in_array( $status, array( 'ryokou_disewa', 'ryokou_selesai' ), true ) ) {
				$denda = ryokourent_calculate_overtime_penalty( $post_id );
				echo '<div style="margin-top:4px;font-size:12px;">';
				echo '<strong>Denda: ' . esc_html( $denda['denda_format'] ) . '</strong><br>';
				echo '<small style="color:#64748b;">' . esc_html( $denda['keterangan'] ) . '</small>';
				echo '</div>';
			}
			break;

		case 'aksi_operator':
			$nonce = wp_create_nonce( 'ryokou_booking_action_' . $post_id );
			$base  = admin_url( 'admin-post.php?action=ryokourent_booking_action&booking_id=' . $post_id . '&_wpnonce=' . $nonce );

			// STATUS 1: BOOKING -> Pilih Unit Fisik Global & Klik Approve
			if ( 'ryokou_booking' === $status ) {
				$avail_units = ryokourent_get_available_units( $motor_id, $mulai, $selesai, $post_id );
				if ( ! empty( $avail_units ) ) {
					echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="margin-bottom:6px;">';
					echo '<input type="hidden" name="action" value="ryokourent_booking_action" />';
					echo '<input type="hidden" name="ryokou_action" value="approve" />';
					echo '<input type="hidden" name="booking_id" value="' . esc_attr( $post_id ) . '" />';
					echo '<input type="hidden" name="_wpnonce" value="' . esc_attr( $nonce ) . '" />';
					echo '<select name="unit_id" style="max-width:210px;font-size:12px;margin-bottom:4px;" required>';
					foreach ( $avail_units as $u ) {
						echo '<option value="' . esc_attr( $u['unit_id'] ) . '">' . esc_html( $u['label_dropdown'] ) . '</option>';
					}
					echo '</select><br>';
					echo '<button type="submit" class="button button-primary button-small">✅ Approve & Kunci Unit</button>';
					echo '</form>';
				} else {
					echo '<span style="color:#dc2626;font-size:12px;font-weight:600;">Stok fisik penuh di jam ini.</span><br>';
				}
			}

			// STATUS 2: APPROVE BOOKING -> Serah Terima Unit ke Penyewa
			if ( 'ryokou_approved' === $status ) {
				$serah_url = add_query_arg( 'ryokou_action', 'serah_terima', $base );
				echo '<a href="' . esc_url( $serah_url ) . '" class="button button-primary button-small" style="margin-bottom:6px;">🛵 Serah Terima (Mulai Sewa)</a><br>';
			}

			// STATUS 3: SEDANG DISEWA -> Selesai Sewa (Pilih Pool Parkir Kembali) ATAU Tukar Unit (D-19)
			if ( 'ryokou_disewa' === $status ) {
				$cur_pool = get_post_meta( $post_id, '_ryokou_pool', true );
				echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="margin-bottom:6px;">';
				echo '<input type="hidden" name="action" value="ryokourent_booking_action" />';
				echo '<input type="hidden" name="ryokou_action" value="selesai" />';
				echo '<input type="hidden" name="booking_id" value="' . esc_attr( $post_id ) . '" />';
				echo '<input type="hidden" name="_wpnonce" value="' . esc_attr( $nonce ) . '" />';
				echo '<select name="pool_kembali" style="font-size:11px;margin-bottom:4px;">';
				echo '<option value="malang" ' . selected( $cur_pool, 'malang', false ) . '>Parkir Kembali: Pool Malang</option>';
				echo '<option value="batu" ' . selected( $cur_pool, 'batu', false ) . '>Parkir Kembali: Pool Batu</option>';
				echo '</select><br>';
				echo '<button type="submit" class="button button-primary button-small">🏁 Selesai & Kembalikan ke Pool</button>';
				echo '</form>';

				// Form Tukar Unit Berkala (D-19)
				$swap_units = ryokourent_get_available_units( $motor_id, gmdate( 'Y-m-d H:i' ), $selesai, $post_id );
				if ( ! empty( $swap_units ) ) {
					echo '<details style="font-size:11px;margin-top:4px;"><summary style="cursor:pointer;color:#0f766e;font-weight:600;">🔄 Tukar Unit Berkala (D-19)</summary>';
					echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="margin-top:4px;">';
					echo '<input type="hidden" name="action" value="ryokourent_booking_action" />';
					echo '<input type="hidden" name="ryokou_action" value="tukar_unit" />';
					echo '<input type="hidden" name="booking_id" value="' . esc_attr( $post_id ) . '" />';
					echo '<input type="hidden" name="_wpnonce" value="' . esc_attr( $nonce ) . '" />';
					echo '<select name="new_unit_id" style="max-width:190px;font-size:11px;" required>';
					foreach ( $swap_units as $su ) {
						echo '<option value="' . esc_attr( $su['unit_id'] ) . '">' . esc_html( $su['label_dropdown'] ) . '</option>';
					}
					echo '</select><br>';
					echo '<button type="submit" class="button button-small" style="margin-top:3px;">Proses Tukar Unit</button>';
					echo '</form></details>';
				}
			}

			// Tombol Reject / Cancel 2 Langkah (D-20: Hanya muncul jika BUKAN `ryokou_disewa`)
			if ( 'ryokou_disewa' !== $status ) {
				$del_url = add_query_arg( 'ryokou_action', 'cancel_delete', $base );
				echo '<a href="' . esc_url( $del_url ) . '" onclick="return confirm(\'KONFIRMASI 2 LANGKAH (D-20): Hapus permanen data pesanan ini dari database?\');" style="color:#dc2626;font-size:11px;text-decoration:none;">🗑️ Reject / Hapus Permanen</a>';
			}
			break;
	}
}
add_action( 'manage_penyewaan_posts_custom_column', 'ryokourent_booking_render_columns', 10, 2 );

/**
 * 3. Halaman Submenu Pengaturan Operasional: Nomor WhatsApp Ber-Audit Log (D-23) & Bulk Price Adjustment (D-22)
 */
function ryokourent_register_settings_submenu() {
	add_submenu_page(
		'edit.php?post_type=penyewaan',
		__( 'Pengaturan WA & Penyesuaian Tarif Massal', 'ryokourent' ),
		__( 'Pengaturan & Bulk Tarif', 'ryokourent' ),
		'ryokourent_manage_settings',
		'ryokourent-settings',
		'ryokourent_render_settings_page'
	);
}
add_action( 'admin_menu', 'ryokourent_register_settings_submenu' );

function ryokourent_render_settings_page() {
	if ( ! current_user_can( 'ryokourent_manage_settings' ) ) {
		wp_die( esc_html__( 'Akses ditolak.', 'ryokourent' ) );
	}

	$notice = '';

	// A. Simpan Perubahan Nomor WhatsApp + Catat Audit Log (D-23, QA-18)
	if ( isset( $_POST['ryokou_save_wa_btn'] ) && check_admin_referer( 'ryokou_save_wa_action', 'ryokou_wa_nonce' ) ) {
		$old_wa = ryokourent_get_admin_whatsapp_number();
		$new_wa = isset( $_POST['ryokou_admin_wa'] ) ? preg_replace( '/[^0-9]/', '', sanitize_text_field( wp_unslash( $_POST['ryokou_admin_wa'] ) ) ) : '';
		if ( strpos( $new_wa, '08' ) === 0 ) {
			$new_wa = '62' . substr( $new_wa, 1 );
		}

		if ( ! empty( $new_wa ) && $new_wa !== $old_wa ) {
			update_option( 'ryokourent_admin_whatsapp', $new_wa );

			$user = wp_get_current_user();
			$tz   = new DateTimeZone( 'Asia/Jakarta' );
			$wib  = ( new DateTime( 'now', $tz ) )->format( 'Y-m-d H:i:s' ) . ' WIB';

			$logs = get_option( 'ryokourent_wa_audit_log', array() );
			if ( ! is_array( $logs ) ) {
				$logs = array();
			}
			array_unshift(
				$logs,
				array(
					'waktu' => $wib,
					'user'  => $user->display_name . ' (' . implode( ',', (array) $user->roles ) . ')',
					'lama'  => $old_wa,
					'baru'  => $new_wa,
				)
			);
			update_option( 'ryokourent_wa_audit_log', array_slice( $logs, 0, 20 ) );
			$notice = __( 'Nomor WhatsApp berhasil diperbarui dan dicatat di Audit Log.', 'ryokourent' );
		}
	}

	// B. Eksekusi Penyesuaian Tarif Massal / Bulk Price Adjustment -50% s/d +200% (D-22, QA-19)
	if ( isset( $_POST['ryokou_bulk_price_btn'] ) && check_admin_referer( 'ryokou_bulk_price_action', 'ryokou_bulk_nonce' ) ) {
		$pct = isset( $_POST['bulk_percentage'] ) ? floatval( $_POST['bulk_percentage'] ) : 0;
		$cat = isset( $_POST['bulk_kategori_motor'] ) ? absint( $_POST['bulk_kategori_motor'] ) : 0;

		if ( $pct < -50 || $pct > 200 || 0.0 === $pct ) {
			$notice = __( 'Persentase Bulk Pricing harus berada di antara -50% hingga +200% (dan bukan 0%).', 'ryokourent' );
		} else {
			$query_args = array(
				'post_type'      => 'motor',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
			);
			if ( $cat > 0 ) {
				$query_args['tax_query'] = array(
					array(
						'taxonomy' => 'kategori_motor',
						'field'    => 'term_id',
						'terms'    => $cat,
					),
				);
			}

			$motors     = get_posts( $query_args );
			$multiplier = 1 + ( $pct / 100 );
			$meta_keys  = array(
				'_ryokou_harga_harian',
				'_ryokou_harga_1minggu',
				'_ryokou_harga_2minggu',
				'_ryokou_harga_12jam',
				'_ryokou_harga_9jam',
				'_ryokou_harga_6jam',
				'_ryokou_harga_3jam',
			);

			foreach ( $motors as $m ) {
				foreach ( $meta_keys as $mk ) {
					$val = absint( get_post_meta( $m->ID, $mk, true ) );
					if ( $val > 0 ) {
						// Bulatkan ke ribuan terdekat (D-22)
						$new_val = (int) ( round( ( $val * $multiplier ) / 1000 ) * 1000 );
						update_post_meta( $m->ID, $mk, max( 5000, $new_val ) );
					}
				}
			}
			$notice = sprintf( __( 'Berhasil menyesuaikan tarif %d model motor sebesar %s%% (dibulatkan ke ribuan terdekat).', 'ryokourent' ), count( $motors ), $pct );
		}
	}

	// 3. Impor Otomatis 6 Model Motor Contoh (Model 003 React)
	if ( isset( $_POST['ryokou_seed_motors_btn'] ) && check_admin_referer( 'ryokou_seed_motors_action', 'ryokou_seed_nonce' ) ) {
		$force  = ! empty( $_POST['ryokou_seed_force'] );
		$result = ryokourent_seed_sample_motors( $force );
		$notice = $result['message'];
	}

	// D. Simpan Pengaturan CSS Frontend (ryokourent-public.css)
	if ( isset( $_POST['ryokou_save_css_btn'] ) && check_admin_referer( 'ryokou_save_css_action', 'ryokou_css_nonce' ) ) {
		$enable_css = isset( $_POST['ryokou_enable_frontend_css'] ) && '1' === $_POST['ryokou_enable_frontend_css'] ? '1' : '0';
		update_option( 'ryokourent_enable_frontend_css', $enable_css );
		$notice = ( '1' === $enable_css )
			? __( 'CSS frontend (ryokourent-public.css) berhasil diaktifkan.', 'ryokourent' )
			: __( 'CSS frontend (ryokourent-public.css) berhasil dinonaktifkan.', 'ryokourent' );
	}

	$current_wa          = ryokourent_get_admin_whatsapp_number();
	$wa_logs             = get_option( 'ryokourent_wa_audit_log', array() );
	$enable_frontend_css = get_option( 'ryokourent_enable_frontend_css', '1' );
	$terms               = get_terms(
		array(
			'taxonomy'   => 'kategori_motor',
			'hide_empty' => false,
		)
	);
	$total_motors = count(
		get_posts(
			array(
				'post_type'      => 'motor',
				'post_status'    => 'any',
				'posts_per_page' => -1,
			)
		)
	);
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Pengaturan Operasional Ryokourent (D-22 & D-23)', 'ryokourent' ); ?></h1>
		<?php if ( $notice ) : ?>
			<div class="notice notice-success is-dismissible"><p><strong><?php echo esc_html( $notice ); ?></strong></p></div>
		<?php endif; ?>

		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px;margin-top:20px;">
			<!-- Kartu 1: Nomor WhatsApp & Audit Log (D-23) -->
			<div style="background:#fff;padding:20px;border:1px solid #cbd5e1;border-radius:8px;">
				<h2><?php esc_html_e( '1. Nomor WhatsApp Penerima Booking & Audit Log (D-23)', 'ryokourent' ); ?></h2>
				<form method="post">
					<?php wp_nonce_field( 'ryokou_save_wa_action', 'ryokou_wa_nonce' ); ?>
					<p>
						<label for="ryokou_admin_wa"><strong><?php esc_html_e( 'Nomor WhatsApp Aktif (Format 628...):', 'ryokourent' ); ?></strong></label><br>
						<input type="text" id="ryokou_admin_wa" name="ryokou_admin_wa" value="<?php echo esc_attr( $current_wa ); ?>" class="regular-text" required />
					</p>
					<p><button type="submit" name="ryokou_save_wa_btn" class="button button-primary"><?php esc_html_e( 'Simpan Nomor WhatsApp', 'ryokourent' ); ?></button></p>
				</form>

				<h3 style="margin-top:20px;"><?php esc_html_e( 'Riwayat Perubahan Nomor WA (Audit Log)', 'ryokourent' ); ?></h3>
				<?php if ( empty( $wa_logs ) ) : ?>
					<p style="color:#64748b;"><?php esc_html_e( 'Belum ada riwayat perubahan nomor WhatsApp.', 'ryokourent' ); ?></p>
				<?php else : ?>
					<table class="widefat striped" style="font-size:12px;">
						<thead>
							<tr>
								<th><?php esc_html_e( 'Waktu (WIB)', 'ryokourent' ); ?></th>
								<th><?php esc_html_e( 'Diubah Oleh', 'ryokourent' ); ?></th>
								<th><?php esc_html_e( 'Nomor Lama -> Baru', 'ryokourent' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $wa_logs as $log ) : ?>
								<tr>
									<td><?php echo esc_html( $log['waktu'] ); ?></td>
									<td><?php echo esc_html( $log['user'] ); ?></td>
									<td><code><?php echo esc_html( $log['lama'] ); ?></code> &rarr; <strong><code><?php echo esc_html( $log['baru'] ); ?></code></strong></td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				<?php endif; ?>
			</div>

			<!-- Kartu 2: Bulk Price Adjustment -50% s/d +200% (D-22) -->
			<div style="background:#fff;padding:20px;border:1px solid #cbd5e1;border-radius:8px;">
				<h2><?php esc_html_e( '2. Penyesuaian Tarif Massal / High Season (D-22)', 'ryokourent' ); ?></h2>
				<p style="color:#475569;"><?php esc_html_e( 'Naikkan atau turunkan seluruh tarif sewa (Harian, Mingguan, & ShortRent Jam) secara serentak dengan batas aman -50% hingga +200%. Otomatis dibulatkan ke Rp1.000 terdekat.', 'ryokourent' ); ?></p>
				<form method="post">
					<?php wp_nonce_field( 'ryokou_bulk_price_action', 'ryokou_bulk_nonce' ); ?>
					<p>
						<label for="bulk_kategori_motor"><strong><?php esc_html_e( 'Target Kategori Motor:', 'ryokourent' ); ?></strong></label><br>
						<select id="bulk_kategori_motor" name="bulk_kategori_motor">
							<option value="0"><?php esc_html_e( 'Semua Kategori Motor', 'ryokourent' ); ?></option>
							<?php if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) : ?>
								<?php foreach ( $terms as $t ) : ?>
									<option value="<?php echo esc_attr( $t->term_id ); ?>"><?php echo esc_html( $t->name ); ?></option>
								<?php endforeach; ?>
							<?php endif; ?>
						</select>
					</p>
					<p>
						<label for="bulk_percentage"><strong><?php esc_html_e( 'Persentase Penyesuaian (-50 s/d 200):', 'ryokourent' ); ?></strong></label><br>
						<input type="number" id="bulk_percentage" name="bulk_percentage" min="-50" max="200" step="1" value="10" style="width:100px;" required /> %
					</p>
					<p>
						<button type="submit" name="ryokou_bulk_price_btn" class="button button-primary" onclick="return confirm('Terapkan perubahan tarif massal ini sekarang?');">
							<?php esc_html_e( 'Terapkan Penyesuaian Tarif Massal', 'ryokourent' ); ?>
						</button>
					</p>
				</form>
			</div>

			<!-- Kartu 3: Impor Otomatis Model Motor Contoh (Model 003 React) -->
			<div style="background:#fff;padding:20px;border:1px solid #cbd5e1;border-radius:8px;">
				<h2><?php esc_html_e( '3. Impor Data Motor dari React (1-Klik)', 'ryokourent' ); ?></h2>
				<p style="color:#475569;">
					<?php esc_html_e( 'Ambil 6 data model motor dari sistem React 19 (Scoopy, NMAX, CRF 150L, Fazzio, R15, BeAT) dan pasang otomatis ke database WordPress tanpa perlu mengisi satu per satu.', 'ryokourent' ); ?>
				</p>
				<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:10px 14px;border-radius:6px;margin-bottom:15px;">
					<strong style="color:#166534;">📊 Status Database WordPress:</strong><br>
					<span style="font-size:13px;color:#15803d;">
						Saat ini terdaftar <strong><?php echo esc_html( $total_motors ); ?></strong> model motor di CPT <code>motor</code>.
					</span>
				</div>
				<form method="post">
					<?php wp_nonce_field( 'ryokou_seed_motors_action', 'ryokou_seed_nonce' ); ?>
					<p>
						<label style="cursor:pointer;">
							<input type="checkbox" name="ryokou_seed_force" value="1" />
							<?php esc_html_e( 'Perbarui / timpa data jika motor sudah ada sebelumnya', 'ryokourent' ); ?>
						</label>
					</p>
					<p>
						<button type="submit" name="ryokou_seed_motors_btn" class="button button-primary" style="background:#0f766e;border-color:#0d5e58;padding:4px 14px;font-weight:600;">
							<?php esc_html_e( '⚡ Impor 6 Model Motor Sekarang (1-Klik)', 'ryokourent' ); ?>
						</button>
					</p>
					<p style="color:#64748b;font-size:12px;margin-top:10px;">
						<?php esc_html_e( 'Model yang diimpor mencakup taksonomi Kategori, tarif harian (1H, 1M, 2M), tarif jam (12J, 9J, 6J, 3J), denda keterlambatan, spesifikasi, dan perlengkapan helm/jas hujan.', 'ryokourent' ); ?>
					</p>
				</form>
			</div>

			<!-- Kartu 4: Pengaturan CSS Frontend (ryokourent-public.css) -->
			<div style="background:#fff;padding:20px;border:1px solid #cbd5e1;border-radius:8px;">
				<h2><?php esc_html_e( '4. Pengaturan CSS Frontend (ryokourent-public.css)', 'ryokourent' ); ?></h2>
				<p style="color:#475569;">
					<?php esc_html_e( 'Kontrol apakah file stylesheet ryokourent-public.css dimuat otomatis di frontend untuk menata katalog motor dan formulir pemesanan.', 'ryokourent' ); ?>
				</p>
				<form method="post">
					<?php wp_nonce_field( 'ryokou_save_css_action', 'ryokou_css_nonce' ); ?>
					<div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px 14px;border-radius:6px;margin-bottom:15px;">
						<label style="font-weight:600;display:inline-flex;align-items:center;gap:8px;cursor:pointer;">
							<input type="checkbox" name="ryokou_enable_frontend_css" value="1" <?php checked( '1', $enable_frontend_css ); ?> />
							<?php esc_html_e( 'Aktifkan ryokourent-public.css sebagai CSS Frontend', 'ryokourent' ); ?>
						</label>
						<p style="color:#64748b;font-size:12px;margin:6px 0 0 24px;line-height:1.4;">
							<?php esc_html_e( 'Saat aktif, file assets/css/ryokourent-public.css akan di-enqueue pada halaman publik (shortcode [ryokou_katalog] & [ryokou_booking_form]). Nonaktifkan jika styling ingin sepenuhnya dikelola oleh child theme GeneratePress atau custom stylesheet.', 'ryokourent' ); ?>
						</p>
					</div>
					<p>
						<button type="submit" name="ryokou_save_css_btn" class="button button-primary">
							<?php esc_html_e( 'Simpan Pengaturan CSS', 'ryokourent' ); ?>
						</button>
					</p>
				</form>
			</div>
		</div>
	</div>
	<?php
}
