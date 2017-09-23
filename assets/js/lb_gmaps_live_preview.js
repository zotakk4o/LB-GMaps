if( undefined === $ ) {
    var $ = jQuery.noConflict();
}
function initMap() {
    map = new google.maps.Map( document.getElementById( 'lb-gmap-live-preview' ), {
        center: {lat: 45.40338, lng: 10.17403},
        zoom: 3
    });

    var input = document.getElementById( 'lb-gmap-map-markers' );

    var autocomplete = new google.maps.places.Autocomplete( input );
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener( 'place_changed', function() {
        var dialog = $( views.dialogBox );
        dialog.insertAfter( '#lb-gmap-fields' );

        $( '#yes' ).on( 'click', function () {
            var marker = new google.maps.Marker({
                map: map,
                anchorPoint: new google.maps.Point(0, -29)
            });

            marker.addListener("dblclick", function() {
                marker.setMap(null);
            });

            marker.setPosition( place.geometry.location);
            dialog.hide();
        } );
        $( '#no' ).on( 'click',function () {
            dialog.hide();
        } );


        var place = autocomplete.getPlace();
        if ( ! place.geometry ) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if ( place.geometry.viewport ) {
            map.fitBounds( place.geometry.viewport );
        } else {
            map.setCenter( place.geometry.location );
        }

        var address = '';
        if ( place.address_components ) {
            address = [
                ( place.address_components[0] && place.address_components[0].short_name || '' ),
                ( place.address_components[1] && place.address_components[1].short_name || '' ),
                ( place.address_components[2] && place.address_components[2].short_name || '' )
            ].join(' ');
        }
        console.log(map);
    });
}