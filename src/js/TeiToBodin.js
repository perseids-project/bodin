/*!
 * TeiToBodin
 */
;(function( jQuery ) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn\
	 * @param { obj } _options Key value pairs to hold the plugin's configuration
	 * @param { string } _id The id of the DOM element
	 */
	function TeiToBodin( _elem, _options, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _options );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn
	 * @param { obj } _options Key value pairs to hold the plugin's configuration
	 */
	TeiToBodin.prototype.init = function( _elem, _options ) {
		var self = this;
		self.events = {
			loaded: 'TeiToBodin-LOADED'
		}
		self.src = jQuery( self.elem ).attr('src');
		if ( self.src == undefined ) {
			console.log( 'src not defined' );
			return
		}
		self.get();
	}
	
	TeiToBodin.prototype.get = function() {
		var self = this;
		jQuery.get( self.src )
		.done( function( _data ) {
			jQuery( self.elem ).html( _data );
			jQuery( self.elem ).trigger( self.events['loaded'], [ self.elem ] );
		})
		.fail( function() {
				console.log( 'Could not retrieve data at: ' + self.src );
			}
		);
	}
	
	//----------------
	//	Extend JQuery 
	//----------------
	jQuery(document).ready( function( jQuery ) {
		jQuery.fn.TeiToBodin = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new TeiToBodin( this, options, id ) );
			});
		};
	})
})(jQuery);