if( undefined === $ ) {
    var $ = jQuery.noConflict();
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
        if( data.frontEnd ) {
            iwCloseBtn.css( { width: '27px', height: '27px' } );
        }

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
        $( '<button type="button" class="marker-button" id="delete-button">Delete Marker</button>' ).insertAfter( markerForm.find( '#save-button' ) );
    }

    $( '#lb-gmaps-live-preview' ).append( markerForm );

    tinymce.init({
        theme: 'modern',
        selector: '#marker_description',
        resize: false,
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
        tinymce.get('marker_description').remove();
        marker.setMap( null );
        markerForm.remove();
    } );
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
                if( ! data.frontEnd ) {
                    $( '#edit-lb-gmaps-marker' ).on( 'click', function (  ) {
                        $( '.gm-style-iw' ).parent().remove();
                        showMarkerForm( map, marker );
                    } );

                    $( '#transfer-lb-gmaps-marker').on( 'click', function () {
                        $.ajax( {
                            method: 'POST',
                            url: admin.ajaxURL,
                            data: {
                                action: 'get_maps_data'
                            }
                        } ).then( function ( data ) {
                            if( data.length && data.length > 1) {
                                var fields = $( maps.select );
                                var select = $( fields.find( 'select#maps' ) );
                                // add ids to an array for security check
                                var ids = [];
                                for ( var i = 0; i < data.length; i++ ) {
                                    if( post.ID != data[ i ].ID ) {
                                        ids.push( data[ i ].ID );
                                        select.append( '<option value="' + data[ i ].ID + '" >' + data[ i ].post_title + '</option>' );
                                    }
                                }
                                $( '#lb-gmaps-marker-description' ).hide();
                                $( '#lb-gmaps-marker-contaier' ).append( fields );

                                $( '#transfer' ).on( 'click', function () {
                                    var maps = $( '#maps' ).find( 'option:selected' );
                                    if( maps.length ) {
                                        for (var i = 0; i < maps.length; i++) {
                                            var mapId = parseInt( $( maps[ i ] ).val() );
                                            //Check whether the mapId is in the posts-maps created by the user in the dashboard
                                            if( -1 !== ids.indexOf( mapId ) ) {
                                                $.ajax( {
                                                    method: 'POST',
                                                    url: admin.ajaxURL,
                                                    data: {
                                                        action: 'transfer_marker',
                                                        marker: parseMarkerData( marker ),
                                                        map_id: mapId
                                                    }
                                                } ).then( function () {
                                                    //TODO: ADD NOTIFICATION MESSAGES FOR SUCCESS AND FAILURE
                                                    $( '#transfer-maps-container' ).remove();
                                                    $( '#lb-gmaps-marker-description' ).show();
                                                } )
                                            }
                                        }
                                    }
                                } );
                                $( '#back' ).on( 'click', function () {
                                    $( '#transfer-maps-container' ).remove();
                                    $( '#lb-gmaps-marker-description' ).show();
                                } );
                            } else {
                                $( '#lb-gmaps-marker-description' ).hide();
                                $( '#lb-gmaps-marker-contaier' ).append( $( '<h2 id="lb-gmaps-not-found">No Maps Found.</h2>' ) );
                                setTimeout( function () {
                                    $( '#lb-gmaps-not-found' ).remove();
                                    $( '#lb-gmaps-marker-description' ).show();
                                }, 2000 );
                            }
                        } );
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
                }
            } else {
                showMarkerForm( map, marker );
            }

        };
    } )( marker, content, infoWindow) );
}

