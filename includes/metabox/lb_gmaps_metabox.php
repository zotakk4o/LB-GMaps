<div id="lb-gmaps-metabox">
	<div id="lb-gmaps-fields">
		<div class="lb-gmaps-form-group">
			<label for="lb-gmaps-map-marker-popup"><?php echo __( 'Prevent place popup from displaying', 'lb-gmaps' ) ?></label>
			<input type="checkbox" name="lb-gmaps-map-marker-popup" id="lb-gmaps-map-marker-popup">
		</div>
		<div class="lb-gmaps-form-group">
			<label for="lb-gmaps-map-markers"><?php echo __( 'Search Places', 'lb-gmaps' ) ?></label>
			<input type="text" name="lb-gmaps-map-markers" id="lb-gmaps-map-markers">
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-full-width"><?php echo __( 'Full Width', 'lb-gmaps' ) ?></label>
			<input type="checkbox" name="lb-gmaps-map-full-width" id="lb-gmaps-map-full-width" <?php checked( $this->get_map_data()->gesture_handling,'true' ) ?>>
		</div>
		<div class="lb-gmaps-form-group">
			<label for="lb-gmaps-map-width"><?php echo __( 'Width', 'lb-gmaps' ) ?></label>
			<input type="number" class="map-dimensions" name="lb-gmaps-map-width" id="lb-gmaps-map-width" placeholder="<?php echo __( 'Enter Width', 'lb-gmaps' ) ?>">
		</div>
		<div class="lb-gmaps-form-group">
			<label for="lb-gmaps-map-height"><?php echo __( 'Height', 'lb-gmaps' ) ?></label>
			<input type="number" class="map-dimensions" name="lb-gmaps-map-height" id="lb-gmaps-map-height" placeholder="<?php echo __( 'Enter Height', 'lb-gmaps' ) ?>">
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-gesture-handling"><?php echo __( 'Gestures Handling', 'lb-gmaps' ) ?></label>
			<input type="checkbox" name="lb-gmaps-map-gesture-handling" id="lb-gmaps-map-gesture-handling" <?php checked( $this->get_map_data()->gesture_handling,'greedy' ) ?>>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-scale-control"><?php echo __( 'Scale Control', 'lb-gmaps' ) ?></label>
			<input type="checkbox" name="lb-gmaps-map-scale-control" id="lb-gmaps-map-scale-control" <?php checked( $this->get_map_data()->scale_control,'true' ) ?>>
		</div>
		<div class="lb-gmaps-form-group">
			<?php $this->add_control_select( 'zoom' ); ?>
		</div>
		<div class="lb-gmaps-form-group">
			<?php $this->add_control_select( 'street-view' ); ?>
		</div>
		<div class="lb-gmaps-form-group">
			<?php $this->add_control_select( 'rotate' ); ?>
		</div>
		<div class="lb-gmaps-form-group">
			<?php $this->add_control_select( 'fullscreen' ); ?>
		</div>
		<div class="lb-gmaps-form-group">
			<?php $this->add_control_select( 'map-type' ); ?>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-types"><?php echo __( 'Map Types', 'lb-gmaps' ) ?></label>
			<select name="lb-gmaps-map-types" id="lb-gmaps-map-types" multiple>
				<?php if( null !== $this->get_map_data() && isset( $this->get_map_data()->map_types ) ) :
					$map_types = explode( ', ', $this->get_map_data()->map_types );
					?>
					<option value="roadmap" <?php if( in_array( 'roadmap', $map_types ) ) echo 'selected=selected' ?>>roadmap</option>
					<option value="satellite" <?php if( in_array( 'satellite', $map_types ) ) echo 'selected=selected' ?>>satellite</option>
					<option value="hybrid" <?php if( in_array( 'hybrid', $map_types ) ) echo 'selected=selected' ?>>hybrid</option>
					<option value="terrain" <?php if( in_array( 'terrain', $map_types ) ) echo 'selected=selected' ?>>terrain</option>
				<?php else: ?>
					<option value="roadmap" selected>roadmap</option>
					<option value="satellite">satellite</option>
					<option value="hybrid">hybrid</option>
					<option value="terrain">terrain</option>
				<?php endif; ?>
			</select>
		</div>
	</div>
	<div id="lb-gmaps-live-preview"></div>
</div>