<?php

class LB_GMaps_Metabox_Handler {
	private $ajaxer;

	private $map_data;

	private $markers_data;

	public function __construct() {
		$this->register_helper();
		$this->add_hooks();
		$this->register_ajaxer();
	}

	private function add_hooks() {
		add_action( 'add_meta_boxes_lb-gmaps', array( $this, 'add_gmaps_meta_box' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		add_filter( 'script_loader_tag', array( $this, 'add_script_defer' ), 10, 2 );
		add_filter( 'script_loader_tag', array( $this, 'add_script_async' ), 10, 2 );
	}

	public function add_gmaps_meta_box() {
		add_meta_box( 'lb-gmaps-metabox', 'LB GMaps', array( $this, 'display_meta_box' ) );
	}

	public function display_meta_box() {
		//LB_GMaps_Helper::include_file( 'includes/metabox/lb_gmaps_metabox' );
		include_once LB_GMAPS_INCLUDES . "/metabox/lb_gmaps_metabox.php";
	}

	public function enqueue_admin_scripts( $hook ) {
		global $post_type;
		global $post;

		if( LB_GMAPS_POST_TYPE === $post_type && get_option( LB_GMAPS_API_KEY ) && strpos( $hook, 'post' ) !== false ) {

			$this->set_map_data( $this->get_ajaxer()->get_db_handler()->get_row_by_post_id( $this->get_ajaxer()->get_db_handler()->get_maps_table_name(), $post->ID ) );
			$this->set_markers_data( $this->get_ajaxer()->get_db_handler()->get_rows_by_post_id( $this->get_ajaxer()->get_db_handler()->get_markers_table_name(), $post->ID ) );

			wp_register_script( 'lb-gmaps-live-preview', LB_GMAPS_ASSETS . 'js/lb_gmaps_live_preview.js', array( 'lb-gmaps-helper-functions' ) );
			wp_localize_script( 'lb-gmaps-live-preview', 'views',
				array( 'form' => $this->get_content_of_view( 'marker', 'form' ),
				       'infoBox' => $this->get_content_of_view( 'marker', 'info' )
				)
			);
			wp_localize_script( 'lb-gmaps-live-preview', 'post',
				array( 'ID' => $post->ID )
			);
			wp_localize_script( 'lb-gmaps-live-preview', 'admin',
				array( 'ajaxURL' => admin_url( 'admin-ajax.php', ( is_ssl() ? 'https' : 'http' ) ) )
			);
			wp_localize_script( 'lb-gmaps-live-preview', 'data',
				array( 'map' => $this->get_map_data(),
				       'markers' => $this->get_markers_data()
				)
			);
			wp_localize_script( 'lb-gmaps-live-preview', 'errors',
				array( 'emptyField' => __( 'Please fill in this field.' ) )
			);

			wp_enqueue_script( 'tinymce_js', includes_url( 'js/tinymce/' ) . 'wp-tinymce.php', array( 'jquery' ), false, true );
			wp_register_script( 'lb-gmaps-helper-functions', LB_GMAPS_ASSETS . 'js/lb_gmaps_helper_functions.js', array( 'tinymce_js' ) );
			wp_localize_script( 'lb-gmaps-helper-functions', 'maps', array( 'select' => $this->get_content_of_view( 'marker', 'transfer' ) ) );
			wp_localize_script( 'lb-gmaps-helper-functions', 'messages', array(
				'success' => __( 'Markers Successfully transferred.', 'lb-gmaps' ),
				'error' => __( 'Some Markers didn\'t transfer successfully.', 'lb-gmaps' )
			) );
			wp_enqueue_script( 'lb-gmaps-helper-functions' );
			wp_enqueue_script( 'lb-gmaps-live-preview' );
			wp_enqueue_script( 'lb-google-map', 'https://maps.googleapis.com/maps/api/js?key=' . get_option( LB_GMAPS_API_KEY ) . '&libraries=places&callback=initMap', array( 'lb-gmaps-live-preview' ) );

			wp_enqueue_style( 'lb-gmaps-metabox', LB_GMAPS_ASSETS . 'css/lb_gmaps_metabox.css' );
			wp_enqueue_style( 'lb-gmaps-infowindow', LB_GMAPS_ASSETS . 'css/lb_gmaps_infowindow.css' );

			wp_enqueue_media ();
		}
	}

	public function register_ajaxer() {
		LB_GMaps_Helper::include_file( 'includes/lb_gmaps_ajaxer' );
		$this->set_ajaxer( new LB_GMaps_Ajaxer() );
	}

	public function add_script_defer( $tag, $handle ) {
		if( 'lb-google-map' !== $handle ) {
			return $tag;
		}

		return str_replace(' src', ' defer="defer" src', $tag );
	}

	public function add_script_async( $tag, $handle ) {
		if( 'lb-google-map' !== $handle ) {
			return $tag;
		}

		return str_replace(' src', ' afer="afer" src', $tag );
	}

	private function register_helper() {
		include_once dirname( __FILE__ ) . '/lb_gmaps_helper.php';
	}

	private function get_content_of_view( $view_type, $view_name ) {
		switch ( $view_type ) {
			case 'marker':
				return file_get_contents( LB_GMAPS_VIEWS . "lb_gmaps_marker_$view_name.php" );
			default:
				return __( 'View Type Not Found', 'lb-gmaps' );
		}
	}

	/**
	 * @return LB_GMaps_Ajaxer
	 */
	public function get_ajaxer() {
		return $this->ajaxer;
	}

	/**
	 * @param mixed $ajaxer
	 */
	public function set_ajaxer( $ajaxer ) {
		$this->ajaxer = $ajaxer;
	}

	/**
	 * @return string
	 */
	public function get_map_data() {
		return $this->map_data;
	}

	/**
	 * @param string $map_data
	 */
	public function set_map_data( $map_data ) {
		$this->map_data = $map_data;
	}

	/**
	 * @return mixed
	 */
	public function get_markers_data() {
		return $this->markers_data;
	}

	/**
	 * @param mixed $markers_data
	 */
	public function set_markers_data( $markers_data ) {
		$this->markers_data = $markers_data;
	}

	public function add_control_select( $id ) {
		$map_data = $this->get_map_data();
		$control = str_replace( '-', ' ', ucfirst( $id ) );
		$field_id = "lb-gmaps-map-$id-control";
		$id = str_replace( '-', '_', $id ) . '_control';
		if( null !== $map_data ) {
			if( is_object( $map_data ) ) {
				$map_data = json_decode(json_encode( $map_data ), true);
			}
			$data = $map_data[ $id ];
		}
		$options = [
			'TOP_LEFT',
			'TOP_RIGHT',
			'TOP_CENTER',
			'LEFT_TOP',
			'LEFT_CENTER',
			'LEFT_BOTTOM',
			'RIGHT_TOP',
			'RIGHT_CENTER',
			'RIGHT_BOTTOM',
			'BOTTOM_LEFT',
			'BOTTOM_RIGHT',
			'BOTTOM_CENTER'
		];
		?>
		<label class='map-controls' for='<?php echo $field_id ?>'><?php echo __( "$control Control", 'lb-gmaps' ) ?></label>
		<select id='<?php echo $field_id?>'>
			<option value='choose'><?php echo __( 'Choose...', 'lb-gmaps' ) ?></option>
			<?php foreach( $options as $option ) : ?>
				<option value='<?php echo $option ?>' <?php if( isset( $data ) ) { selected( $data, $option ); }?>><?php echo __( $option, 'lb-gmaps' ) ?></option>
			<?php endforeach; ?>
		</select>
		<?php
	}
}