if( undefined === $ ) {
    var $ = jQuery.noConflict();
}
function styleInfowindow( infowindow ) {
    google.maps.event.addListener( infowindow, 'domready', function() {

        // Reference to the DIV that wraps the bottom of infowindow
        $( '.gm-style-iw:has(div#lb-gmaps-marker-contaier)' ).addClass( 'custom-gm-style-iw' );
        var iwOuter = $( '.custom-gm-style-iw' );
        iwOuter.parent().css({'width': iwOuter.css('width'), 'height': iwOuter.css('height') });

        if( iwOuter.find( '#lb-gmaps-marker-content' ).height() > iwOuter.find( '#lb-gmaps-marker-media' ).height() ) {
            iwOuter.find( '#lb-gmaps-marker-media' ).height( iwOuter.find( '#lb-gmaps-marker-content' ).height() );
        } else {
            iwOuter.find( '#lb-gmaps-marker-content' ).height( iwOuter.find( '#lb-gmaps-marker-media' ).height() );
        }

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
        iwCloseBtn.css({opacity: '1', top: '0' , right: '-45px', border: '7px solid #417DF1', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});
        if( data.frontEnd ) {
            iwCloseBtn.css( { width: '27px', height: '27px' } );
        }

        // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
        iwCloseBtn.mouseout(function(){
            $(this).css({opacity: '1'});
        });
    });
}
//Displays form after map creation and form for editing
function showMarkerForm( map, marker, markers ) {
    var markerObject = {
        post_id: post.ID,
        lat: marker.position.lat(),
        lng: marker.position.lng()
    };

    var markerForm = $( views.form );
    var markerProps = [ 'name', 'content', 'media' ];
    var empty = 0;
    for ( var i = 0; i < markerProps.length; i++ ) {
        if( marker.hasOwnProperty( markerProps[ i ] ) ) {
            markerForm.find( '#marker_' + markerProps[ i ] ).val( marker[ markerProps[ i ] ] );
            if( 'media' === markerProps[ i ] ) {
                markerForm.find( '#marker-clear-images' ).removeClass( 'hidden' );
            }
        } else {
            empty++;
        }
    }
    if( 3 === empty ) {
        $( '<button type="button" class="marker-button" id="delete-button">Delete Marker</button>' ).insertAfter( markerForm.find( '#save-button' ) );
    }

    var mapContainer = $( '#lb-gmaps-live-preview' );
    if( data.frontEnd ) {
        mapContainer = $( '#lb-gmaps-front-end' );
    }

    // A small hack to evaluate the dimensions of the marker form
    $( 'body' ).append( markerForm );
    var markerFormHeight = $( 'body > #lb-gmaps-marker-form' ).height();
    var markerFormWidth = $( 'body > #lb-gmaps-marker-form' ).width();
    $( 'body > #lb-gmaps-marker-form' ).remove();

    //Here lays the logic where to display the marker form regarding the dimensions of the map
    if( mapContainer.height() < markerFormHeight + 20 && mapContainer.width() <= getMapPartOfMetabox() ) {
        markerForm.css( { 'left': 'initial', 'bottom': mapContainer.height() + 50, 'right': 'calc( ( 60% - 280px ) / 2 )' } );
        markerForm.insertBefore( '#lb-gmaps-fields' );
    } else if( mapContainer.height() < markerFormHeight + 20 && mapContainer.width() > getMapPartOfMetabox() ) {
        markerForm.css( { 'left': 'initial', 'bottom': '420px', 'right': 'calc( ( 100% - 280px ) / 2 )' } );
        markerForm.insertBefore( '#lb-gmaps-fields' );
    } else if ( mapContainer.width() < markerFormWidth ){
        markerForm.css( { 'left': mapContainer.width() + 20 + $( '#lb-gmaps-fields' ).width(), 'bottom': ( mapContainer.height() - markerFormHeight ) / 2, 'top' : 'initial' } );
        markerForm.insertBefore( '#lb-gmaps-fields' );
    } else {
        mapContainer.append( markerForm );
    }

    //Handle "Add Media" button
    if ( $( '#marker-upload-media' ).length > 0 ) {
        if ( typeof wp !== 'undefined' && wp.media && wp.media.editor ) {
            $( document ).on( 'click', '#marker-upload-media', function( e ) {
                if (this.window === undefined) {
                    this.window = wp.media({
                        title: 'Insert a marker photo',
                        library: {type: 'image'},
                        multiple: true,
                        button: {text: 'Insert'}
                    });

                    var self = this; // Needed to retrieve our variable in the anonymous function below
                    this.window.on('select', function() {
                        var selected = self.window.state().get('selection').toJSON();
                        var urls = [];
                        for ( var i = 0; i < selected.length; i++ ) {
                            if( selected[ i ].hasOwnProperty( 'url' ) ) {
                                urls.push( selected[ i ].url );
                            }
                            $( '#marker_media' ).val( urls.join( ', ' ) );
                        }
                        $( '#marker-clear-images' ).show();
                    });
                }

                this.window.open();
                return false;
            });
        }
    }

    //Handle "Clear images selection" button
    $( '#marker-clear-images' ).on( 'click', function ( e ) {
        $( '#marker_media' ).val( '' );
        $( e.target ).hide();
    } );
    tinymce.init({
        theme: 'modern',
        selector: '#marker_content',
        resize: true,
        setup: function( ed ) {
            ed.on('blur', function() {
                var content = ed.getContent();
                var field = $( '#marker_content' );
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
        dispatchTinyMCE();
        markerForm.remove();
        displayInfoWindow( map, marker, true, markers );
    } );

    $( '#save-button' ).on( 'click', function () {
        dispatchTinyMCE();
        if( markers && Array.isArray( markers ) && -1 !== markers.indexOf( markerObject.lat + markerObject.lng ) ) {
            delete markers[ markerObject.lat + markerObject.lng ];
        }

        for ( var i = 0; i < markerProps.length; i++ ) {
            markerObject[ markerProps[ i ] ] = $.trim( $( '#marker_' + markerProps[ i ] ).val() );
        }
        markerForm.remove();
        $.ajax( {
            type: "POST",
            url: admin.ajaxURL,
            data: {
                action: 'save_marker_data',
                marker: markerObject,
                security: admin.ajaxNonce
            }
        } ).then( function (data) {
            if( data ) {
                for ( var i = 0; i < markerProps.length; i++ ) {
                    marker[ markerProps[ i ] ] = markerObject[ markerProps[ i ] ];
                }
                displayInfoWindow( map, marker, true );
            }
        } );
    } );

    $( '#delete-button' ).on( 'click', function () {
        deleteMarker( marker, markers );
    } );
}

//This function handles the click on a marker
function addMarkerClickListener( map, marker, markers, content, infoWindow ) {
    //Remove old listener for its function may have been to show a content form
    google.maps.event.clearListeners( marker, 'click' );
    google.maps.event.addListener( marker, 'click', ( function( marker, markers, content, infoWindow ) {
        return function() {
            //If there is data for the given marker - show the infowindow
            if( undefined !== infoWindow && undefined !== content ) {
                infoWindow.setContent( content );
                if( undefined === infoWindow.getMap() || null === infoWindow.getMap() ) {
                    infoWindow.open( map, marker );
                }
                if( ! data.frontEnd ) {
                    $( '#edit-lb-gmaps-marker' ).on( 'click', function (  ) {
                        $( '.gm-style-iw' ).parent().remove();
                        showMarkerForm( map, marker, markers );
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
                                var oldHeight = $( '#lb-gmaps-marker-content' ).height();
                                $( '#lb-gmaps-marker-content, #lb-gmaps-marker-media' ).hide().height( 0 );
                                $( '#lb-gmaps-marker-contaier' ).append( fields );

                                $( '#transfer' ).on( 'click', function () {
                                    var maps = $( '#maps' ).find( 'option:selected' );
                                    if( maps.length ) {
                                        var succeeded = 0;
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
                                                        map_id: mapId,
                                                        security: admin.ajaxNonce
                                                    }
                                                } ).then( function ( data ) {
                                                    if( data ) {
                                                        succeeded++;
                                                    }
                                                    if( succeeded === maps.length ) {
                                                        $( '#transfer-maps-container' ).empty().append( '<div class="lb-gmaps-success">' + messages.markerSuccess + '</div>' );
                                                    } else {
                                                        $( '#transfer-maps-container' ).empty().append( '<div class="lb-gmaps-error">' + messages.markerError + '</div>' );
                                                    }
                                                    restoreMarkerAfterAjax( oldHeight );
                                                } );
                                            }
                                        }
                                    }

                                    // Remove marker transfer dropdown list and show the description of the marker
                                    function restoreMarkerAfterAjax( oldHeight ) {
                                        setTimeout( function () {
                                            $( '#transfer-maps-container' ).remove();
                                            $( '#lb-gmaps-marker-content, #lb-gmaps-marker-media' ).show().height( oldHeight );
                                        }, 2000 );
                                    }
                                } );
                                $( '#back' ).on( 'click', function () {
                                    $( '#transfer-maps-container' ).remove();
                                    $( '#lb-gmaps-marker-content, #lb-gmaps-marker-media' ).show( oldHeight );
                                } );
                            } else {
                                var height = $( '#lb-gmaps-marker-content' ).height();
                                $( '#lb-gmaps-marker-content, #lb-gmaps-marker-media' ).hide().height( 0 );
                                $( '#lb-gmaps-marker-contaier' ).append( $( '<h2 id="lb-gmaps-not-found">No Maps Found.</h2>' ) );
                                setTimeout( function () {
                                    $( '#lb-gmaps-not-found' ).remove();
                                    $( '#lb-gmaps-marker-content, #lb-gmaps-marker-media' ).show().height( height );
                                }, 2000 );
                            }
                        } );
                    } );

                    $( '#delete-lb-gmaps-marker' ).on( 'click', function () {
                        deleteMarker( marker, markers );
                    } )
                }
            } else {
                //If there is no data for the marker - show form
                showMarkerForm( map, marker, markers );
            }

        };
    } )( marker, markers, content, infoWindow ) );
}

