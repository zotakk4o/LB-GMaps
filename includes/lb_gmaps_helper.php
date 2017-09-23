<?php

class LB_GMaps_Helper {
	public static function include_file( $file ) {
		$folder = explode( '/', $file )[0];
		$file_name = substr( $file, strpos( $file, '/' ), '1000' );

		switch ( $folder ) {
			case 'includes':
				return include_once LB_GMAPS_INCLUDES . "$file_name.php";
			default:
				return false;
		}
	}
}