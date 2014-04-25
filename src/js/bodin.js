/*!
 * Bodin
 * http://adamtavares.com
 */
var Bodin = function() {
	//------------------------------------------------------------
	//	This class is a singleton.	Ensure only one instance exists.
	//------------------------------------------------------------
	if ( Bodin.prototype._singleton ) {
		return Bodin.prototype._singleton;
	}
	Bodin.prototype._singleton = this;
	//------------------------------------------------------------
	//	Store the config
	//------------------------------------------------------------
	this.config = {};
	this.bodin_align = new BodinAlign();
	//------------------------------------------------------------
	//	Events
	//------------------------------------------------------------
	this.events = {
		loaded: 'Bodin-LOADED'
	}
	/**
	 * Start the plugin
	 */
	this.start = function( _selector ) {
		var self = this;
		//------------------------------------------------------------
		//	Store the configuration
		//------------------------------------------------------------
		jQuery( _selector ).each( function() {
			//------------------------------------------------------------
			//	Keep track of when the content has been loaded
			//------------------------------------------------------------
			var id = jQuery( this ).attr('id');
			var src = jQuery( this ).attr('src');
			//------------------------------------------------------------
			//	Setup load listener
			//------------------------------------------------------------
			jQuery( '#'+id ).on( 'TeiToBodin-LOADED', function( _e, _data ) {
				self.loadCheck( _data );
			});
			self.config[id] = {
				teiToBodin: jQuery( '#'+id ).TeiToBodin().data( '#'+id )
			};
		});
	}
	/**
	 * loadCheck
	 */
	this.loadCheck = function( _data ) {
		//------------------------------------------------------------
		//	Mark instance as loaded.
		//------------------------------------------------------------
		var id = jQuery( _data ).attr('id');
		this.config[id]['loaded'] = true;
		//------------------------------------------------------------
		//	Check to see if all instances are loaded.
		//------------------------------------------------------------
		for ( var id in this.config ) {
			if ( this.config[id]['loaded'] != true ) {
				return;
			}
		}
		//------------------------------------------------------------
		//	Loaded trigger
		//------------------------------------------------------------
		jQuery( window ).trigger( this.events['loaded'] );
	}
}