//Delete marker from database and hide from map
function deleteMarker( marker, markers ) {
    $( '.gm-style-iw' ).parent().remove();
    google.maps.event.clearListeners( marker, 'click' );
    var markerObject = {
        post_id: post.ID,
        lat: marker.position.lat(),
        lng: marker.position.lng()
    };
    $.ajax( {
        type: 'POST',
        url: admin.ajaxURL,
        data: {
            action: 'delete_marker_data',
            marker: markerObject,
            security: admin.ajaxNonce
        }
    } ).then( function ( data ) {
        dispatchTinyMCE();

        marker.setVisible( false );

        if( ! marker.hasOwnProperty( 'lat' ) && ! marker.hasOwnProperty( 'lng' ) && markers ) {
            delete markers[ marker.position.lat() + marker.position.lng() ];
        }

        if( $( '#lb-gmaps-marker-form' ).length ) {
            $( '#lb-gmaps-marker-form' ).remove();
        }
    } )
}

//Create the content of the info window, style it and pass it to the handler.
function displayInfoWindow( map, marker, withButtons, markers ) {
    var content = $( views.infoBox );
    if( withButtons ) {
        content.find( '#lb-gmaps-marker-content' ).append( '<span id="edit-lb-gmaps-marker">Edit</span>' );
        content.find( '#lb-gmaps-marker-content' ).append( '<span id="transfer-lb-gmaps-marker">Duplicate to...</span>' );
        content.find( '#lb-gmaps-marker-content' ).append( '<span id="delete-lb-gmaps-marker">Delete</span>' );
    }
    if( null !== marker.name && null !== marker.content && undefined !== marker.name && undefined !== marker.content) {
        if( null !== marker.name && undefined !== marker.name ) {
            content.find( '#lb-gmaps-marker-name p' ).text( marker.name );
        }
        if( null !== marker.content && undefined !== marker.content ) {
            content.find( '#lb-gmaps-marker-content' ).append( marker.content );
        }
        if( null !== marker.media && undefined !== marker.media && '' !== marker.media ) {
            var urls = marker.media.split( ', ' );
            for ( var i = 0; i < urls.length; i++ ) {
                content.find( '#lb-gmaps-marker-media' ).append( '<img src="'+ urls[ i ] +'" class="lb-gmaps-marker-image">' );
            }
            content.find( '#lb-gmaps-marker-content' ).addClass( 'image-included' );
        } else {
            content.find( '#lb-gmaps-marker-media' ).remove();
        }
        var textContent = content[0].outerHTML;
        var infoWindow = new google.maps.InfoWindow( {
            maxWidth: 200
        } );

        styleInfowindow( infoWindow );
        addMarkerClickListener( map, marker, markers, textContent, infoWindow );
    } else {
        if( ! data.frontEnd ) {
            addMarkerClickListener( map, marker, markers );
        }
    }

}

