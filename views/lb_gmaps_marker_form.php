<div id="lb-gmaps-marker-form">
	<div class="lb-gmaps-marker-form-group">
		<label>
			Name*
			<input type="text" class="marker-field" name="marker_name" id="marker_name">
		</label>
	</div>
	<div class="lb-gmaps-marker-form-group">
		<input type="hidden" id="marker_media">
		<button type="button" id="marker-upload-media" class="button">Add Media</button>
		<button type="button" id="marker-clear-images" class="button hidden">Clear image selection</button>
	</div>
	<div class="lb-gmaps-marker-form-group description">
		<label>
			Description*
			<textarea class="marker-field" id="marker_content"></textarea>
		</label>
	</div>
	<div class="buttons-group">
		<button type="button" class="marker-button" id="save-button" disabled>Save Data</button>
		<button type="button" class="marker-button" id="cancel-button">Cancel</button>
	</div>
</div>