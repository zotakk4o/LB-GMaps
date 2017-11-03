function initMap() {
    //If shortcode contains some data - process it
    if( typeof data !== 'undefined' ) {
        var markers = [];
        $( '#lb-gmaps-front-end' ).css( {width: data.map.width, height: data.map.height} );

        var map = new google.maps.Map(document.getElementById( 'lb-gmaps-front-end' ), parseMapData( data.map ) );

        var directionSettings = getMapDirectionsDefaults( map );
        directionSettings.options = parseDirectionsOptions( data.map );

        for ( var i = 0; i < data.markers.length; i++ ) {
            if ('object' === typeof data.markers[i]) {
                var marker = new google.maps.Marker( parseMarkerData( data.markers[ i ] ) );
                marker.setPosition( new google.maps.LatLng( marker.lat, marker.lng ) );
                marker.setMap( map );
                displayInfoWindow( map, marker, false );
                markers.push( marker );
            }
        }

        if( 'true' === data.map.dir_searching_field ) {
            $( '#lb-gmaps-front-end' ).append( helperViews.searchingField );
            handleSearchingField( map );
        }

        mapDirections( map, markers, directionSettings );

    }
}