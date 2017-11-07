<?php

/**
 *Plugin Name: LB GMaps
 *Description: LB GMaps is a plugin that lets you integrate the Google Map in your project.
 *Version: 1.0
 *Author: Lyubomir Borisov
 *Text Domain: lb-gmaps
 */
class LB_GMaps {

	/**
	 * @var LB_GMaps_Helper
	 */
	private $helper;

	public function __construct() {
		$this->register_constants();
		$this->register_helper();
		$this->register_database_creation();
		$this->register_plugin_deactivation();
		$this->register_custom_post_type();
		$this->register_metabox_handler();
		$this->register_shortcode();
	}

	private function register_constants() {
		include_once dirname( __FILE__ ) . '/includes/lb_gmaps_constants.php';
	}

	private function register_database_creation() {
		register_activation_hook( __FILE__, array( $this, 'create_database' ) );
	}

	private function register_plugin_deactivation() {
		register_deactivation_hook( __FILE__, array( $this, 'deactivate_plugin' ) );
	}

	public function create_database() {
		$this->get_helper()->include_file( 'includes/database-tools/lb_gmaps_database_handler' );
		$lb_gmaps_database_handler = new LB_GMaps_Database_Handler();
		$lb_gmaps_database_handler->create_tables();
	}

	public function deactivate_plugin() {
		global $wpdb;

		$lb_gmaps_tables = array(
			$wpdb->prefix . 'lb_gmaps',
			$wpdb->prefix . 'lb_gmaps_markers'
		);

		foreach( $lb_gmaps_tables as $table ){
			$wpdb->query( "DROP TABLE IF EXISTS $table" );
		}

		delete_option( LB_GMAPS_API_KEY );

		flush_rewrite_rules();
	}

	private function register_custom_post_type() {
		$this->get_helper()->include_file( 'includes/lb_gmaps_post_type' );
		new LB_GMaps_Post_Type( $this->get_helper() );
		$this->register_settings();
	}

	private function register_settings() {
		$this->get_helper()->include_file( 'includes/lb_gmaps_settings_handler' );
		new LB_GMaps_Settings_Handler();
	}

	private function register_metabox_handler() {
		$this->get_helper()->include_file( 'includes/lb_gmaps_metabox_handler' );
		new LB_GMaps_Metabox_Handler( $this->get_helper() );
	}

	private function register_shortcode() {
		$this->get_helper()->include_file( 'includes/lb_gmaps_shortcode_handler' );
		new LB_GMaps_Shortcode_Handler( $this->get_helper() );
	}

	private function register_helper() {
		include_once dirname( __FILE__ ) . '/includes/lb_gmaps_helper.php';
		$this->set_helper( new LB_GMaps_Helper() );
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

}
$lb_gmaps = new LB_GMaps();