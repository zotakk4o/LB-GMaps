<div id="lb-gmaps-metabox">
	<div id="lb-gmaps-fields">
		<div class="lb-gmaps-form-group">
			<label for="lb-gmaps-map-marker-popup"><?php echo __( 'Prevent place popup from displaying', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-marker-popup">
		</div>
		<div class="lb-gmaps-form-group">
			<label for="lb-gmaps-map-markers"><?php echo __( 'Search Places', 'lb-gmaps' ) ?></label>
			<input type="text" id="lb-gmaps-map-markers">
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-full-width"><?php echo __( 'Full Width', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-full-width" <?php if( is_object( $this->get_map_data() ) ) { checked( $this->get_map_data()->gesture_handling,'true' ); } ?>>
			<small class="lb-gmaps-tip"><?php echo __( 'If you have parts of the map in grey, tick the "Gesture Handling" option and retick if you don\'t want it.', 'lb-gmaps' )?></small>
		</div>
		<div class="lb-gmaps-form-group dimensions">
			<label for="lb-gmaps-map-width"><?php echo __( 'Width', 'lb-gmaps' ) ?></label>
			<input type="text" class="map-dimensions" id="lb-gmaps-map-width" value="50%">
			<small class="lb-gmaps-tip"><?php echo __( 'Width in percents will 
			                                            apply to current elements accordingly and may look differently on your page.', 'lb-gmaps' )?></small>
		</div>
		<div class="lb-gmaps-form-group dimensions">
			<label for="lb-gmaps-map-height"><?php echo __( 'Height', 'lb-gmaps' ) ?></label>
			<input type="text" class="map-dimensions" id="lb-gmaps-map-height" value="800px">
			<small class="lb-gmaps-tip"><?php echo __( 'Height in percents will 
			                                            apply to current elements accordingly and may look differently on your page.', 'lb-gmaps' )?></small>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-gesture-handling"><?php echo __( 'Gestures Handling', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-gesture-handling" <?php if( is_object( $this->get_map_data() ) ) { checked( $this->get_map_data()->gesture_handling,'greedy' ); }?>>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-scale-control"><?php echo __( 'Scale Control', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-scale-control" <?php if( is_object( $this->get_map_data() ) ) { checked( $this->get_map_data()->scale_control,'true' ); }?>>
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
			<select id="lb-gmaps-map-types" multiple>
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