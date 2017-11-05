<?php

class LB_GMaps_Ajaxer {

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
		$this->register_db_handler();
	}

	private function register_db_handler() {
		$this->get_helper()->include_file( 'includes/database-tools/lb_gmaps_database_handler' );
		$this->set_db_handler( new LB_GMaps_Database_Handler() );
	}

	private function add_hooks() {
		add_action( 'wp_ajax_save_map_data', array( $this, 'save_map_data' ) );
		add_action( 'wp_ajax_save_marker_data', array( $this, 'save_marker_data' ) );
		add_action( 'wp_ajax_delete_marker_data', array( $this, 'delete_marker_data' ) );
		add_action( 'wp_ajax_get_maps_data', array( $this, 'get_maps_data' ) );
		add_action( 'wp_ajax_transfer_marker', array( $this, 'transfer_marker' ) );
	}

	public function save_map_data() {
		check_ajax_referer( 'programming-is-funny', 'security', true );
		if( isset( $_POST['map'] ) && ! empty( $_POST['map'] ) ) {
			$this->db_handler->save_map( $_POST['map'] );
		}

		if( isset( $_POST['markers'] ) && ! empty( $_POST['markers'] ) && is_array( $_POST['markers'] ) ) {
			foreach ( $_POST['markers'] as $marker_args ) {
				$marker_args['uniqueness'] = md5( "{$marker_args['lat']}{$marker_args['lng']}{$marker_args['post_id']}" );
				$this->db_handler->save_marker( $marker_args );
			}
		}

		wp_die();
	}

	public function transfer_marker() {
		check_ajax_referer( 'programming-is-funny', 'security', true );
		if( isset( $_POST['map_id'] ) && isset( $_POST['marker'] ) && ! empty( $_POST['marker'] ) ) {
			$marker_args = $_POST['marker'];
			$marker_args['post_id'] = $_POST['map_id'];
			$marker_args['uniqueness'] = md5( "{$marker_args['lat']}{$marker_args['lng']}{$marker_args['post_id']}" );
			wp_send_json( $this->get_db_handler()->save_marker( $marker_args ) );
		}
		wp_die();
	}

	public function get_maps_data() {
		$posts = get_posts( array(
			'post_type' => LB_GMAPS_POST_TYPE,
			'posts_per_page' => -1
		) );

		if( ! empty( $posts ) ) {
			wp_send_json( $posts );
		}
		wp_die();
	}

	public function save_marker_data() {
		check_ajax_referer( 'programming-is-funny', 'security', true );
		if( isset( $_POST['marker'] ) && ! empty( $_POST['marker'] ) ) {
			$marker_args = $_POST['marker'];
			$marker_args['uniqueness'] = md5( "{$marker_args['lat']}{$marker_args['lng']}{$marker_args['post_id']}" );
			wp_send_json( $this->get_db_handler()->save_marker( $marker_args ) );
		}
		wp_die();
	}

	public function delete_marker_data() {
		check_ajax_referer( 'programming-is-funny', 'security', true );
		if( isset( $_POST['marker'] ) ) {
			$marker_args = $_POST['marker'];
			$marker_args['uniqueness'] = md5( "{$marker_args['lat']}{$marker_args['lng']}{$marker_args['post_id']}" );
			wp_send_json( $this->get_db_handler()->delete( $this->get_db_handler()->get_markers_table_name(), array( 'uniqueness' => $marker_args['uniqueness'], 'post_id' => $marker_args['post_id'] ) ) );
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