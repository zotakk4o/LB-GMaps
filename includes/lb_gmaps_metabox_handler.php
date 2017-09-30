<?php

class LB_GMaps_Metabox_Handler {
	private $ajaxer;

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
		LB_GMaps_Helper::include_file( 'includes/metabox/lb_gmaps_metabox' );
	}

	public function enqueue_admin_scripts( $hook ) {
		global $post_type;
		global $post;

		if( LB_GMAPS_POST_TYPE === $post_type && get_option( LB_GMAPS_API_KEY ) && strpos( $hook, 'post' ) !== false ) {
			$map_data = $this->get_ajaxer()->get_db_handler()->get_row_by_post_id( $this->get_ajaxer()->get_db_handler()->get_maps_table_name(), $post->ID );
			$markers_data = $this->get_ajaxer()->get_db_handler()->get_rows_by_post_id( $this->get_ajaxer()->get_db_handler()->get_markers_table_name(), $post->ID );

			wp_register_script( 'lb-gmaps-live-preview', LB_GMAPS_ASSETS . 'js/lb_gmaps_live_preview.js' );
			wp_localize_script( 'lb-gmaps-live-preview', 'views',
				array( 'dialogBox' => $this->get_content_of_view( 'marker', 'dialog' ),
				       'form' => $this->get_content_of_view( 'marker', 'form' ),
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
				array( 'map' => $map_data,
				       'markers' => $markers_data
				)
			);
			wp_localize_script( 'lb-gmaps-live-preview', 'errors',
				array( 'emptyField' => __( 'Please fill in this field.' ) )
			);

			wp_enqueue_script( 'lb-gmaps-live-preview' );
			wp_enqueue_script( 'lb-google-map', 'https://maps.googleapis.com/maps/api/js?key=' . get_option( LB_GMAPS_API_KEY ) . '&libraries=places&callback=initMap', array( 'lb-gmaps-live-preview' ) );

			wp_enqueue_style( 'lb-gmaps-metabox', LB_GMAPS_ASSETS . 'css/lb_gmaps_metabox.css' );
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




}