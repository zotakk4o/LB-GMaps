if( undefined === $ ) {
    var $ = jQuery.noConflict();
}
function initMap() {
    var markers = [];
    var mapAttributes = {
        post_id: post.ID
    };
    if( null !== data.map && 'object' === typeof data.map ) {
        var map = new google.maps.Map( document.getElementById( 'lb-gmap-live-preview' ), {
            center: { lat: parseFloat( data.map.lat ), lng: parseFloat( data.map.lng ) },
            zoom: parseFloat( data.map.zoom )
        });
    } else {
        var map = new google.maps.Map( document.getElementById( 'lb-gmap-live-preview' ), {
            center: {lat: 45.40338, lng: 10.17403},
            zoom: 3
        });
    }

    if( 0 !== data.markers.length ) {
        for ( var i = 0; i < data.markers.length; i++ ) {
            if( 'object' === typeof data.markers[ i ] ) {
                var marker = new google.maps.Marker({
                    name: data.markers[ i ].name,
                    description: data.markers[ i ].content,
                    map: map
                });
                marker.setPosition( {
                    lat: parseFloat( data.markers[ i ].lat ),
                    lng: parseFloat( data.markers[ i ].lng )
                } );
                var content = $( views.infoBox );
                if( null !== marker.name && null !== marker.description ) {
                    if( null !== marker.name ) {
                        content.find( '#lb-gmaps-marker-name' ).text( marker.name );
                    }
                    if( null !== marker.description ) {
                        content.find( '#lb-gmaps-marker-description' ).text( marker.description );
                    }
                    var textContent = content[0].outerHTML;
                    var infowindow = new google.maps.InfoWindow();
                    google.maps.event.addListener( marker, 'click', ( function( marker, content, infowindow ) {
                        return function() {
                            infowindow.setContent( content );
                            infowindow.open( map, marker );
                        };
                    } )( marker, textContent, infowindow) );
                }
            }
        }
    }



    var input = document.getElementById( 'lb-gmap-map-markers' );

    var autocomplete = new google.maps.places.Autocomplete( input );
    autocomplete.bindTo('bounds', map);
    autocomplete.addListener( 'place_changed', function() {
        if( ! $( '#lb-gmap-map-marker-popup' ).is( ':checked' ) ) {
            var dialog = $( views.dialogBox );
            dialog.insertAfter( '#lb-gmap-fields' );
        }

        $( '#yes' ).on( 'click', function () {
            var marker = new google.maps.Marker({
                map: map
            });

            marker.setPosition( place.geometry.location);
            dialog.remove();
            var markerObject = {
                post_id: post.ID,
                lat: marker.position.lat(),
                lng: marker.position.lng()
            };
            markers.push( markerObject );

            var markerForm = $( views.form );

            markerForm.insertAfter( '#lb-gmap-fields' );

            $( '#cancel-button' ).on( 'click', function () {
                markerForm.remove();
            } );

            $( '#save-button' ).on( 'click', function () {
                markerObject.name = $.trim( $( '#marker_name' ).val() );
                markerObject.content = $.trim( $( '#marker_description' ).val() );

                $.ajax( {
                    type: "POST",
                    url: admin.ajaxURL,
                    data: {
                        action: 'save_marker_data',
                        marker: markerObject
                    }
                } ).then( function () {
                    markerForm.remove();
                } );

            } );
        } );
        $( '#no' ).on( 'click',function () {
            dialog.remove();
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
    });

    $( '#publish' ).on( 'click', function ( e ) {
        mapAttributes.lat = map.getCenter().lat();
        mapAttributes.lng = map.getCenter().lng();
        mapAttributes.zoom = map.getZoom();
        $.ajax( {
            type: "POST",
            url: admin.ajaxURL,
            data: {
                action: 'save_map_data',
                map: mapAttributes,
                markers: markers
            }
        } );
    } )
}