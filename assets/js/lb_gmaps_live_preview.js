function initMap() {
    var markers = [];
    var directionServiceOptions = {};
    var mapMarkers = [];
    var mapAttributes = {
        post_id: post.ID
    };

    if( null !== data.map && 'object' === typeof data.map ) {
        $( '#lb-gmaps-live-preview' ).css({height: data.map.height, width: data.map.width});
        var map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), parseMapData( data.map ) );
        mapAttributes = data.map;
        directionServiceOptions = parseDirectionsOptions( data.map );
    } else {
        var map = new google.maps.Map( document.getElementById( 'lb-gmaps-live-preview' ), {
            center: {lat: 45.40338, lng: 10.17403},
            zoom: 3,
            disableDefaultUI: true,
            gestureHandling: 'none'
        });
        directionServiceOptions = {
            disableDirections: true,
            routeMarkers: false,
            waypointsMarkers: false,
            directionsInfowindow: false,
            meansOfTransport: false
        };
    }

    for ( var i = 0; i < data.markers.length; i++ ) {
        if( 'object' === typeof data.markers[ i ] ) {
            var marker = new google.maps.Marker( parseMarkerData( data.markers[ i ] ) );
            marker.setPosition( new google.maps.LatLng( marker.lat , marker.lng ) );
            marker.setMap( map );
            displayInfoWindow( map, marker );
            mapMarkers.push( marker );
        }
    }

    ( function ( map, mapAttributes, markers, mapMarkers, directionServiceOptions ) {
        postFormHandler( map, mapAttributes, markers, mapMarkers, directionServiceOptions );
    } )( map, mapAttributes, markers, mapMarkers, directionServiceOptions );

    map.addListener( 'dblclick', function ( event ) {
        ( function ( map, markers ) {
            createMarker( map, event.latLng, markers )
        } )( map, markers );
    } );

    $( '#publish' ).on( 'click', function ( e ) {
        e.preventDefault();
        mapAttributes.lat = map.getCenter().lat();
        mapAttributes.lng = map.getCenter().lng();
        mapAttributes.zoom = map.getZoom();
        if( mapAttributes.hasOwnProperty( 'map_types' ) && Array.isArray( mapAttributes.map_types) ) {
            mapAttributes.map_types = mapAttributes.map_types.join( ', ' );
        }
        mapAttributes.gesture_handling = map.get( 'gestureHandling' );
        var directionsKeys = Object.keys( directionServiceOptions );
        for (var i = 0; i < directionsKeys.length; i++) {
            var key = directionsKeys[ i ].replace( 'disableD', 'd' ).replace( /[A-Z]+/g, '_$&' ).toLowerCase();
            mapAttributes[ key ] = directionServiceOptions[ directionsKeys[ i ] ];
        }
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

function postFormHandler( map, mapAttributes, markers, mapMarkers, directionServiceOptions ) {

    mapDirections( map, mapMarkers, directionServiceOptions );

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
                    triggerDimensionsEvent();
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

    //Handle directions field. If ticked the user will be able to create routes
    $( '#lb-gmaps-map-directions' ).on( 'change', function ( e ) {
        e.target.checked === true ? directionServiceOptions.disableDirections = false : directionServiceOptions.disableDirections = true;
        mapDirections( map, mapMarkers, directionServiceOptions );
    } );

    //Handle markers creation at the end and beginning of a route
    $( '#lb-gmaps-map-route-markers' ).on( 'change', function ( e ) {
        e.target.checked === true ? directionServiceOptions.routeMarkers = true : directionServiceOptions.routeMarkers = false;
    } );

    //Handle markers creation at each waypoint
    $( '#lb-gmaps-map-waypoints-markers' ).on( 'change', function ( e ) {
        e.target.checked === true ? directionServiceOptions.waypointsMarkers = true : directionServiceOptions.waypointsMarkers = false;
    } );

    //Handle Infowindows on routes
    $( '#lb-gmaps-map-directions-infowindow' ).on( 'click', function ( e ) {
        e.target.checked === true ? directionServiceOptions.directionsInfowindow = true : directionServiceOptions.directionsInfowindow = false;
    } );

    //Handle Means of Transport field
    $( '#lb-gmaps-map-means-of-transport' ).on( 'click', function ( e ) {
        e.target.checked === true ? directionServiceOptions.meansOfTransport = true : directionServiceOptions.meansOfTransport = false ;
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

function isFullScreen() {
    return window.screenTop && window.screenY;
}

function triggerDimensionsEvent() {
    if( ! isFullScreen() ) {
        $( '#lb-gmaps-live-preview' ).trigger( 'changeDimensions' );
    }
}

function getMetaboxHalfWidth() {
    return Math.ceil( 0.6 * $( '#lb-gmaps-metabox:not(.postbox)' ).width() )
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
        $( '<button type="button" class="marker-button" id="delete-button">Delete Marker</button>' ).insertAfter( markerForm.find( '#save-button' ) );
    }

    var mapContainer = $( '#lb-gmaps-live-preview' );
    var heightVal = parseInt( mapContainer.css( 'height' ).replace( 'px', '' ) );
    var widthVal = parseInt( mapContainer.css( 'width' ).replace( 'px', '' ) );

    if( heightVal < 400 && widthVal <= getMetaboxHalfWidth() ) {
        markerForm.css( { 'left': 'initial', 'bottom': heightVal + 50 + 'px', 'right': 'calc( ( 50% - 280px ) / 2 )' } );
        markerForm.insertBefore( '#lb-gmaps-fields' );
    } else if( heightVal < 400 && widthVal > getMetaboxHalfWidth() ) {
        markerForm.css( { 'left': 'initial', 'bottom': '420px', 'right': 'calc( ( 100% - 280px ) / 2 )' } );
        markerForm.insertBefore( '#lb-gmaps-fields' );
    } else {
        mapContainer.append( markerForm );
    }

    if ( $( '#marker-upload-media' ).length > 0 ) {
        if ( typeof wp !== 'undefined' && wp.media && wp.media.editor ) {
            $( document ).on( 'click', '#marker-upload-media', function( e ) {
                if (this.window === undefined) {
                    this.window = wp.media({
                        title: 'Insert a marker photo',
                        library: {type: 'image'},
                        multiple: false,
                        button: {text: 'Insert'}
                    });

                    var self = this; // Needed to retrieve our variable in the anonymous function below
                    this.window.on('select', function() {
                        var first = self.window.state().get('selection').first().toJSON();
                    });
                }

                this.window.open();
                return false;
            });
        }
    }

    tinymce.init({
        theme: 'modern',
        selector: '#marker_description',
        resize: true,
        setup: function( ed ) {
            ed.on('blur', function() {
                var content = ed.getContent();
                var field = $( '#marker_description' );
                if( '' === content ) {
                    field.removeClass( 'valid' );
                    if( ! field.siblings( '.marker-error' ).length ) {
                        field.parent().append( '<div class="marker-error">' + errors.emptyField + '</div>' );
                    }
                } else {
                    field.addClass( 'valid' );
                    field.siblings( '.marker-error' ).remove();
                }
                handleSaveButton();
            });
        }
    });

    validateMarkerForm( markerForm );

    $( '#cancel-button' ).on( 'click', function () {
        tinymce.get('marker_description').remove();
        markerForm.remove();
        displayInfoWindow( map, marker );
    } );

    $( '#save-button' ).on( 'click', function () {
        tinymce.get('marker_description').remove();
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
        deleteMarker( marker );
    } );
}

function parseDirectionsOptions( mapData ) {
    var obj = {};
    //TODO: ADD PREFIX TO DB IN ORDER TO EASIER PARSE DATA HERE.
}

//TODO: FIX HEIGHT FIELD IN PERCENTS AND MARKER FORM STYLING
//TODO: Enrich string translation
//TODO: Add Comments
//TODO: ADD SOME RESPONSIVE DESIGN