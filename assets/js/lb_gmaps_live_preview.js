function initMap() {
    var markers = [];
    var mapAttributes = {
        post_id: post.ID
    };

    if( null !== data.map && 'object' === typeof data.map ) {
        $( '#lb-gmaps-live-preview' ).css({height: data.map.height, width: data.map.width});
        var map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), parseMapData( data.map ) );
        mapAttributes = data.map;
    } else {
        var map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), {
            center: {lat: 45.40338, lng: 10.17403},
            zoom: 3,
            disableDefaultUI: true,
            gestureHandling: 'none'
        });
    }

    var mapMarkers = [];

    for ( var i = 0; i < data.markers.length; i++ ) {
        if( 'object' === typeof data.markers[ i ] ) {
            var marker = new google.maps.Marker( parseMarkerData( data.markers[ i ] ) );
            marker.setPosition( new google.maps.LatLng( marker.lat , marker.lng ) );
            marker.setMap( map );
            displayInfoWindow( map, marker );
            mapMarkers.push( marker );
        }
    }

    mapDirections( map, mapMarkers );

    ( function ( map, mapAttributes, markers ) {
        postFormHandler( map, mapAttributes, markers );
    } )( map, mapAttributes, markers );

    map.addListener( 'dblclick', function ( event ) {
        ( function ( map, markers ) {
            createMarker( map, event.latLng, markers )
        } )( map, markers );
    } );

    $( '#publish' ).on( 'click', function ( e ) {
        e.preventDefault();
        console.log(markers);
        mapAttributes.lat = map.getCenter().lat();
        mapAttributes.lng = map.getCenter().lng();
        mapAttributes.zoom = map.getZoom();
        if( mapAttributes.hasOwnProperty( 'map_types' ) && Array.isArray( mapAttributes.map_types) ) {
            mapAttributes.map_types = mapAttributes.map_types.join( ', ' );
        }
        mapAttributes.gesture_handling = map.get( 'gestureHandling' );
        $.ajax( {
            type: "POST",
            url: admin.ajaxURL,
            data: {
                action: 'save_map_data',
                map: mapAttributes,
                markers: markers
            }
        } );
    } );
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

function handleSaveButton(  ) {
    if( $( '#lb-gmaps-marker-form' ).find( '.marker-field' ).length === $( '.valid' ).length ) {
        $( '#save-button' ).prop( 'disabled', false );
    } else {
        $( '#save-button' ).prop( 'disabled', true );
    }
}

