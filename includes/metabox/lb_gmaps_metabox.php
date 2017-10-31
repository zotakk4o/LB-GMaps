<div id="lb-gmaps-metabox">
	<div id="lb-gmaps-fields">
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-marker-popup" class="checkbox-label"><?php echo __( 'Enter fullscreen for higher precision', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-fullscreen">
		</div>
		<div class="lb-gmaps-form-group">
			<label for="lb-gmaps-map-markers"><?php echo __( 'Search Places', 'lb-gmaps' ) ?></label>
			<input type="text" id="lb-gmaps-map-markers">
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-full-width"><?php echo __( 'Full Width', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-full-width" <?php if( is_object( $this->get_map_data() ) ) { echo checked( $this->get_map_data()->width,'100%' ); } ?>>
		</div>
		<div class="lb-gmaps-form-group dimensions">
			<label for="lb-gmaps-map-width"><?php echo __( 'Width', 'lb-gmaps' ) ?></label>
			<input type="text" class="map-dimensions" id="lb-gmaps-map-width" value="<?php echo is_object( $this->get_map_data() ) ? $this->get_map_data()->width : '60%' ?>">
			<small class="lb-gmaps-tip"><?php echo __( 'Width in percents 
			                                            applies to current elements accordingly
			                                            and will look differently on different devices.', 'lb-gmaps' )?></small>
		</div>
		<div class="lb-gmaps-form-group dimensions">
			<label for="lb-gmaps-map-height"><?php echo __( 'Height', 'lb-gmaps' ) ?></label>
			<input type="text" class="map-dimensions" id="lb-gmaps-map-height" value="<?php echo is_object( $this->get_map_data() ) ? $this->get_map_data()->height : '800px' ?>">
			<small class="lb-gmaps-tip"><?php echo __( 'Height in percents 
			                                            applies to current elements accordingly 
			                                            and will look differently on different devices.', 'lb-gmaps' )?></small>
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
			<label class="map-controls" for="lb-gmaps-map-directions"><?php echo __( 'Route Directions', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-directions" <?php if( is_object( $this->get_map_data() ) ) { checked( $this->get_map_data()->directions,'true' ); }?>>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-route-searching-field"><?php echo __( 'Place Searching Field', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-route-searching-field" <?php if( is_object( $this->get_map_data() ) ) { checked( $this->get_map_data()->dir_searching_field,'true' ); }?>>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-means-of-transport"><?php echo __( 'Different Means of Transport', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-means-of-transport" <?php if( is_object( $this->get_map_data() ) ) { checked( $this->get_map_data()->dir_means_of_transport,'true' ); }?>>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-route-markers"><?php echo __( 'Markers on Route', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-route-markers" <?php if( is_object( $this->get_map_data() ) ) { checked( $this->get_map_data()->dir_route_markers,'true' ); }?>>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-waypoints-markers"><?php echo __( 'Markers on Waypoints', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-waypoints-markers" <?php if( is_object( $this->get_map_data() ) ) { checked( $this->get_map_data()->dir_waypoints_markers,'true' ); }?>>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-directions-infowindow"><?php echo __( 'Direction Routes Info Windows', 'lb-gmaps' ) ?></label>
			<input type="checkbox" id="lb-gmaps-map-directions-infowindow" <?php if( is_object( $this->get_map_data() ) ) { checked( $this->get_map_data()->dir_route_infowindow,'true' ); }?>>
		</div>
		<div class="lb-gmaps-form-group">
			<?php $this->add_control_select( 'zoom' ); ?>
		</div>
		<div class="lb-gmaps-form-group">
			<?php $this->add_control_select( 'street-view' ); ?>
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
					<option value="roadmap" <?php if( in_array( 'roadmap', $map_types ) ) echo 'selected=selected' ?>><?php echo __( 'roadmap', 'lb-gmaps' ) ?></option>
					<option value="satellite" <?php if( in_array( 'satellite', $map_types ) ) echo 'selected=selected' ?>><?php echo __( 'satellite', 'lb-gmaps' ) ?></option>
					<option value="hybrid" <?php if( in_array( 'hybrid', $map_types ) ) echo 'selected=selected' ?>><?php echo __( 'hybrid', 'lb-gmaps' ) ?></option>
					<option value="terrain" <?php if( in_array( 'terrain', $map_types ) ) echo 'selected=selected' ?>><?php echo __( 'terrain', 'lb-gmaps' ) ?></option>
				<?php else: ?>
					<option value="roadmap" selected>roadmap</option>
					<option value="satellite">satellite</option>
					<option value="hybrid">hybrid</option>
					<option value="terrain">terrain</option>
				<?php endif; ?>
			</select>
		</div>
		<div class="lb-gmaps-form-group lb-gmaps-styles-container">
			<label for="lb-gmaps-styles"><?php echo __( 'Add JSON format styles from ', 'lb-gmaps' ) ?><a target="_blank" href="https://mapstyle.withgoogle.com/"><?php  echo __( 'here', 'lb-gmaps' ) ?></a></label>
			<textarea id="lb-gmaps-styles"></textarea>
		</div>
	</div>
	<div id="lb-gmaps-live-preview" oncontextmenu="return false;"></div>
</div>