//Convert database data to an object, usable by JS
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
                if( 'styles' === key ) {
                    mapData[ jsKey ] = JSON.parse( data[key].replace(/\\("|')/g, '$1' ) );
                } else if ( 'zoom_range' === key ) {
                    var range = data[ key ].split( '-' ).map( r => parseInt( r ) );
                    mapData.minZoom = range[0];
                    mapData.maxZoom = range[1];
                } else {
                    mapData[ jsKey ] = data[ key ];
                }
            }
        }
    }
    mapData.center = { lat: mapData.lat, lng: mapData.lng };

    return mapData;
}

//Convert database data to an object, usable by JS
function parseMarkerData( data ) {
    var markerData = {};
    var validProperties = [ 'post_id', 'lng', 'lat', 'name', 'content', 'media' ];
    var keys = Object.keys( data );
    for ( var i = 0; i < keys.length; i++ ) {
        if(  -1 !== validProperties.indexOf( keys[ i ] ) ) {
            if( $.isNumeric( data[ keys[ i ] ] ) ) {
                markerData[ keys[ i ] ] = parseFloat( data[ keys[ i ] ] );
            } else if( null !== data[ keys[ i ] ]  ) {
                markerData[ keys[ i ] ] = data[ keys[ i ] ];
            }
        }
    }
    return markerData;
}

