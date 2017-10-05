if( undefined === $ ) {
    var $ = jQuery.noConflict();
}
function initMap() {
    var markers = [];
    if( null !== data.map && 'object' === typeof data.map ) {
        var map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), parseMapData( data.map ) );
    } else {
        var map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), {
            center: {lat: 45.40338, lng: 10.17403},
            zoom: 3,
            disableDefaultUI: true,
            gestureHandling: 'none'
        });
    }

    if( 0 !== data.markers.length ) {
        for ( var i = 0; i < data.markers.length; i++ ) {
            if( 'object' === typeof data.markers[ i ] ) {
                var marker = new google.maps.Marker( parseMarkerData( data.markers[ i ] ) );
                marker.setPosition( new google.maps.LatLng( marker.lat , marker.lng ) );
                marker.setMap( map );
                displayInfoWindow( map, marker );
            }
        }
    }

    postFormHandler();

    map.addListener( 'dblclick', function ( event ) {
        createMarker( map, event.latLng );
    } );

    $( '#publish' ).on( 'click', function ( e ) {
        var mapAttributes = getMapAttributes( map );
        e.preventDefault();
        $.ajax( {
            type: "POST",
            url: admin.ajaxURL,
            data: {
                action: 'save_map_data',
                map: JSON.stringify( map ),
                markers: markers
            }
        } );
    } );

    function createMarker( map, location ) {
        var marker = new google.maps.Marker({
            map: map
        });

        marker.setPosition( location );

        var markerObject = {
            post_id: post.ID,
            lat: marker.position.lat(),
            lng: marker.position.lng()
        };
        showMarkerForm( map, marker );
        markers.push( markerObject );
    }

    function postFormHandler() {

        var input = document.getElementById( 'lb-gmaps-map-markers' );

        var autocomplete = new google.maps.places.Autocomplete( input );
        autocomplete.bindTo('bounds', map);
        autocomplete.addListener( 'place_changed', function() {
            if( ! $( '#lb-gmaps-map-marker-popup' ).is( ':checked' ) ) {
                var dialog = $( views.dialogBox );
                dialog.insertAfter( '#lb-gmaps-fields' );
            }

            $( '#yes' ).on( 'click', function () {
                dialog.remove();
                createMarker( map, place.geometry.location );
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

        $( '#lb-gmaps-map-gestures-handling' ).on( 'change', function ( e ) {
            if( e.target.checked ) {
                map.set( 'gestureHandling', 'greedy' );
            } else {
                map.set( 'gestureHandling', 'none' );
            }
            map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), map );
        } );

        $( '#lb-gmaps-map-draggable' ).on( 'change', function ( e ) {
            if( e.target.checked ) {
                map.set( 'draggable', true );
            } else {
                map.set( 'draggable', false );
            }
            map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), map );
            console.log(map);
        } );

        var mapTypes = $( '#lb-gmaps-map-types' );
        mapTypes.parent().hide();

        $( '#lb-gmaps-map-scale-control' ).on( 'change', function ( e ) {
            map.scaleControl = e.target.checked;
            map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), map );
        } );

        var controls = $( '#lb-gmaps-fields select:not( [multiple] )' );
        for ( var i = 0; i < controls.length; i++ ) {
            var selectDropdown = $( controls[ i ] );
            selectDropdown.on( 'change', function ( e ) {
                var value = $( e.target ).find( 'option:selected' ).val();
                var controlType = e.target.id
                    .replace( 'lb-gmaps-map-', '' )
                    .split( '-' )
                    .map( ( x ) => {
                        return x[0].toUpperCase() + x.slice( 1 );
                    } )
                    .join( '' );
                controlType = controlType[0].toLowerCase() + controlType.slice( 1 );
                if( value !== 'choose' ) {
                    map[ controlType ] = true;
                    if( 'mapTypeControl' === controlType ) {
                        mapTypes.parent().show();
                    }
                    // Check if the corresponding control has already had its options set
                    if( typeof  map[ controlType + 'Options' ] === 'object' ) {
                        map[ controlType + 'Options' ]['position'] = google.maps.ControlPosition[ value ];
                    } else {
                        map[ controlType + 'Options' ] = { position: google.maps.ControlPosition[ value ] };
                        if( 'mapTypeControl' === controlType ) {
                            map[ controlType + 'Options' ]['mapTypeIds'] = ['roadmap'];
                            $( '#lb-gmaps-map-types' ).find( 'option[value=roadmap]' ).prop( 'selected', true );
                        }
                    }
                    map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), map );
                } else {
                    if( 'mapTypeControl' === controlType ) {
                        $( '#lb-gmaps-map-types' ).parent().hide();
                    }
                    map[ controlType ] = false;
                    map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), map );
                }
            } );
        }

        mapTypes.on( 'change', function ( e ) {
            var selectedOptions = $( e.target ).find( 'option:selected' );
            var ids = [];
            for ( var i = 0; i < selectedOptions.length; i++ ) {
               ids.push( $( selectedOptions[ i ] ).val() );
            }

            if( typeof map.mapTypeControlOptions === 'object' ) {
                map.mapTypeControlOptions.mapTypeIds = ids;
            } else {
                map.mapTypeControlOptions = {
                    mapTypeIds : ids
                }
            }

            if( 0 === ids.length ) {
                mapTypes.parent().hide();
                $( '#lb-gmaps-map-map-type-control' ).find( 'option[value=choose]' ).prop( 'selected', true );
                delete map.mapTypeControl;
                delete map.mapTypeControlOptions;
            }

            map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), map );
        } );
    }
}

