<?php

class LB_GMaps_Metabox_Handler {

	public function __construct() {
		$this->register_helper();
		$this->add_hooks();
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

	public function enqueue_admin_scripts() {
		global $post_type;
		if( LB_GMAPS_POST_TYPE === $post_type && get_option( LB_GMAPS_API_KEY ) ) {
			wp_register_script( 'lb-gmaps-live-preview', LB_GMAPS_ASSETS . 'js/lb_gmaps_live_preview.js' );
			wp_localize_script( 'lb-gmaps-live-preview', 'views', array( 'dialogBox' => file_get_contents(  LB_GMAPS_VIEWS . 'lb_gmaps_marker_dialog.php' ) ) );
			wp_enqueue_script( 'lb-gmaps-live-preview' );
			wp_enqueue_script( 'lb-google-map', 'https://maps.googleapis.com/maps/api/js?key=' . get_option( LB_GMAPS_API_KEY ) . '&libraries=places&callback=initMap', array( 'lb-gmaps-live-preview' ) );

			wp_enqueue_style( 'lb-gmaps-metabox', LB_GMAPS_ASSETS . 'css/lb_gmaps_metabox.css' );
		}
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
}