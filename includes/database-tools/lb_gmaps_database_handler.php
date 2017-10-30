<?php

class LB_GMaps_Database_Handler {

	private $database;

	private $markers_table_name;

	private $maps_table_name;

	public function __construct() {
		global $wpdb;
		$this->set_database( $wpdb );
		$this->set_maps_table_name( $this->get_database()->prefix . 'lb_gmaps' );
		$this->set_markers_table_name( $this->get_database()->prefix . 'lb_gmaps_markers' );
	}

	public function create_tables() {
		$charset_collate = $this->get_database()->get_charset_collate();

		$markers_sql = "CREATE TABLE IF NOT EXISTS {$this->get_markers_table_name()} (
			uniqueness VARCHAR(100) NOT NULL,
			post_id mediumint(9) NOT NULL,
			lng VARCHAR(100) NOT NULL,
			lat VARCHAR(100) NOT NULL,
			name VARCHAR(100) NULL,
			content text NULL,
			PRIMARY KEY (uniqueness)
		) $charset_collate;";

		$maps_sql = "CREATE TABLE IF NOT EXISTS {$this->get_maps_table_name()} (
			post_id mediumint(9) NOT NULL,
			lng VARCHAR(50) NOT NULL,
			lat VARCHAR(50) NOT NULL,
			zoom VARCHAR(10) NOT NULL,
			zoom_control VARCHAR(10) NULL,
			gesture_handling VARCHAR(20) NULL,
			scale_control VARCHAR(10) NULL,
			street_view_control VARCHAR(10) NULL,
			rotate_control VARCHAR(10) NULL,
			fullscreen_control VARCHAR(10) NULL,
			map_type_control VARCHAR(10) NULL,
			map_types VARCHAR(20) NULL,
			width VARCHAR(10) NOT NULL DEFAULT \"50%\",
			height VARCHAR(10) NOT NULL DEFAULT \"800px\",
			directions VARCHAR(10) NULL,
			dir_searching_field VARCHAR(10) NULL,
			dir_means_of_transport VARCHAR(10) NULL,
			dir_route_markers VARCHAR(10) NULL,
			dir_route_infowindow VARCHAR(10) NULL,
			dir_waypoints_markers VARCHAR(10) NULL,
			PRIMARY KEY (post_id)
		) $charset_collate;";

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

		dbDelta( $markers_sql );
		dbDelta( $maps_sql );
	}

	public function save_marker( $args ) {
		return $this->get_database()->replace( $this->get_markers_table_name(), $args );
	}

	public function save_map( $args ) {
		return $this->get_database()->replace( $this->get_maps_table_name(), $args );
	}

	public function delete( $table, $where ) {
		return $this->get_database()->delete( $table, $where );
	}

	public function get_row_by_post_id( $table, $id ) {
		return $this->get_database()->get_row( "SELECT * FROM $table WHERE post_id = $id", OBJECT );
	}

	public function get_rows_by_post_id( $table, $id ) {
		return $this->get_database()->get_results( $this->get_database()->prepare( "SELECT * FROM $table WHERE post_id = %d", $id ) );
	}

	public function get_table_rows( $table ) {
		return $this->get_database()->get_results( "SELECT * FROM $table" );
	}

	/**
	 * @return QM_DB|wpdb
	 */
	public function get_database() {
		return $this->database;
	}

	/**
	 * @return string
	 */
	public function get_markers_table_name() {
		return $this->markers_table_name;
	}

	/**
	 * @return string
	 */
	public function get_maps_table_name() {
		return $this->maps_table_name;
	}

	/**
	 * @param QM_DB|wpdb $database
	 */
	public function set_database( $database ) {
		$this->database = $database;
	}

	/**
	 * @param string $markers_table_name
	 */
	public function set_markers_table_name( $markers_table_name ) {
		$this->markers_table_name = $markers_table_name;
	}

	/**
	 * @param string $maps_table_name
	 */
	public function set_maps_table_name( $maps_table_name ) {
		$this->maps_table_name = $maps_table_name;
	}




}