//This function handles all the logic for the routing system
function mapDirections( map, markers, settings ) {
    //A small hack to parse string bool to bool -> "false" = false
    for( var key in settings.options ) {
        settings.options[ key ] = JSON.parse( settings.options[ key ] );
    }
    //If the admin finally decides to remove the routing option we have to dispatch all event listeners
    if( ! settings.options.directions ) {
        google.maps.event.clearListeners( map , 'rightclick' );
        for ( var i = 0; i < markers.length; i++ ) {
            google.maps.event.clearListeners( markers[ i ] , 'rightclick' );
        }
    } else {
        //A must functions that have to be declared though they are not used...
        settings.overlay.draw = function() {};
        settings.overlay.onAdd = function () {};
        settings.overlay.onRemove = function () {};

        settings.overlay.setMap( map );

        //The magic starts here on right click triggered by the user
        google.maps.event.addListener( map, 'rightclick', function ( event ) {
            // If the right click was executed on a marker then we have to tweak the event's data because
            // by default the event of a marker does not have pixel coordinates
            if( event.hasOwnProperty( 'isMarker' ) ) {
                var lpx =  settings.overlay.getProjection().fromLatLngToContainerPixel( event.getPosition() );
                rightClickEvent( {
                    isMarker: event.isMarker,
                    latLng: event.getPosition(),
                    pixel: lpx,
                    marker: event
                } );
            } else {
                rightClickEvent( event );
            }
        } );

        //Attach right click listener to each marker
        for ( var i = 0; i < markers.length; i++ ) {
            google.maps.event.addListener( markers[ i ], 'rightclick', function () {
                this.isMarker = true;
                google.maps.event.trigger( map, 'rightclick', this);
            } );
        }

        //Attach right click event listener to the map
        google.maps.event.addListener( map, 'click', function () {
            $( '#lb-gmaps-context-menu' ).remove();
        } );

        //Handle the right click event
        function rightClickEvent( event ) {
            //If this is not the first right click we have to delete the previous context menu
            settings.mapContainer.find( '#lb-gmaps-context-menu' ).remove();
            var menu = $( helperViews.contextMenu );

            //Remove the redundant buttons accordingly to the situation
            //If the user has clicked the "Direction from" button - on the next click it shouldn't appear
            if( ! settings.directionFrom ) {
                menu.find( '#direction-from' ).remove();
            }

            //The same goes for this option
            if( ! settings.directionTo ) {
                menu.find( '#direction-to' ).remove();
            }

            //Here we have to check whether the route has been drown and if true - show the "Add waypoint" button
            //However we want to hide it if the user has clicked the "Direction from" option
            //or it is already an origin, waypoint or destination point
            if( ! settings.polyline
                || menu.find( '#direction-to' ).length > 0
                || false !== isMarkerInWaypoints( event, settings.waypointsDuplicate )
                || isMarkerOriginOrDestination( event, settings.startEvent, settings.endEvent )
            ) {
                menu.find( '#add-waypoint' ).remove();
            }

            if( false === isMarkerInWaypoints( event, settings.waypointsDuplicate ) ) {
                menu.find( '#remove-waypoint' ).remove();
            }

            settings.mapContainer.append( menu );

            styleContextMenu( menu, settings.mapContainer, event );

            handleDirectionOptions( event );
        }

        //Style the context menu correspondingly to the click coordinates on the map
        function styleContextMenu( menu, mapContainer, event ) {
            //If enough is the distance between the ends of the container - display the context menu on the right side of the click
            menu.css( {
                'left': event.pixel.x,
                'top': event.pixel.y
            } );

            //If the click was near the right end of the map and the distance between the edge of the container is less than
            //the width of the context menu - show it on the left side of the click
            if( menu.width() + event.pixel.x > mapContainer.width() ) {
                menu.css( {
                    'left': event.pixel.x - menu.width()
                } );
            }
            //If the distance between the bottom end is less than the height of the context menu - show it on the uppre side of the click
            if( menu.height() + event.pixel.y > mapContainer.height() ) {
                menu.css( {
                    'top': event.pixel.y - menu.height()
                } );
            }
        }

        function handleDirectionOptions( event ) {

            //Reassign the reverse value of the variables "directionFrom" and "directionTo"
            //so that on the next click the context menu will display the proper buttons.
            //Increase the clicks counter and add the click event to a variable
            //in order to be accessed later for an origin point of the route
            $( '#direction-to' ).on( 'click', function () {
                settings.directionFrom = ! settings.directionFrom;
                settings.directionTo = ! settings.directionTo;

                settings.bothButtonsClicked++;

                settings.newEndEvent = event;
                handleRoute();


                $( '#lb-gmaps-context-menu' ).remove();
            } );

            //The same goes for this event listener, though here the event is the destination point
            $( '#direction-from' ).on( 'click',function () {
                settings.directionFrom = ! settings.directionFrom;
                settings.directionTo = ! settings.directionTo;

                settings.bothButtonsClicked++;

                settings.newStartEvent = event;

                $( '#lb-gmaps-context-menu' ).remove();
            } );

            //Clear all the data created by the previous route only if the the buttom "Directions From..." was not clicked,
            //otherwise reverse the click and show the "Directions From..." option in the menu and if needed "Add waypoint"
            $( '#clear-directions' ).on( 'click', function ( e ) {
                if( 0 === $( e.target ).siblings( '#direction-to' ).length ) {
                    settings.waypoints = [];
                    if( settings.polyline ) {
                        settings.polyline.setMap( null );
                        settings.polyline = undefined;
                    }

                    markers.map( m => {
                        if( m.hasOwnProperty( 'isFromDirection' ) ) {
                            m.setMap( null );
                        }
                    } );

                    if( settings.infowindow ) {
                        settings.infowindow.setMap( null );
                    }

                    $( '#lb-gmaps-directions-type' ).remove();

                    settings.directionsDisplay.setMap( null ); // clear direction from the map
                    settings.directionsDisplay = new google.maps.DirectionsRenderer; // this is to render again, otherwise your route wont show for the second time searching
                    settings.directionsDisplay.setMap( map ); //this is to set up again
                }

                settings.directionTo = false;
                settings.directionFrom = true;
                settings.bothButtonsClicked = 0;

                $( '#lb-gmaps-context-menu' ).remove();
            } );

            //Add waypoint to an object and pass them to the direction service to recalculate the route.
            //Create waypoints duplicate array in order to add the "isMarker" property to prevent putting markers on
            //already existing ones
            $( '#add-waypoint' ).on( 'click', function () {
                settings.waypoints.push( {
                    location: event.latLng,
                } );
                settings.waypointsDuplicate.push( {
                    location: event.latLng,
                    isMarker: event.isMarker
                } );

                handleRoute( settings.waypoints );

                $( '#lb-gmaps-context-menu' ).remove();
            } );

            $( '#remove-waypoint' ).on( 'click', function () {
                var index = isMarkerInWaypoints( event, settings.waypointsDuplicate );
                settings.waypoints = settings.waypoints.splice( i, 1 );
                settings.waypointsDuplicate = settings.waypointsDuplicate.splice( i, 1 );

                handleRoute( settings.waypoints );

                $( '#lb-gmaps-context-menu' ).remove();
            } );

            //This handles the route options and draws the polyline of the route
            //It can be executed by clicking "Direction From..." and "Direction To..." buttons consecutively, by adding a waypoint
            //or by choosing from the different types of travelling modes which are "DRIVING", "BICYCLING", "TRANSIT" and "wALKING"
            function handleRoute( waypts, travelMode ) {
                if( 2 === settings.bothButtonsClicked || waypts || travelMode ) {
                    if( ! travelMode ) {
                        travelMode = 'DRIVING';
                    }

                    //If both buttons are clicked consecutively - erase data from an old route
                    if( 2 === settings.bothButtonsClicked ) {
                        settings.waypointsDuplicate = [];
                        settings.waypoints = [];
                        settings.startEvent = settings.newStartEvent;
                        settings.endEvent = settings.newEndEvent;
                    }

                    settings.directionsDisplay.setMap( map );
                    settings.directionsDisplay.setOptions( {suppressMarkers: true} );

                    var request = {
                        origin: settings.startEvent.latLng,
                        destination: settings.endEvent.latLng,
                        travelMode: travelMode
                    };

                    if( waypts ) {
                        request.waypoints = waypts;
                    }

                    settings.directionsService.route( request , function( response, status ) {
                        if ( 'OK' === status ) {
                            //--- Part 1 ---
                            //Contrary to the actions taken on both buttons clicked here we delete the data on every successful route,
                            //since we want new polyline and infowindow on every route update
                            if ( ! waypts || waypts && 0 === waypts.length) {
                                markers.map( m => {
                                    m.latLng = m.position;
                                    if( m.hasOwnProperty( 'isFromDirection' ) && ! isMarkerOriginOrDestination( m, settings.startEvent, settings.endEvent ) ) {
                                        m.setMap(null);
                                    }
                                } );
                            }

                            if ( settings.polyline ) {
                                settings.polyline.setMap( null );
                            }

                            if( settings.infowindow ) {
                                settings.infowindow.setMap( null );
                            }

                            settings.polyline = new google.maps.Polyline( {
                                path: [],
                                strokeWeight: 0
                            } );

                            //--- End of Part 1 ---

                            var bounds = new google.maps.LatLngBounds();
                            settings.directionsDisplay.setDirections( response );

                            //The route legs are the pieces that construct a route from point A to point B
                            //For example - A->A1->A1->B1->B1->B where the even positions are the route leg start_location
                            //and the odd ones are the route leg end_location
                            var routeLegs = response['routes'][0]['legs'];
                            for ( var i = 0; i < routeLegs.length; i++ ) {
                                // (1)If the "Direction From..." click event is not on a marker, then create one on it
                                if ( 0 === i && ! settings.startEvent.isMarker && settings.options.routeMarkers ) {
                                    routeLegs[i].start_location = settings.startEvent.latLng;
                                    createMarkerAtLeg(routeLegs[i], 'start');
                                }
                                // (1) the same applies here
                                if ( routeLegs.length - 1 === i && ! settings.endEvent.isMarker && settings.options.routeMarkers ) {
                                    routeLegs[i].end_location = settings.endEvent.latLng;
                                    createMarkerAtLeg(routeLegs[i], 'end');
                                }
                                // Create marker on each waypoint, only if it's not a maker
                                if ( i !== 0 && i <= settings.waypointsDuplicate.length && ! settings.waypointsDuplicate[i - 1].isMarker  && settings.options.waypointsMarkers ) {
                                    routeLegs[i].start_location = settings.waypointsDuplicate[ i - 1 ].location;
                                    createMarkerAtLeg(routeLegs[i], 'start');
                                }
                                // Add each route leg to the polyline which is going to be drawn later
                                var steps = routeLegs[i].steps;
                                for (var j = 0; j < steps.length; j++) {
                                    var nextSegment = steps[j].path;
                                    for (var k = 0; k < nextSegment.length; k++) {
                                        settings.polyline.getPath().push(nextSegment[k]);
                                        bounds.extend( nextSegment[ k ] );
                                    }
                                }
                            }
                            settings.polyline.setMap( map );

                            computeTotalDistance( response );

                            if ( 0 === $( '#lb-gmaps-directions-type' ).length && settings.options.meansOfTransport ) {
                                if( data.frontEnd ) {
                                    $('#lb-gmaps-front-end').append( helperViews.travelModes );
                                } else {
                                    $('#lb-gmaps-live-preview').append( helperViews.travelModes );
                                }
                            }

                            setTimeout( function () {
                                $( '#lb-gmaps-directions-type' ).find( 'li' ).on( 'click', directionsTypeClickEvent );
                            }, 1000 );

                        } else {
                            if( 'OVER_QUERY_LIMIT' !== status ) {
                                appendErrorMessage( 'Directions request failed due to ' + status.toLowerCase().replace( /_/g, ' ' ) );
                            }
                        }
                    } );
                    settings.bothButtonsClicked = 0;

                    //This function allows us to create a marker at a waypoint defined by the user
                    function createMarkerAtLeg( routeLeg, type ) {
                        var info = routeLeg[ type + '_address' ].split( ', ' );
                        var marker = new google.maps.Marker( {
                            map: map,
                            position: routeLeg[ type + '_location' ],
                            name: info[ info.length - 1 ] + ', ' + info[ info.length - 2 ],
                            content: routeLeg[ type + '_address' ]
                        } );
                        marker.isFromDirection = true;
                        markers.push( marker );
                        google.maps.event.addListener( marker, 'rightclick', function () {
                            this.isMarker = true;
                            google.maps.event.trigger( map, 'rightclick', this);
                        } );
                        displayInfoWindow( map, marker, false );
                    }

                    //Handle each click on the different travelling modes
                    function directionsTypeClickEvent( ev ) {
                        $( '#lb-gmaps-directions-type' ).find( 'li' ).off( 'click' );
                        var travelMode = $( ev.currentTarget ).attr( 'id' ).toUpperCase();
                        if( 'TRANSIT' === travelMode && waypts && 0 < waypts.length ) {
                            appendInfoMessage( messages.transitMode );
                        } else {
                            handleRoute( settings.waypoints, travelMode );
                        }
                    }

                    function computeTotalDistance( result ) {
                        registerGetPointFromDistFunc();

                        var totalDist = 0;
                        var totalTime = 0;
                        var myroute = result.routes[0];
                        for ( i = 0; i < myroute.legs.length; i++ ) {
                            totalDist += myroute.legs[ i ].distance.value;
                            totalTime += myroute.legs[ i ].duration.value;
                        }

                        if( settings.options.routeInfowindow ) {
                            putInfoWindowOnRoute( 50 );
                        }

                        totalDist = totalDist / 1000.;

                        //This function allows us to get the click coordinates in pixels from lat and lng
                        function registerGetPointFromDistFunc() {
                            google.maps.Polygon.prototype.getPointAtDistance = function(metres) {
                                // some awkward special cases
                                if (metres == 0) return this.getPath().getAt(0);
                                if (metres < 0) return null;
                                if (this.getPath().getLength() < 2) return null;
                                var dist=0;
                                var olddist=0;
                                for (var i=1; (i < this.getPath().getLength() && dist < metres); i++) {
                                    olddist = dist;
                                    dist += google.maps.geometry.spherical.computeDistanceBetween (
                                        this.getPath().getAt(i),
                                        this.getPath().getAt(i-1)
                                    );
                                }
                                if (dist < metres) return null;
                                var p1= this.getPath().getAt(i-2);
                                var p2= this.getPath().getAt(i-1);
                                var m = (metres-olddist)/(dist-olddist);
                                return new google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m);
                            };
                            google.maps.Polyline.prototype.getPointAtDistance = google.maps.Polygon.prototype.getPointAtDistance;
                        }

                        //Display an info window showing the distance of a route and the time it takes to be travelled
                        function putInfoWindowOnRoute( percentage ) {
                            var distance = ( percentage / 100 ) * totalDist;
                            if( settings.infowindow ) {
                                settings.infowindow.setMap( null );
                            }

                            settings.infowindow = new google.maps.InfoWindow();
                            var travelModes = {
                                WALKING: 'blind',
                                DRIVING: 'car',
                                BICYCLING: 'bicycle',
                                TRANSIT: 'bus'
                            };

                            //Convert travelling duration into hours or minutes respectively
                            var timeUnit = '';
                            if( totalTime > 3600 ) {
                                totalTime = ( totalTime / 3600 ).toFixed( 1 );
                                timeUnit = 'hours';
                            } else {
                                totalTime = Math.ceil( totalTime / 60 );
                                timeUnit = 'mins';
                            }

                            settings.infowindow.setContent( ( totalDist / 1000 ).toFixed( 1 ) + " km<br>" + totalTime + " " + timeUnit + " " + '<i class="fa fa-'+ travelModes[ travelMode ] +'" aria-hidden="true"></i>' );
                            settings.infowindow.setPosition( settings.polyline.getPointAtDistance( distance ) );

                            settings.infowindow.open( map );
                        }
                    }

                    function appendErrorMessage( message ) {
                        appendMessage( 'error', message )
                    }

                    function appendInfoMessage( message ) {
                        appendMessage( 'info', message );
                    }

                    function appendMessage( type, message ) {
                        $( '#lb-gmaps-directions-type' ).hide();
                        if( data.frontEnd ) {
                            $( '#lb-gmaps-front-end' ).append( '<div id="lb-gmaps-map-'+ type +'">' + message + '</div>' );
                        } else {
                            $( '#lb-gmaps-live-preview' ).append( '<div id="lb-gmaps-map-'+ type +'">' + message + '</div>' );
                        }
                        //Remove message after three seconds
                        setTimeout( function () {
                            $( '#lb-gmaps-map-' + type ).remove();
                            $( '#lb-gmaps-directions-type' ).show().find( 'li' ).on( 'click', directionsTypeClickEvent );
                        }, 3000 )
                    }
                } else {
                    $( '#lb-gmaps-context-menu' ).find( '#add-waypoint' ).remove();
                }
            }
        }
    }
}

