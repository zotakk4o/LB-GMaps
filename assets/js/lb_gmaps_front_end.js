function initMap() {
    var map = new google.maps.Map( document.getElementById( 'lb-gmaps-front-end' ), parseMapData( data.map ) );
    $( '#lb-gmaps-front-end' ).css({width: '600px', height: '600px'});

    for ( var i = 0; i < data.markers.length; i++ ) {
        if( 'object' === typeof data.markers[ i ] ) {
            var marker = new google.maps.Marker( parseMarkerData( data.markers[ i ] ) );
            marker.setPosition( new google.maps.LatLng( marker.lat , marker.lng ) );
            marker.setMap( map );
            displayInfoWindow( map, marker );
        }
    }
}