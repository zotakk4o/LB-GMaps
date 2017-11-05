<?php

class LB_GMaps_Shortcode_Handler {

	/**
	 * @var LB_GMaps_Database_Handler
	 */
	private $db_handler;

	/**
	 * @var LB_GMaps_Helper
	 */
	private $helper;

	public function __construct( $helper ) {
		$this->add_hooks();
		$this->set_helper( $helper );
		$this->register_database_handler();
	}

	private function add_hooks() {
		add_shortcode( 'lb-gmaps', array( $this, 'handle_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	public function enqueue_scripts() {
		wp_enqueue_script( 'tinymce_js', includes_url( 'js/tinymce/' ) . 'wp-tinymce.php', array( 'jquery' ), false, true );
		wp_register_script( 'lb-gmaps-helper-functions', LB_GMAPS_ASSETS . 'js/lb_gmaps_helper_functions.js', array( 'tinymce_js' ) );
		wp_register_script( 'lb-gmaps-front-end', LB_GMAPS_ASSETS . 'js/lb_gmaps_front_end.js', array( 'lb-gmaps-helper-functions' ) );
		wp_register_script( 'lb-google-map', 'https://maps.googleapis.com/maps/api/js?key=' . get_option( LB_GMAPS_API_KEY ) . '&libraries=places&callback=initMap', array( 'lb-gmaps-front-end' ) );
	}

	public function handle_shortcode( $atts ) {
		$args = shortcode_atts( array( 'id' ), $atts, 'lb-gmaps' );
		if( in_array( 'id', $args ) ) {
			$id = $atts[ $args[0] ];
			$map_data = $this->get_db_handler()->get_row_by_post_id( $this->get_db_handler()->get_maps_table_name(), $id );
			$markers_data = $this->get_db_handler()->get_rows_by_post_id( $this->get_db_handler()->get_markers_table_name(), $id );
			if( null !== $map_data && ! empty( $map_data ) ) {
				wp_localize_script( 'lb-gmaps-front-end', 'data', array(
					'frontEnd' => true,
					'map' => $map_data,
					'markers' => $markers_data
				) );
				wp_localize_script( 'lb-gmaps-front-end', 'views',
					array( 'infoBox' => $this->get_content_of_view( 'marker', 'info' ) )
				);
				wp_localize_script( 'lb-gmaps-helper-functions', 'maps', array( 'select' => $this->get_content_of_view( 'marker', 'transfer' ) ) );
				wp_localize_script( 'lb-gmaps-helper-functions', 'messages', array(
					'markerSuccess' => __( 'Marker Successfully transferred.', 'lb-gmaps' ),
					'markerError' => __( 'Some Maps didn\'t receive the marker successfully.', 'lb-gmaps' ),
					'dimensionsError' => __( 'Missing "%" or "px"', 'lb-gmaps' ),
					'transitMode' => __( 'Public transport routing not available with waypoints', 'lb-gmaps' )
				) );
				wp_localize_script( 'lb-gmaps-helper-functions', 'helperViews',
					array(
						'contextMenu' => $this->get_content_of_view( 'map', 'contextmenu' ),
						'travelModes' => $this->get_content_of_view( 'map', 'directions_type' ),
						'searchingField' => $this->get_content_of_view( 'map', 'searching_field' )
					)
				);;
				wp_enqueue_script( 'lb-gmaps-helper-functions' );
			}
			wp_enqueue_script( 'lb-gmaps-front-end' );
			wp_enqueue_script( 'lb-google-map' );

			wp_enqueue_style( 'lb-gmaps-infowindow', LB_GMAPS_ASSETS . 'css/lb_gmaps_infowindow.css' );
			wp_enqueue_style( 'lb-gmaps-shared', LB_GMAPS_ASSETS . 'css/lb_gmaps_shared.css' );
			wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
		}

		return '<div id="lb-gmaps-front-end"></div>';
	}

	private function register_database_handler() {
		$this->get_helper()->include_file( 'includes/database-tools/lb_gmaps_database_handler' );
	}

	/**
	 * @return LB_GMaps_Database_Handler
	 */
	public function get_db_handler() {
		return $this->db_handler;
	}

	/**
	 * @param mixed $db_handler
	 */
	public function set_db_handler( $db_handler ) {
		$this->db_handler = $db_handler;
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



}