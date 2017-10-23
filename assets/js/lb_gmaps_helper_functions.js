if( undefined === $ ) {
    var $ = jQuery.noConflict();
}
function styleInfowindow( infowindow ) {
    google.maps.event.addListener( infowindow, 'domready', function() {

        // Reference to the DIV that wraps the bottom of infowindow
        $('.gm-style-iw').addClass( 'custom-gm-style-iw' );
        var iwOuter = $('.custom-gm-style-iw');
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
        iwCloseBtn.css({opacity: '1', top: '0' , right: '-25px', border: '7px solid #417DF1', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});
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
                                                        map_id: mapId
                                                    }
                                                } ).then( function ( data ) {
                                                    if( data ) {
                                                        succeeded++;
                                                    }
                                                    if( succeeded === maps.length ) {
                                                        $( '#transfer-maps-container' ).empty().append( '<div class="lb-gmaps-success">' + messages.markerSuccess + '</div>' );
                                                        restoreMarkerAfterAjax();
                                                    } else if( succeeded !== maps.length ) {
                                                        $( '#transfer-maps-container' ).empty().append( '<div class="lb-gmaps-error">' + messages.markerError + '</div>' );
                                                        restoreMarkerAfterAjax();
                                                    }
                                                } );
                                            }
                                        }
                                    }

                                    // Remove marker transfer dropdown list and show the description of the marker
                                    function restoreMarkerAfterAjax() {
                                        setTimeout( function () {
                                            $( '#transfer-maps-container' ).remove();
                                            $( '#lb-gmaps-marker-description' ).show();
                                        }, 2000 );
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

                    $( '#delete-lb-gmaps-marker' ).on( 'click', function () {
                        deleteMarker( marker );
                    } )
                }
            } else {
                showMarkerForm( map, marker );
            }

        };
    } )( marker, content, infoWindow) );
}

function deleteMarker( marker ) {
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
        tinymce.get('marker_description').remove();
        marker.setMap( null );
        $( '#lb-gmaps-marker-form' ).remove();
    } )
}

