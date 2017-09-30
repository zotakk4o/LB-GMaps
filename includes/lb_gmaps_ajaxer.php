<?php

class LB_GMaps_Ajaxer {

	/**
	 * @var LB_GMaps_Database_Handler
	 */
	private $db_handler;

	public function __construct() {
		$this->add_hooks();
		$this->register_helper();
		$this->register_db_handler();
	}

	private function register_helper() {
		include_once dirname( __FILE__ ) . '/lb_gmaps_helper.php';
	}

	private function register_db_handler() {
		LB_GMaps_Helper::include_file( 'includes/database-tools/lb_gmaps_database_handler' );
		$this->set_db_handler( new LB_GMaps_Database_Handler() );
	}

	private function add_hooks() {
		add_action( 'wp_ajax_save_map_data', array( $this, 'save_map_data' ) );
		add_action( 'wp_ajax_save_marker_data', array( $this, 'save_marker_data' ) );
		add_action( 'wp_ajax_delete_marker_data', array( $this, 'delete_marker_data' ) );
	}

	public function save_map_data() {
		if( isset( $_POST['map'] ) && ! empty( $_POST['map'] ) ) {
			$this->db_handler->save_map( $_POST['map'] );
		}
		if( isset( $_POST['markers'] ) && ! empty( $_POST['markers'] ) && is_array( $_POST['markers'] ) ) {
			foreach ( $_POST['markers'] as $marker_args ) {
				$marker_args['uniqueness'] = md5( "{$marker_args['lat']}{$marker_args['lng']}" );
				$this->db_handler->save_marker( $marker_args );
			}
		}
		wp_die();
	}

	public function save_marker_data() {
		if( isset( $_POST['marker'] ) && ! empty( $_POST['marker'] ) ) {
			$marker_args = $_POST['marker'];
			if( ! isset( $marker_args['uniqueness'] ) ) {
				$marker_args['uniqueness'] = md5( "{$marker_args['lat']}{$marker_args['lng']}" );
			}
			wp_send_json( $this->get_db_handler()->save_marker( $marker_args ) );
		}
		wp_die();
	}

	public function delete_marker_data() {
		if( isset( $_POST['marker'] ) ) {
			$marker_args = $_POST['marker'];
			if( ! isset( $marker_args['uniqueness'] ) ) {
				$marker_args['uniqueness'] = md5( "{$marker_args['lat']}{$marker_args['lng']}" );
			}
			wp_send_json( $this->get_db_handler()->delete( $this->get_db_handler()->get_markers_table_name(), array( 'uniqueness' => $marker_args['uniqueness'] ) ) );
		}
		wp_die();
	}

	/**
	 * @return LB_GMaps_Database_Handler
	 */
	public function get_db_handler() {
		return $this->db_handler;
	}

	/**
	 * @param LB_GMaps_Database_Handler $db_handler
	 */
	public function set_db_handler( $db_handler ) {
		$this->db_handler = $db_handler;
	}

}