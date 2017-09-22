<?php

class LB_GMaps_Settings_Handler {
	private $option_name;

	private $submenu_slug;

	public function __construct() {
		$this->add_hooks();
		
		$this->option_name = 'lb-gmaps-option';
		$this->submenu_slug = 'lb-gmaps-settings';
	}
	
	private function add_hooks() {
		add_action( 'admin_init', array( $this, 'register_settings_init' ) );
		add_action( 'admin_menu', array( $this, 'create_settings_page' ) );
	}

	public function register_settings_init() {
		add_settings_section( $this->option_name, __( 'LB Google Maps', 'lb-gmaps' ), null, $this->submenu_slug );

		add_settings_field( 'lg-gmaps-api-key', __( 'Google Maps API Key' ), array( $this, 'render_field' ), $this->submenu_slug, $this->option_name );

		register_setting( $this->option_name, 'lg-gmaps-api-key' );
	}

	public function create_settings_page() {
		add_submenu_page( 'edit.php?post_type=lb-gmaps', 'LB GMaps Settings', 'Settings', 'manage_options', $this->submenu_slug, array( $this, 'register_settings_page' ) );
	}

	public function register_settings_page() {
		?>
		<form method="post" action="options.php">
			<?php do_settings_sections( $this->submenu_slug ); ?>
			<div class="submit-button">
				<?php submit_button( __( 'Save Changes', 'dxcrm' )  , 'primary' ); ?>
			</div>
			<?php settings_fields( $this->option_name ) ?>
		</form>
		<?php
	}
	
	public function render_field() {
		?>
		<div class="setting-container">
			<label for="api-key">Google Maps API Key</label>
			<input type="text" id="api-key" name="api-key">
		</div>
		<?php
	}
}