function displayInfoWindow( map, marker, withButtons ) {
    var content = $( views.infoBox );
    if( ! data.frontEnd && withButtons ) {
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

function mapDirections( map, markers ) {
    var directionTo = false;
    var directionFrom = true;

    var bothButtonsClicked = 0;

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;

    directionsDisplay.setMap( map );

    var startEvent = {};
    var endEvent = {};

    var mapContainer = $( map.getDiv() );

    var newMarkers = [];
    var newInfowindows = [];
    var waypoints = [];
    var polyline;

    var overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap( map );



    google.maps.event.addListener( map, 'rightclick', function ( event ) {

        if( event.hasOwnProperty( 'uniqueness' ) ) {
            var lpx =  overlay.getProjection().fromLatLngToContainerPixel( event.getPosition() );
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

    for ( var i = 0; i < markers.length; i++ ) {
        google.maps.event.addListener( markers[ i ], 'rightclick', function () {
            this.isMarker = true;
            google.maps.event.trigger( map, 'rightclick', this);
        } );
    }

    google.maps.event.addListener( map, 'click', function () {
        $( '#lb-gmaps-context-menu' ).remove();
    } );

    google.maps.event.addListener( map, 'zoom_changed', function () {
        if( map.getZoom() < 16 ) {
            $( '.gm-style-iw' ).parent().hide();
        } else {
            $( '.gm-style-iw' ).parent().show();
        }
    } );

    function rightClickEvent( event ) {
        mapContainer.find( '#lb-gmaps-context-menu' ).remove();
        var menu = $( helperViews.contextMenu );

        if( ! directionFrom ) {
            menu.find( '#direction-from' ).remove();
        }

        if( ! directionTo ) {
            menu.find( '#direction-to' ).remove();
        }

        if( ! polyline || menu.find( '#direction-to' ).length > 0 ) {
            menu.find( '#add-waypoint' ).remove();
        }

        mapContainer.append( menu );

        styleContextMenu( menu, mapContainer, event );

        handleDirectionOptions( event );
    }

    function styleContextMenu( menu, mapContainer, event ) {
        menu.css( {
            'left': event.pixel.x,
            'top': event.pixel.y
        } );

        if( menu.width() + event.pixel.x > mapContainer.width() ) {
            menu.css( {
                'left': event.pixel.x - menu.width()
            } );
        }
        if( menu.height() + event.pixel.y > mapContainer.height() ) {
            menu.css( {
                'top': event.pixel.y - menu.height()
            } );
        }
    }

    function handleDirectionOptions( event ) {

        $( '#direction-to' ).on( 'click', function () {
            directionFrom = ! directionFrom;
            directionTo = ! directionTo;

            bothButtonsClicked++;

            endEvent = event;

            handleRoute();

            $( '#lb-gmaps-context-menu' ).remove();
        } );

        $( '#direction-from' ).on( 'click',function () {
           directionFrom = ! directionFrom;
           directionTo = ! directionTo;

           bothButtonsClicked++;

           startEvent = event;

           handleRoute();

            $( '#lb-gmaps-context-menu' ).remove();
        } );

        $( '#clear-directions' ).on( 'click', function () {
            directionTo = false;
            directionFrom = true;

            bothButtonsClicked = 0;
            newMarkers.map( m => m.setMap( null ) );
            newInfowindows.map( i => i.setMap( null ) );
            if( polyline ) {
                polyline.setMap( null );
                polyline = undefined;
            }

            directionsDisplay.setMap( null ); // clear direction from the map
            directionsDisplay = new google.maps.DirectionsRenderer; // this is to render again, otherwise your route wont show for the second time searching
            directionsDisplay.setMap( map ); //this is to set up again

            google.maps.event.trigger( map, 'resize' );

            $( '#lb-gmaps-context-menu' ).remove();
        } );

        $( '#add-waypoint' ).on( 'click', function () {
            waypoints.push( {
                location: event.latLng
            } );

            handleRoute( waypoints );

            $( '#lb-gmaps-context-menu' ).remove();
        } );

        function handleRoute( waypoints ) {
           if( 2 === bothButtonsClicked || waypoints ) {
               newMarkers.map( m => m.setMap( null ) );
               newInfowindows.map( i => i.setMap( null ) );
               if( polyline ) {
                   polyline.setMap( null );
                   polyline = undefined;
               }

               polyline = new google.maps.Polyline( {
                   path: [],
                   strokeColor: '#73B9FF',
                   strokeWeight: 2
               } );

               directionsDisplay.setMap( map );
               directionsDisplay.setOptions( {suppressMarkers: true} );

               var request = {
                   origin: startEvent.latLng,
                   destination: endEvent.latLng,
                   travelMode: 'DRIVING'
               };

               if( waypoints ) {
                   request.waypoints = waypoints;
               }

               directionsService.route( request , function( response, status ) {
                   if ( 'OK' === status ) {
                       var bounds = new google.maps.LatLngBounds();
                       directionsDisplay.setDirections( response );
                       var routeLegs = response['routes'][0]['legs'][0];

                       if( ! startEvent.hasOwnProperty( 'isMarker' ) ) {
                           var startInfo = routeLegs.start_address.split( ', ' );
                           var startMarker = new google.maps.Marker({
                               map: map,
                               position: routeLegs.start_location,
                               name: startInfo[ startInfo.length - 1 ] + ', ' + startInfo[ startInfo.length - 2 ],
                               content: routeLegs.start_address
                           });
                           newMarkers.push( startMarker );
                           displayInfoWindow( map, startMarker, false );
                       }

                       if( ! endEvent.hasOwnProperty( 'isMarker' ) ) {
                           var endInfo = routeLegs.end_address.split( ', ' );
                           var endMarker = new google.maps.Marker({
                               map: map,
                               position: routeLegs.end_location,
                               name: endInfo[ endInfo.length - 1 ] + ', ' + endInfo[ endInfo.length - 2 ],
                               content: routeLegs.end_address
                           });
                           newMarkers.push( endMarker );
                           displayInfoWindow( map, endMarker, false );
                       }

                       var steps = routeLegs.steps;
                       for ( var j = 0; j < steps.length; j++ ) {
                           var nextSegment = steps[ j ].path;
                           for ( var k = 0; k < nextSegment.length; k++ ) {
                               polyline.getPath().push( nextSegment[ k ] );
                               bounds.extend( nextSegment[k]);
                           }
                       }

                       polyline.setMap( map );

                       computeTotalDistance( response );

                       $('.gm-style-iw').next().remove();

                   } else {
                       window.alert( 'Directions request failed due to ' + status );
                   }
               } );
               bothButtonsClicked = 0;

               function computeTotalDistance( result ) {
                   registerGetPointFromDistFunc();

                   var totalDist = 0;
                   var totalTime = 0;
                   var myroute = result.routes[0];
                   for ( i = 0; i < myroute.legs.length; i++ ) {
                       totalDist += myroute.legs[ i ].distance.value;
                       totalTime += myroute.legs[ i ].duration.value;
                   }
                   putInfoWindowOnRoute( 50 );

                   totalDist = totalDist / 1000.;

                   function registerGetPointFromDistFunc() {
                       google.maps.Polygon.prototype.GetPointAtDistance = function(metres) {
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
                       google.maps.Polyline.prototype.GetPointAtDistance = google.maps.Polygon.prototype.GetPointAtDistance;
                   }

                   function putInfoWindowOnRoute( percentage ) {
                       var distance = ( percentage / 100 ) * totalDist;
                       var time = ( ( percentage / 100 ) * totalTime / 60 ).toFixed( 2 );
                       var infowindow = new google.maps.InfoWindow();
                       newInfowindows.push( infowindow );

                       infowindow.setContent( ( totalDist / 1000 ).toFixed( 1 ) + " km<br>" + Math.ceil( totalTime / 60 ) + " mins " );
                       infowindow.setPosition( polyline.GetPointAtDistance( distance ) );

                       infowindow.open( map );
                   }
               }
           } else {
               $( '#lb-gmaps-context-menu' ).find( '#add-waypoint' ).remove();
           }
        }
    }
}