//Return an object containing the route setting such as markers on waypoints, info window on route...
function parseDirectionsOptions( mapData ) {
    var obj = {
        directions: mapData.directions
    };
    var keys = Object.keys( mapData ).filter( k => -1 !== k.indexOf( 'dir_' ) && -1 === k.indexOf( 'search' ) );
    for ( var i = 0; i < keys.length; i++ ) {
        var key = keys[ i ].replace( 'dir_', '' ).replace( /_([a-z]){1}/g, ( m, l ) => { return l.toUpperCase() } );
        obj[ key ] = mapData[ keys[ i ] ];
    }
    return obj;
}

//Handle the searching field on the map on the one in the admin page
function handleSearchingField( map ) {

    //Handle appearing animation
    $( '#lb-gmaps-searching-field-container' ).find( 'i' ).on( 'click', function ( e ) {
        var control = $( e.currentTarget );
        var parent = $( '#lb-gmaps-searching-field-container' );
        if(  -1 !== control.attr( 'class' ).indexOf( 'up' ) ) {
            parent.animate( { 'top': '-'+ parent.height() +'px' }, 700, function () {
                parent.find( 'i.fa-angle-down' ).css( 'display', 'block' );
                parent.find( 'i.fa-angle-up' ).css( 'display', 'none' );
            } );
        } else {
            parent.animate( { 'top': '0' }, 700, function () {
                parent.find( 'i.fa-angle-up' ).css( 'display', 'block' );
                parent.find( 'i.fa-angle-down' ).css( 'display', 'none' );
            } );
        }
    } );

    //Prevent Enter from submission
    $( '#lb-gmaps-searching-field' ).on( 'keydown', function ( e ) {
        if( 13 === e.keyCode ) {
            e.preventDefault();
        }
    } );

    //Handle the field logic itself
    var autocomplete = new google.maps.places.Autocomplete( $( '#lb-gmaps-searching-field' )[0] );
    autocomplete.bindTo( 'bounds', map );
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
}