function displayInfoWindow( map, marker ) {
    var content = $( views.infoBox );
    if( ! data.frontEnd ) {
        content.find( '#lb-gmaps-marker-description' ).append( '<span id="edit-lb-gmaps-marker">Edit</span>' );
        content.find( '#lb-gmaps-marker-description' ).append( '<span id="transfer-lb-gmaps-marker">Transfer to Another Map</span>' );
        content.find( '#lb-gmaps-marker-description' ).append( '<span id="delete-lb-gmaps-marker">Delete</span>' );
    }
    if( null !== marker.name && null !== marker.content && undefined !== marker.name && undefined !== marker.content) {
        if( null !== marker.name ) {
            content.find( '#lb-gmaps-marker-name p' ).text( marker.name );
        }
        if( null !== marker.content ) {
            content.find( '#lb-gmaps-marker-description p' ).html( marker.content );
        }
        var textContent = content[0].outerHTML;
        var infoWindow = new google.maps.InfoWindow( {
            maxWidth: 300
        } );

        styleInfowindow( infoWindow );
        addMarkerClickListener( map, marker, textContent, infoWindow );
    } else {
        if( ! data.frontEnd ) {
            addMarkerClickListener( map, marker );
        }
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

function parseMapData( data ) {
    var mapData = {
        disableDefaultUI: true
    };
    var keys = Object.keys( data );

    for ( var key of keys ) {
        if( null !== data[ key ] ) {
            if( $.isNumeric( data[ key ] ) ) {
                mapData[ key ] = parseFloat( data[ key ] );
            } else if( key.match( /control/ ) && '' !== data[ key ] && null !== data[ key ] ) {
                var control = key.split( '_' )
                    .map( ( x ) => {
                        return x[0].toUpperCase() + x.slice( 1 );
                    } )
                    .join( '' );
                control = control[0].toLowerCase() + control.slice( 1 );
                'false' === data[ key ] ? mapData[ control ] = false : mapData[ control ] = true;
                if( control !== 'scaleControl' ) {
                    mapData[ control + 'Options' ] = {
                        position: google.maps.ControlPosition[ data[ key ] ]
                    };
                    if( 'mapTypeControl' === control && null !== data.map_types ) {
                        mapData[ control + 'Options' ]['mapTypeIds'] = data.map_types.split( ', ' );
                    }
                }
            } else if( key !== 'map_types' && '' !== data[key] && null !== data[ key ] ){
                var jsKey = key.split( '_' ).map( ( x ) => {return x[0].toUpperCase() + x.slice( 1 )} ).join( '' );
                jsKey = jsKey[0].toLowerCase() + jsKey.slice( 1 );
                mapData[ jsKey ] = data[ key ];
            }
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
    if( undefined === data.lat && data.getPosition ) {
        markerData.lat = data.getPosition().lat();
    }
    if( undefined === data.lng && data.getPosition ) {
        markerData.lng = data.getPosition().lng();
    }
    if( undefined === data.lng ) {

    }
    if( null !== data.name ) {
        markerData.name = data.name;
    }

    if( null !== data.content ) {
        markerData.content = data.content;
    }

    return markerData;
}

function postFormHandler( map, mapAttributes ) {

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
            if( $( e.target ).val().indexOf( 'px' ) !== -1 ) {
                $( e.target ).val( val - 1 + 'px' );
            } else {
                $( e.target ).val( val - 1 + '%' );
            }
        }
        if( 38 === e.keyCode ) {
            if( $( e.target ).val().indexOf( 'px' ) !== -1 ) {
                $( e.target ).val( val + 1 + 'px' );
            } else {
                $( e.target ).val( val + 1 + '%' );
            }
        }
    } );

    $( selector ).blur( function ( e ) {
        var field = $( e.target );
        var fieldType = selector.indexOf( 'height' ) !== -1 ? 'height' : 'width';
        if( 'height' === fieldType ) {
            if( field.val().indexOf( 'px' ) !== -1 || field.val().indexOf( '%' ) !== -1 ) {
                if( field.val().indexOf( '%' ) !== -1 ) {
                    if( parseInt( field.val().replace( '%', '' ) ) > 100 ) {
                        field.val( '100%' );
                    }
                }
                if( field.val().indexOf( 'px' ) !== -1 ) {
                    if( parseInt( field.val().replace( 'px', '' ) ) < 200 ) {
                        field.val( '200px' );
                    }
                }
                $( '#lb-gmaps-live-preview' ).css( {height: $( e.target ).val() } );
                triggerDimensionsEvent();
            }
            mapAttributes.height = $( e.target ).val();
        } else {
            if( field.val().indexOf( 'px' ) !== -1 || field.val().indexOf( '%' ) !== -1 ) {
                if( field.val().indexOf( '%' ) !== -1 ) {
                    if( parseInt( field.val().replace( '%', '' ) ) > 100 ) {
                        field.val( '100%' );
                    }
                }
                if( field.val().indexOf( 'px' ) !== -1 ) {
                    if( parseInt( field.val().replace( 'px', '' ) ) < 200 ) {
                        field.val( '200px' );
                    }
                }
                $( '#lb-gmaps-live-preview' ).css( {width: $( e.target ).val() } );
                triggerDimensionsEvent();
            }
            mapAttributes.width = $( e.target ).val();
        }
        google.maps.event.trigger( map, 'resize');
    } );
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
        if( mapContainer.width() > Math.ceil( 0.5 * $( '#lb-gmaps-metabox:not(.postbox)' ).width() ) ) {
            reorder_fields( true );
        } else {
            reorder_fields();
        }
    } )
}

function attachDomReadyEvents() {
    $( document ).ready( function () {
        if( $( '#lb-gmaps-map-full-width' ).is( ':checked' ) ) {
            $( '#lb-gmaps-map-width' ).parent().hide();
        }
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

//TODO: EXTEND TO FULLSCREEN THE SHITTY METABOX !!!
//TODO: Enrich string translation