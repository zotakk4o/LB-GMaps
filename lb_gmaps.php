<?php

/**
 *Plugin Name: LB GMaps
 *Description: LB GMaps is a plugin that lets you integrate the Google Map in your project.
 *Version: 1.0
 *Author: Lyubomir Borisov
 *Text Domain: lb-gmaps
 */
class LB_GMaps {

	public function __construct() {
		$this->register_constants();
		$this->register_custom_post_type();
	}

	public function register_constants() {
		include_once dirname( __FILE__ ) . '/includes/lb_gmaps_constants.php';
	}

	public function register_custom_post_type() {
		$this->include_file( 'includes', 'lb_gmaps_post_type' );
		new LB_GMaps_Post_Type();

		$this->register_settings();
	}

	public function register_settings() {
		$this->include_file( 'includes', 'lb_gmaps_settings_handler' );
		new LB_GMaps_Settings_Handler();
	}

	public function include_file( $folder, $file_name ) {
		switch ( $folder ) {
			case 'assets':
				//TODO: INCLUDE ASSETS
				return true;
			case 'includes':
				return include_once LB_GMAPS_INCLUDES . "/$file_name.php";
			default:
				return false;
		}
	}

}
$lb_gmaps = new LB_GMaps();