function postFormHandler( map, mapAttributes, markers ) {
    handleLivePreviewContainer();

    attachDomReadyEvents();

    var input = document.getElementById( 'lb-gmaps-map-markers' );

    var autocomplete = new google.maps.places.Autocomplete( input );

    $( '#lb-gmaps-map-fullscreen' ).on( 'change', function ( e ) {
        if( e.target.checked ) {
            var el = $( '#lb-gmaps-metabox.postbox' );
            el.css( {'overflow-y': 'scroll'} );
            reorder_fields( true );
            // Supports most browsers and their versions.
            var requestMethod = el[0].requestFullScreen || el[0].webkitRequestFullScreen
                || el[0].mozRequestFullScreen || el[0].msRequestFullScreen;

            if (requestMethod) {
                // Native full screen.
                requestMethod.call(el[0]);

            }

            $( document ).on( 'fullscreenchange webkitfullscreenchange mozfullscreenchange', function () {
                if ( ! isFullScreen() ) {
                    $( '#lb-gmaps-map-fullscreen' ).prop( 'checked', false );
                    $( '#lb-gmaps-metabox.postbox' ).css( 'overflow-y', 'visible' );
                    $( '#lb-gmaps-live-preview' ).trigger( 'changeDimensions' );
                }
            } );

        } else {
            if ( document.exitFullscreen ) {
                document.exitFullscreen();
            } else if ( document.webkitExitFullscreen ) {
                document.webkitExitFullscreen();
            } else if ( document.mozCancelFullScreen ) {
                document.mozCancelFullScreen();
            } else if ( document.msExitFullscreen ) {
                document.msExitFullscreen();
            }
        }
    } );

    autocomplete.bindTo('bounds', map);
    autocomplete.addListener( 'place_changed', function() {
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

        ( function ( map, markers ) {
            createMarker( map, place.geometry.location, markers )
        } )( map, markers );


    });

    $( '#lb-gmaps-map-gesture-handling' ).on( 'change', function ( e ) {
        if( e.target.checked ) {
            map.set( 'gestureHandling', 'greedy' );
            mapAttributes.gesture_handling = 'greedy';
        } else {
            map.set( 'gestureHandling', 'none' );
            mapAttributes.gesture_handling = 'none';
        }

    } );

    $( '#lb-gmaps-map-full-width' ).on( 'change', function ( e ) {
        if( e.target.checked ) {
            $( '#lb-gmaps-map-width' ).parent().fadeOut( 300 );
            $( '#lb-gmaps-live-preview' ).css( {width: '100%' } );
            triggerDimensionsEvent();
            mapAttributes.width = '100%';
        } else {
            $( '#lb-gmaps-map-width' ).parent().fadeIn( 300 ).css( 'display', 'inline-block' );
            if( $( '#lb-gmaps-map-width' ).val() ) {
                $( '#lb-gmaps-live-preview' ).css( {width: $( '#lb-gmaps-map-width' ).val() } );
                triggerDimensionsEvent();
                mapAttributes.width = $( '#lb-gmaps-map-width' ).val();
            } else {
                $( '#lb-gmaps-live-preview' ).css( {width: '50%' } );

                mapAttributes.width = '50%';
            }
        }
        google.maps.event.trigger( map, 'resize');
    } );

    ( function ( mapAttributes ) {
        handleDimensionField( '#lb-gmaps-map-width', map, mapAttributes );
        handleDimensionField( '#lb-gmaps-map-height', map, mapAttributes );
    } )( mapAttributes );

    var mapTypes = $( '#lb-gmaps-map-types' );
    if( 'choose' === $( '#lb-gmaps-map-map-type-control' ).find( 'option:selected' ).val() ) {
        mapTypes.parent().fadeOut( 300 );
    }

    $( '#lb-gmaps-map-scale-control' ).on( 'change', function ( e ) {
        map.set( 'scaleControl', e.target.checked );
        mapAttributes.scale_control = e.target.checked;
    } );

    var controls = $( '#lb-gmaps-fields select:not( [multiple] )' );
    for ( var i = 0; i < controls.length; i++ ) {
        var selectDropdown = $( controls[ i ] );
        selectDropdown.on( 'change', function ( e ) {
            var value = $( e.target ).find( 'option:selected' ).val();
            var dbControlType = e.target.id.replace( 'lb-gmaps-map-', '' ).replace( /-/g, '_' );
            var controlType = e.target.id
                .replace( 'lb-gmaps-map-', '' )
                .split( '-' )
                .map( ( x ) => {
                    return x[0].toUpperCase() + x.slice( 1 );
                } )
                .join( '' );
            controlType = controlType[0].toLowerCase() + controlType.slice( 1 );
            if( value !== 'choose' ) {
                var controlTypeOptions = controlType + 'Options';
                var controlOps = map.get( controlTypeOptions );
                map.set( controlType, true );
                mapAttributes[ dbControlType ] = value;
                if( 'mapTypeControl' === controlType ) {
                    mapTypes.parent().fadeIn( 300 ).css( 'display', 'inline-block' );
                }
                // Check if the corresponding control has already had its options set
                if( typeof  controlOps === 'object' ) {
                    controlOps.position = google.maps.ControlPosition[ value ];
                    map.set( controlTypeOptions, controlOps );
                } else {
                    map.set( controlTypeOptions, { position: google.maps.ControlPosition[ value ] } );
                    if( 'mapTypeControl' === controlType ) {
                        controlOps = map.get( controlTypeOptions );
                        controlOps.mapTypeIds = ['roadmap'];
                        map.set( controlTypeOptions, controlOps );
                        mapAttributes.map_types = ['roadmap'];
                        $( '#lb-gmaps-map-types' ).find( 'option[value=roadmap]' ).prop( 'selected', true );
                    }
                }
            } else {
                if( 'mapTypeControl' === controlType ) {
                    $( '#lb-gmaps-map-types' ).parent().fadeOut( 300 );
                }
                map.set( controlType, false );
                mapAttributes[ dbControlType ] = false;
            }
        } );
    }

    mapTypes.on( 'change', function ( e ) {
        var selectedOptions = $( e.target ).find( 'option:selected' );
        var ids = [];
        for ( var i = 0; i < selectedOptions.length; i++ ) {
            ids.push( $( selectedOptions[ i ] ).val() );
        }

        if( 0 < ids.length ) {
            var controlOps = map.get( 'mapTypeControlOptions' );
            if( typeof controlOps === 'object' ) {
                controlOps.mapTypeIds = ids;
                map.set( 'mapTypeControlOptions', controlOps );
            } else {
                map.set( 'mapTypeControlOptions', { mapTypeIds : ids } );
            }
            mapAttributes.map_types = ids;
        } else {
            mapTypes.parent().fadeOut( 300 );
            $( '#lb-gmaps-map-map-type-control' ).find( 'option[value=choose]' ).prop( 'selected', true );
            delete map.mapTypeControl;
            delete map.mapTypeControlOptions;
            delete mapAttributes.map_type_control;
            delete mapAttributes.map_types;
        }

    } );
}

