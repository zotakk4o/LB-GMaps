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
			<label class="map-controls" for="lb-gmaps-map-scale-control"><?php echo __( 'Scale Control', 'lb-gmaps' ) ?></label>
			<input type="checkbox" name="lb-gmaps-map-scale-control" id="lb-gmaps-map-scale-control">
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-zoom-control"><?php echo __( 'Zoom Control', 'lb-gmaps' ) ?></label>
			<select name="lb-gmaps-map-zoom-control" id="lb-gmaps-map-zoom-control">
				<option value="choose">Choose...</option>
				<option value="TOP_LEFT">Top Left</option>
				<option value="TOP_RIGHT">Top Right</option>
				<option value="TOP_CENTER">Top Center</option>
				<option value="LEFT_TOP">Left Top</option>
				<option value="LEFT_CENTER">Left Center</option>
				<option value="LEFT_BOTTOM">Left Bottom</option>
				<option value="RIGHT_TOP">Right Top</option>
				<option value="RIGHT_CENTER">Right Center</option>
				<option value="RIGHT_BOTTOM">Right Bottom</option>
				<option value="BOTTOM_LEFT">Bottom Left</option>
				<option value="BOTTOM_RIGHT">Bottom Right</option>
				<option value="BOTTOM_CENTER">Bottom Center</option>
			</select>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-street-view-control"><?php echo __( 'Street View Control', 'lb-gmaps' ) ?></label>
			<select name="lb-gmaps-map-street-view-control" id="lb-gmaps-map-street-view-control">
				<option value="choose">Choose...</option>
				<option value="TOP_LEFT">Top Left</option>
				<option value="TOP_RIGHT">Top Right</option>
				<option value="TOP_CENTER">Top Center</option>
				<option value="LEFT_TOP">Left Top</option>
				<option value="LEFT_CENTER">Left Center</option>
				<option value="LEFT_BOTTOM">Left Bottom</option>
				<option value="RIGHT_TOP">Right Top</option>
				<option value="RIGHT_CENTER">Right Center</option>
				<option value="RIGHT_BOTTOM">Right Bottom</option>
				<option value="BOTTOM_LEFT">Bottom Left</option>
				<option value="BOTTOM_RIGHT">Bottom Right</option>
				<option value="BOTTOM_CENTER">Bottom Center</option>
			</select>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-rotate-control"><?php echo __( 'Rotate Control', 'lb-gmaps' ) ?></label>
			<select name="lb-gmaps-map-rotate-control" id="lb-gmaps-map-rotate-control">
				<option value="choose">Choose...</option>
				<option value="TOP_LEFT">Top Left</option>
				<option value="TOP_RIGHT">Top Right</option>
				<option value="TOP_CENTER">Top Center</option>
				<option value="LEFT_TOP">Left Top</option>
				<option value="LEFT_CENTER">Left Center</option>
				<option value="LEFT_BOTTOM">Left Bottom</option>
				<option value="RIGHT_TOP">Right Top</option>
				<option value="RIGHT_CENTER">Right Center</option>
				<option value="RIGHT_BOTTOM">Right Bottom</option>
				<option value="BOTTOM_LEFT">Bottom Left</option>
				<option value="BOTTOM_RIGHT">Bottom Right</option>
				<option value="BOTTOM_CENTER">Bottom Center</option>
			</select>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-fullscreen-control"><?php echo __( 'Fullscreen Control', 'lb-gmaps' ) ?></label>
			<select name="lb-gmaps-map-fullscreen-control" id="lb-gmaps-map-fullscreen-control">
				<option value="choose">Choose...</option>
				<option value="TOP_LEFT">Top Left</option>
				<option value="TOP_RIGHT">Top Right</option>
				<option value="TOP_CENTER">Top Center</option>
				<option value="LEFT_TOP">Left Top</option>
				<option value="LEFT_CENTER">Left Center</option>
				<option value="LEFT_BOTTOM">Left Bottom</option>
				<option value="RIGHT_TOP">Right Top</option>
				<option value="RIGHT_CENTER">Right Center</option>
				<option value="RIGHT_BOTTOM">Right Bottom</option>
				<option value="BOTTOM_LEFT">Bottom Left</option>
				<option value="BOTTOM_RIGHT">Bottom Right</option>
				<option value="BOTTOM_CENTER">Bottom Center</option>
			</select>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-map-type-control"><?php echo __( 'Map Type Control', 'lb-gmaps' ) ?></label>
			<select name="lb-gmaps-map-map-type-control" id="lb-gmaps-map-map-type-control">
				<option value="choose">Choose...</option>
				<option value="TOP_LEFT">Top Left</option>
				<option value="TOP_RIGHT">Top Right</option>
				<option value="TOP_CENTER">Top Center</option>
				<option value="LEFT_TOP">Left Top</option>
				<option value="LEFT_CENTER">Left Center</option>
				<option value="LEFT_BOTTOM">Left Bottom</option>
				<option value="RIGHT_TOP">Right Top</option>
				<option value="RIGHT_CENTER">Right Center</option>
				<option value="RIGHT_BOTTOM">Right Bottom</option>
				<option value="BOTTOM_LEFT">Bottom Left</option>
				<option value="BOTTOM_RIGHT">Bottom Right</option>
				<option value="BOTTOM_CENTER">Bottom Center</option>
			</select>
		</div>
		<div class="lb-gmaps-form-group">
			<label class="map-controls" for="lb-gmaps-map-types"><?php echo __( 'Map Types', 'lb-gmaps' ) ?></label>
			<select name="lb-gmaps-map-types" id="lb-gmaps-map-types" multiple>
				<option value="roadmap" selected>roadmap</option>
				<option value="satellite">satellite</option>
				<option value="hybrid">hybrid</option>
				<option value="terrain">terrain</option>
			</select>
		</div>
	</div>
	<div id="lb-gmaps-live-preview"></div>
</div>