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
		$this->register_helper();
		$this->register_database_creation();
		$this->register_custom_post_type();
		$this->register_metabox_handler();
	}

	private function register_constants() {
		include_once dirname( __FILE__ ) . '/includes/lb_gmaps_constants.php';
	}

	private function register_database_creation() {
		register_activation_hook( __FILE__, array( $this, 'create_database' ) );
	}

	public function create_database() {
		LB_GMaps_Helper::include_file( 'includes/database-tools/lb_gmaps_database_handler' );
		$lb_gmaps_database_handler = new LB_GMaps_Database_Handler();
		$lb_gmaps_database_handler->create_tables();
	}

	private function register_custom_post_type() {
		LB_GMaps_Helper::include_file( 'includes/lb_gmaps_post_type' );
		new LB_GMaps_Post_Type();

		$this->register_settings();
	}

	private function register_settings() {
		LB_GMaps_Helper::include_file( 'includes/lb_gmaps_settings_handler' );
		new LB_GMaps_Settings_Handler();
	}

	private function register_metabox_handler() {
		LB_GMaps_Helper::include_file( 'includes/lb_gmaps_metabox_handler' );
		new LB_GMaps_Metabox_Handler();
	}

	private function register_helper() {
		include_once dirname( __FILE__ ) . '/includes/lb_gmaps_helper.php';
	}

}
$lb_gmaps = new LB_GMaps();