function handleDimensionField( selector, map, mapAttributes ) {
    $( selector ).on( 'keydown', function ( e ) {
        var val = parseInt( $( e.target ).val().replace( 'px', '' ).replace( '%', '' ) );
        if( 40 === e.keyCode ) {
            if( $( e.target ).val().match( /^[0-9]+px$/ ) ) {
                $( e.target ).val( val - 1 + 'px' );
            } else if( $( e.target ).val().match( /^[0-9]+%$/ ) ) {
                $( e.target ).val( val - 1 + '%' );
            }
        }
        if( 38 === e.keyCode ) {
            if( $( e.target ).val().match( /^[0-9]+px$/ ) ) {
                $( e.target ).val( val + 1 + 'px' );
            } else if ( $( e.target ).val().match( /^[0-9]+%$/ )  ) {
                $( e.target ).val( val + 1 + '%' );
            }
        }
    } );

    $( selector ).on( 'keyup', function ( e ) {
        clearTimeout( window.fieldHandling );
        window.fieldHandling = setTimeout( function() {
            var field = $( e.target );
            handleField( field );

            if( -1 !== field.attr( 'id' ).indexOf( 'height' ) ) {
                mapAttributes.height = field.val();
            } else {
                mapAttributes.width = field.val();
            }

            google.maps.event.trigger( map, 'resize' );
        }, 500 );
    } );
}

function handleField( field ) {
    var fieldType = field.attr( 'id' ).indexOf( 'height' ) !== -1 ? 'height' : 'width';

    if( field.val().match( /^[0-9]+(px|%)$/ ) ) {
        field.siblings( '.lb-gmaps-dimensions-error' ).remove();
        $( '#publish' ).prop( 'disabled', '' );
        adjustDimensionsValue( field );
        $( '#lb-gmaps-live-preview' ).css( fieldType, field.val() );
        triggerDimensionsEvent();
    } else {
        if( ! field.siblings( '.lb-gmaps-dimensions-error' ).length ) {
            $( '#publish' ).prop( 'disabled', 'disabled' );
            field.parent().append( '<div class="lb-gmaps-dimensions-error lb-gmaps-error">' + messages.dimensionsError + '</div>' );
        }
    }
}

function adjustDimensionsValue( field ) {
    if( field.val().match( /^[0-9]+%$/ ) ) {
        if( parseInt( field.val().replace( '%', '' ) ) > 100 ) {
            field.val( '100%' );
        }
    } else if( field.val().match( /^[0-9]+px$/ ) ) {
        if( parseInt( field.val().replace( 'px', '' ) ) < 200 ) {
            field.val( '200px' );
        }
    }
}

function reorder_fields( isMapOutBounds ) {
    if( isMapOutBounds ) {
        $( '#lb-gmaps-fields' ).addClass( 'reordered-container' );
        $( '.lb-gmaps-form-group' ).each( ( i, el ) => {
            $( el ).addClass( 'reordered-field' );
        } );
    } else {
        $( '#lb-gmaps-fields' ).removeClass( 'reordered-container' );
        $( '.lb-gmaps-form-group' ).each( ( i, el ) => {
            $( el ).removeClass( 'reordered-field' );
        } );
    }

}

function handleLivePreviewContainer() {
    var mapContainer = $( '#lb-gmaps-live-preview' );
    mapContainer.on( 'changeDimensions', function ( e ) {
        if( mapContainer.width() > getMetaboxHalfWidth() ) {
            reorder_fields( true );
        } else {
            reorder_fields();
        }
    } )
}

function attachDomReadyEvents() {
    $( window ).resize( function () {
        clearTimeout( window.dimensionResizing );
        window.dimensionResizing = setTimeout( function(){
            triggerDimensionsEvent();
        }, 250 );
    } );
    $( document ).ready( function () {
        if( $( '#lb-gmaps-map-full-width' ).is( ':checked' ) ) {
            $( '#lb-gmaps-map-width' ).parent().hide();
        }

        $( '#lb-gmaps-map-markers' ).on( 'keydown', function ( e ) {
            if( 13 === e.keyCode ) {
                e.preventDefault();
            }
        } );
        triggerDimensionsEvent();
    } );
}

function isFullScreen() {
    return window.screenTop && window.screenY;
}

function triggerDimensionsEvent() {
    if( ! isFullScreen() ) {
        $( '#lb-gmaps-live-preview' ).trigger( 'changeDimensions' );
    }
}

function createMarker( map, location, markers ) {
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

function getMetaboxHalfWidth() {
    return Math.ceil( 0.5 * $( '#lb-gmaps-metabox:not(.postbox)' ).width() )
}

//TODO: FIX HEIGHT FIELD IN PERCENTS AND MARKER FORM STYLING
//TODO: Enrich string translation
//TODO: Add Comments