function getMapDirectionsDefaults( map ) {
    return {
        directionTo: false,
        directionFrom: true,
        bothButtonsClicked: 0,
        directionsService: new google.maps.DirectionsService,
        directionsDisplay: new google.maps.DirectionsRenderer,
        newStartEvent: {},
        newEndEvent: {},
        startEvent: undefined,
        endEvent: undefined,
        mapContainer: $( map.getDiv() ),
        infowindow: undefined,
        waypoints: [],
        waypointsDuplicate: [],
        polyline: undefined,
        overlay: new google.maps.OverlayView
    }
}

//Dispatch tinyMCE from textarea in order to use it later
function dispatchTinyMCE() {
    if( tinymce.get('marker_content') ) {
        tinymce.get('marker_content').remove();
    }
}

function isMarkerOriginOrDestination( marker, startEvent, endEvent ) {
    if( startEvent.hasOwnProperty( 'latLng' ) && endEvent.hasOwnProperty( 'latLng' ) && marker.hasOwnProperty( 'latLng' ) ) {
        return marker.latLng.lat() === startEvent.latLng.lat()
            && marker.latLng.lng() === startEvent.latLng.lng()
            || marker.latLng.lat() === endEvent.latLng.lat()
            && marker.latLng.lng() === endEvent.latLng.lng();
    }
    return false;
}

//Check whether a marker is in the waypoints if true - return its index in the array
function isMarkerInWaypoints( marker, waypoints ) {
    for ( var i = 0; i < waypoints.length; i++ ) {
        if( waypoints[ i ].location.lat() === marker.latLng.lat()
            && waypoints[ i ].location.lng() === marker.latLng.lng() ) {
            return i;
        }
    }
    return false;
}