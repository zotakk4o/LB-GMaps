<?php

class LB_GMaps_Shortcode_Handler {

	private $db_handler;

	public function __construct() {
		$this->add_hooks();
		$this->register_helper();
		$this->register_database_handler();
	}

	private function add_hooks() {
		add_shortcode( 'lb-gmaps', array( $this, 'handle_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	public function enqueue_scripts() {
		wp_enqueue_script( 'lb-gmaps-helper-functions', LB_GMAPS_ASSETS . 'js/lb_gmaps_helper_functions.js', array( 'jquery' ) );
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
					array( 'dialogBox' => $this->get_content_of_view( 'marker', 'dialog' ),
					       'form' => $this->get_content_of_view( 'marker', 'form' ),
					       'infoBox' => $this->get_content_of_view( 'marker', 'info' )
					)
				);
			}
			wp_enqueue_script( 'lb-gmaps-front-end' );
			wp_enqueue_script( 'lb-google-map' );

			wp_enqueue_style( 'lb-gmaps-infowindow', LB_GMAPS_ASSETS . 'css/lb_gmaps_infowindow.css' );
		}

		return '<div id="lb-gmaps-front-end"></div>';
	}

	private function register_database_handler() {
		LB_GMaps_Helper::include_file( 'includes/database-tools/lb_gmaps_database_handler' );
	}

	private function register_helper() {
		include_once dirname( __FILE__ ) . '/lb_gmaps_helper.php';
		$this->set_db_handler( new LB_GMaps_Database_Handler() );
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
		switch ( $view_type ) {
			case 'marker':
				return file_get_contents( LB_GMAPS_VIEWS . "lb_gmaps_marker_$view_name.php" );
			default:
				return __( 'View Type Not Found', 'lb-gmaps' );
		}
	}



}