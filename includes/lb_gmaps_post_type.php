<?php

class LB_GMaps_Post_Type {

	/**
	 * @var LB_GMaps_Helper
	 */
	private $helper;

	public function __construct( $helper ) {
		$this->add_hooks();
		$this->set_helper( $helper );
	}

	private function add_hooks() {
		if( ! post_type_exists( LB_GMAPS_POST_TYPE ) ) {
			add_action( 'init', array( $this, 'register' ) );
			add_action( 'deleted_post', array( $this, 'delete_data_permanently' ) );
			add_action('manage_'.LB_GMAPS_POST_TYPE.'_posts_custom_column', array($this,'handle_custom_columns'), 10, 2);
			add_filter('manage_'.LB_GMAPS_POST_TYPE.'_posts_columns', array($this,'add_new_columns'));
		}
	}

	public function register() {
		$labels = array(
			'name'				=> __('LB GMaps','lb-gmaps'),
			'singular_name' 	=> __('LB GMap','lb-gmaps'),
			'add_new' 			=> __('Add LB GMap','lb-gmaps'),
			'add_new_item' 		=> __('Add New LB Gmap','lb-gmaps'),
			'edit_item' 		=> __('Edit LB GMap','lb-gmaps'),
			'new_item' 			=> __('New LB GMap','lb-gmaps'),
			'all_items' 		=> __('LB GMaps','lb-gmaps'),
			'view_item' 		=> __('View LB GMap','lb-gmaps'),
			'search_items' 		=> __('Search LB GMap','lb-gmaps'),
			'not_found' 		=> __('No LB GMap found','lb-gmaps'),
			'not_found_in_trash'=> __('No LB GMap found in Trash','lb-gmaps'),
			'parent_item_colon' => '',
			'menu_name' => __('LB GMaps','dxcrm'),
		);
		$args = array(
			'labels' 			=> $labels,
			'public' 			=> false,
			'publicly_queryable'=> true,
			'show_ui' 			=> true,
			'show_in_menu' 		=> true,
			'menu_icon'         => LB_GMAPS_IMAGES . 'google-maps-icon.png',
			'query_var' 		=> true,
			'rewrite' 			=> array( 'slug' => LB_GMAPS_POST_TYPE ),
			'capability_type' 	=> 'post',
			'map_meta_cap' 		=> true,
			'has_archive' 		=> true,
			'hierarchical' 		=> false,
			'supports' 			=> array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments' )
		);

		register_post_type( LB_GMAPS_POST_TYPE, $args );
	}

	public function handle_custom_columns( $column, $post_id ) {
		switch ( $column ) {
			case 'shortcode':
				echo "[lb-gmaps id='$post_id']";
		}
	}

	public function add_new_columns( $columns ) {
		unset( $columns['comments'] );
		$new_columns = array(
			'shortcode' => __('Shortcode', 'lb-gmaps'),
		);
		return array_merge($columns, $new_columns);
	}

	public function delete_data_permanently( $post_id ) {
		$this->get_helper()->include_file( 'includes/database-tools/lb_gmaps_database_handler' );
		$db_handler = new LB_GMaps_Database_Handler();

		$db_handler->delete( $db_handler->get_maps_table_name(), array( 'post_id' => $post_id ) );
		$db_handler->delete( $db_handler->get_markers_table_name(), array( 'post_id' => $post_id ) );
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