<?php

class LB_GMaps_Metabox_Handler {

	/**
	 * @var LB_GMaps_Ajaxer
	 */
	private $ajaxer;

	/**
	 * @var LB_GMaps_Helper
	 */
	private $helper;

	private $map_data;

	private $markers_data;

	public function __construct( $helper ) {
		$this->add_hooks();
		$this->set_helper( $helper );
		$this->register_ajaxer();
	}

	private function add_hooks() {
		add_action( 'add_meta_boxes_lb-gmaps', array( $this, 'add_gmaps_meta_box' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		add_filter( 'script_loader_tag', array( $this, 'add_script_defer' ), 10, 2 );
		add_filter( 'script_loader_tag', array( $this, 'add_script_async' ), 10, 2 );

		add_filter( 'upload_dir', array( $this, 'custom_upload_dir' ) );
	}

	public function add_gmaps_meta_box() {
		add_meta_box( 'lb-gmaps-metabox', 'LB GMaps', array( $this, 'display_meta_box' ) );
	}

	public function display_meta_box() {
		include_once LB_GMAPS_INCLUDES . "/metabox/lb_gmaps_metabox.php";
	}

	public function enqueue_admin_scripts( $hook ) {
		global $post_type;
		global $post;

		if( LB_GMAPS_POST_TYPE === $post_type && get_option( LB_GMAPS_API_KEY ) && strpos( $hook, 'post' ) !== false ) {

			$this->set_map_data( $this->get_ajaxer()->get_db_handler()->get_row_by_post_id( $this->get_ajaxer()->get_db_handler()->get_maps_table_name(), $post->ID ) );
			$this->set_markers_data( $this->get_ajaxer()->get_db_handler()->get_rows_by_post_id( $this->get_ajaxer()->get_db_handler()->get_markers_table_name(), $post->ID ) );

			$ajax_nonce = wp_create_nonce( 'programming-is-funny' );

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
				array( 'ajaxURL' => admin_url( 'admin-ajax.php', ( is_ssl() ? 'https' : 'http' ) ), 'ajaxNonce' => $ajax_nonce )
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
				'markerSuccess'   => __( 'Marker Successfully transferred.', 'lb-gmaps' ),
				'markerError'     => __( 'Some Maps didn\'t receive the marker successfully.', 'lb-gmaps' ),
				'dimensionsError' => __( 'Missing "%" or "px"', 'lb-gmaps' ),
				'transitMode'     => __( 'Public transport routing not available with waypoints', 'lb-gmaps' ),
				'stylesError'     => __( 'Styles has to be in JSON format', 'lb-gmaps' )
			) );
			wp_localize_script( 'lb-gmaps-helper-functions', 'helperViews',
				array(
					'contextMenu' => $this->get_content_of_view( 'map', 'contextmenu' ),
					'travelModes' => $this->get_content_of_view( 'map', 'directions_type' ),
					'searchingField' => $this->get_content_of_view( 'map', 'searching_field' )
				)
			);
			wp_enqueue_script( 'lb-gmaps-helper-functions' );
			wp_enqueue_script( 'lb-gmaps-live-preview' );
			wp_enqueue_script( 'lb-google-map', 'https://maps.googleapis.com/maps/api/js?key=' . get_option( LB_GMAPS_API_KEY ) . '&libraries=places&callback=initMap', array( 'lb-gmaps-live-preview' ) );

			wp_enqueue_style( 'lb-gmaps-metabox', LB_GMAPS_ASSETS . 'css/lb_gmaps_metabox.css' );
			wp_enqueue_style( 'lb-gmaps-infowindow', LB_GMAPS_ASSETS . 'css/lb_gmaps_infowindow.css' );

			wp_enqueue_style( 'lb-gmaps-shared', LB_GMAPS_ASSETS . 'css/lb_gmaps_shared.css' );
			wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');

			wp_enqueue_media ();
		}
	}

	public function register_ajaxer() {
		$this->get_helper()->include_file( 'includes/lb_gmaps_ajaxer' );
		$this->set_ajaxer( new LB_GMaps_Ajaxer( $this->get_helper() ) );
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

	private function get_content_of_view( $view_type, $view_name ) {
		return file_get_contents( LB_GMAPS_VIEWS . "lb_gmaps_{$view_type}_{$view_name}.php" );
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
	 * @return LB_GMaps_Helper
	 */
	public function get_helper() {
		return $this->helper;
	}

	/**
	 * @param LB_GMaps_Helper $helper
	 */
	public function set_helper( $helper ) {
		$this->helper = $helper;
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

	public function custom_upload_dir( $dir ) {
		$mydir = '/lb-gmaps-media';

		$dir['basedir'] = LB_GMAPS_INCLUDES;
		$dir['baseurl'] = LB_GMAPS_INCLUDES_URL;
		$dir['subdir'] = $mydir;
		$dir['path'] = LB_GMAPS_INCLUDES . $mydir;
		$dir['url'] = LB_GMAPS_INCLUDES_URL . $mydir;

		return $dir;
	}
}