function styleInfowindow( infowindow ) {
    google.maps.event.addListener( infowindow, 'domready', function() {

        // Reference to the DIV that wraps the bottom of infowindow
        var iwOuter = $('.gm-style-iw');
        iwOuter.parent().css({'width': iwOuter.css('width'), 'height': iwOuter.css('height') });

        /* Since this div is in a position prior to .gm-div style-iw.
         * We use jQuery and create a iwBackground variable,
         * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
         */
        var iwBackground = iwOuter.prev();

        // Removes background shadow DIV
        iwBackground.children(':nth-child(2)').css({'display' : 'none'});

        // Removes white background DIV
        iwBackground.children(':nth-child(4)').css({'display' : 'none'});

        // Changes the desired tail shadow color.
        iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

        // Reference to the div that groups the close button elements.
        var iwCloseBtn = iwOuter.next();

        // Apply the desired effect to the close button
        iwCloseBtn.css({opacity: '1', top: '0' , right: '-35px', border: '7px solid #417DF1', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});

        // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
        if($('#lb-gmaps-marker-description').height() < 140){
            $('#lb-gmaps-marker-gradient ').css({display: 'none'});
        }

        // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
        iwCloseBtn.mouseout(function(){
            $(this).css({opacity: '1'});
        });
    });
}

function showMarkerForm( map, marker ) {
    var markerObject = {
        uniqueness: marker.uniqueness,
        post_id: post.ID,
        lat: marker.position.lat(),
        lng: marker.position.lng()
    };

    var markerForm = $( views.form );

    if( marker.hasOwnProperty( 'name' ) ) {
        markerForm.find( '#marker_name' ).val( marker.name );
    }
    if( marker.hasOwnProperty( 'content' ) ) {
        markerForm.find( '#marker_description' ).val( marker.content );
    }
    if( ! marker.hasOwnProperty( 'name' ) && ! marker.hasOwnProperty( 'content' ) ) {
        $( '<button type="button" id="delete-button">Delete Marker</button>' ).insertAfter( markerForm.find( '#save-button' ) );
    }


    markerForm.insertAfter( '#lb-gmaps-fields' );

    validateMarkerForm( markerForm );

    $( '#cancel-button' ).on( 'click', function () {
        markerForm.remove();
        displayInfoWindow( map, marker );
    } );

    $( '#save-button' ).on( 'click', function () {
        markerObject.name = $.trim( $( '#marker_name' ).val() );
        markerObject.content = $.trim( $( '#marker_description' ).val() );
        markerForm.remove();
        $.ajax( {
            type: "POST",
            url: admin.ajaxURL,
            data: {
                action: 'save_marker_data',
                marker: markerObject
            }
        } ).then( function (data) {
            if( data ) {
                marker.name = markerObject.name;
                marker.content = markerObject.content;
                displayInfoWindow( map, marker );
            }
        } );
    } );

    $( '#delete-button' ).on( 'click', function () {
        marker.setMap( null );
        markerForm.remove();
    } )
}

