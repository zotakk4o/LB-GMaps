<?php

class LB_GMaps_Post_Type {

	public function __construct() {
		$this->add_hooks();
	}

	private function add_hooks() {
		if( ! post_type_exists( LB_GMAPS_POST_TYPE ) ) {
			add_action( 'init', array( $this, 'register' ) );
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
}