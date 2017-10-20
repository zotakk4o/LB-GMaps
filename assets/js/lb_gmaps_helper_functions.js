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
                                                    } else if( i === maps.length - 1 && succeeded !== maps.length ) {
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