function addMarkerClickListener( map, marker, content, infoWindow ) {
    google.maps.event.clearListeners( marker, 'click' );
    google.maps.event.addListener( marker, 'click', ( function( marker, content, infoWindow ) {
        return function() {
            if( undefined !== infoWindow && undefined !== infoWindow && undefined !== content ) {
                infoWindow.setContent( content );
                if( undefined === infoWindow.getMap() || null === infoWindow.getMap() ) {
                    infoWindow.open( map, marker );
                }

                $( '#edit-lb-gmaps-marker' ).on( 'click', function (  ) {
                    $( '.gm-style-iw' ).parent().remove();
                    showMarkerForm( map, marker );
                } );

                $(' #delete-lb-gmaps-marker ').on( 'click', function () {
                    $( '.gm-style-iw' ).parent().remove();
                    google.maps.event.clearListeners( marker, 'click' );
                    var markerObject = {
                        uniqueness: marker.uniqueness,
                        lat: marker.position.lat(),
                        lng: marker.position.lng()
                    };
                    $.ajax( {
                        type: 'POST',
                        url: admin.ajaxURL,
                        data: {
                            action: 'delete_marker_data',
                            marker: markerObject
                        }
                    } ).then( function ( data ) {
                        if( data ) {
                            marker.setMap( null );
                        }
                    } )
                } )
            } else {
                showMarkerForm( map, marker );
            }

        };
    } )( marker, content, infoWindow) );
}

function displayInfoWindow( map, marker ) {
    var content = $( views.infoBox );
    content.find( '#lb-gmaps-marker-description' ).append( '<span id="edit-lb-gmaps-marker">Edit Marker Info</span>' );
    content.find( '#lb-gmaps-marker-description' ).append( '<span id="delete-lb-gmaps-marker">Delete Marker</span>' );
    if( null !== marker.name && null !== marker.content && undefined !== marker.name && undefined !== marker.content) {
        if( null !== marker.name ) {
            content.find( '#lb-gmaps-marker-name p' ).text( marker.name );
        }
        if( null !== marker.content ) {
            content.find( '#lb-gmaps-marker-description p' ).text( marker.content );
        }
        var textContent = content[0].outerHTML;
        var infoWindow = new google.maps.InfoWindow( {
            maxWidth: 300
        } );

        styleInfowindow( infoWindow );
        addMarkerClickListener( map, marker, textContent, infoWindow );
    } else {
        addMarkerClickListener( map, marker );
    }

}

function validateMarkerForm( markerForm ) {
    var formFields = markerForm.find( '.marker-field' );
    for ( var i = 0; i < formFields.length; i++ ) {
        var field = $( formFields[ i ] );
        validateField( field, false );
        field.blur( function ( e ) {
            validateField( $( e.target ), true );
        } );
    }

    function handleSaveButton() {
        if( formFields.length === $( '.valid' ).length ) {
            $( '#save-button' ).prop( 'disabled', false );
        } else {
            $( '#save-button' ).prop( 'disabled', true );
        }
    }

    function validateField( field, withErrors ) {
        if( '' === field.val() ) {
            field.removeClass( 'valid' );
            if( ! field.siblings( '.marker-error' ).length && withErrors ) {
                field.parent().append( '<div class="marker-error">' + errors.emptyField + '</div>' );
            }
        } else {
            field.addClass( 'valid' );
            field.siblings( '.marker-error' ).remove();
        }
        handleSaveButton();
    }
}

function getMapAttributes( map ) {
    var mapAttributes = {};
    mapAttributes.post_id = post.ID;
    mapAttributes.lat = map.getCenter().lat();
    mapAttributes.lng = map.getCenter().lng();
    mapAttributes.zoom = map.getZoom();
    if( map.scaleControl ) {
        mapAttributes.scaleControl = map.scaleControl;
    }
    if( map.zoomControl ) {
        mapAttributes.zoomControl = map.zoomControl;
    }
    if( map.fullscreenControl ) {
        mapAttributes.fullscreenControl = map.fullscreenControl;
    }
    if( map.rotateControl ) {
        mapAttributes.rotateControl = map.rotateControl;
    }
    if( map.streetViewControl ) {
        mapAttributes.streetViewControl = map.streetViewControl;
    }
    if( map.mapTypeControlOptions ) {
        mapAttributes.mapTypeControlOptions = map.mapTypeControlOptions;
    }

    return mapAttributes;
}

function parseMapData( data ) {
    var mapData = {};
    var keys = Object.keys( data );
    
    for ( var key of keys ) {
        if( $.isNumeric( data[ key ] ) ) {
            mapData[ key ] = parseFloat( data[ key ] );
        } else if( null !== data[ key ] ) {
            mapData[ key ] = data[ key ];
        }
    }
    mapData.center = { lat: mapData.lat, lng: mapData.lng };
    return mapData;
}

function parseMarkerData( data ) {
    var markerData = {
        uniqueness: data.uniqueness,
        lat: parseFloat( data.lat ),
        lng: parseFloat( data.lng )
    };
    if( null !== data.name ) {
        markerData.name = data.name;
    }

    if( null !== data.content ) {
        markerData.content = data.content;
    }

    return markerData;
}
//TODO: Add Comments
//TODO: Use API Getters and Setters