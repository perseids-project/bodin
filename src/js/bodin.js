/*!
 * Bodin
 * http://adamtavares.com
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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

/**
 * BodinAlign
 */
var BodinAlign = function() {
	//------------------------------------------------------------
	//	This class is a singleton.	Ensure only one instance exists.
	//------------------------------------------------------------
	if ( BodinAlign.prototype._singleton ) {
		return BodinAlign.prototype._singleton;
	}
	BodinAlign.prototype._singleton = this;
	
	this.src = {};
	this.xml = {};
	this.config = null;
	this.events = {
		loaded: 'BodinAlign-LOADED'
	};
	/**
	 *	Start it up!
	 *
	 *	@param { obj } _config Looks like this...
	 *		[
	 *			{ 
	 *				src: 'tempXml/alignment.xml', 
	 *				ids: [ 'latin', 'english' ] 
	 *			}
	 *		]
	 */
	this.start = function( _config ) {
		//------------------------------------------------------------
		//	Store the config for later use
		//------------------------------------------------------------
		this.config = _config;
		//------------------------------------------------------------
		//	Get the unique alignment source
		//------------------------------------------------------------
		for ( var i in _config ) {
			this.src[ _config[i]['src'] ] = 1;
		}
		//------------------------------------------------------------
		//	Create a container
		//------------------------------------------------------------
		for ( var i in this.src ) {
			this.xml[ i ] = { loaded: false };
		}
		//------------------------------------------------------------
		//	Get each alignment xml
		//------------------------------------------------------------
		for ( var i in this.src ) {
			this._get( i );
		}
	}
	
	/**
	 *	Retrieve an alignment xml document
	 *
	 *	@param { string } _src URL to an XML document
	 */
	this._get = function( _src ) {
		var self = this;
		jQuery.get( _src )
		.done( function( _data ){
			self.xml[ _src ]['data'] = _data;
			self.xml[ _src ]['loaded'] = true;
			self.loadCheck();
		})
		.fail( function(){
			console.log( 'Could not load alignment xml: '+ _src );
		})
	}
	
	/**
	 *	Check to see if each is loaded
	 */
	this.loadCheck = function() {
		for ( var i in this.xml ) {
			if ( this.xml[i]['loaded'] != true ) {
				return;
			}
		}
		jQuery( window ).trigger( this.events['loaded'] );
	}
}

/**
 * BodinUI
 */
;(function( jQuery ) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn\
	 * @param { obj } _options Key value pairs to hold the plugin's configuration
	 * @param { string } _id The id of the DOM element
	 */
	function BodinUI( _elem, _options, _id ) {
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
	BodinUI.prototype.init = function( _elem, _options ) {
		var self = this;
		//------------------------------------------------------------
		//	Mark your territory
		//------------------------------------------------------------
		jQuery( self.elem ).addClass('bodin');
		//------------------------------------------------------------
		//	User options 
		//------------------------------------------------------------
		self.options = $.extend({}, _options );
		//------------------------------------------------------------
		//	Events
		//------------------------------------------------------------
		self.events = {
			goTo: 'BodinUI-GOTO'
		};
		//------------------------------------------------------------
		//	Start event listeners
		//------------------------------------------------------------
		self.start();
	}
	
	BodinUI.prototype.start = function() {
		this.makeRoom();
		this.sizeCheck();
		this.buildNav();
		this.tooltips();
		//this.milestones();
	}
	
	/**
	 * Organize instances of bodin into columns
	 *
	 * @param {int } _count The number of instances.
	 */
	BodinUI.prototype.makeRoom = function() {
		var count = jQuery( '.bodin' ).length
		var styler = new Styler();
		var percent = parseInt( 100/count );
		styler.add({
			'.bodin': 'width: '+percent+'%'
		});
	}

	/**
	* Check the size of the instance.
	*/
   BodinUI.prototype.sizeCheck = function() {
		var self = this;
		jQuery( window ).resize( function() {
			if ( jQuery( self.elem ).width() < 450 ) {
				jQuery( self.elem ).addClass('slim');
			}
			else {
				jQuery( self.elem ).removeClass('slim');
			}
		});
	}
	
	BodinUI.prototype.showMilestones = function() {
		var self = this;
		jQuery( 'p', self.elem ).each( function() {
			console.log( this );
		});
		/*
		this.tooltip.css({ 
			left: pos_left, 
			top: pos_top 
		})*/
	}
	
	/**
	* Build the nav.
	*/
	BodinUI.prototype.buildNav = function() {
		var self = this;
		var id = jQuery( self.elem ).attr('id');
		jQuery( self.elem ).prepend('\
			<div id="sidecart_'+id+'"></div>\
		');
		var nav = '';
		//------------------------------------------------------------
		//  Get the nav by walking the dom
		//------------------------------------------------------------
		jQuery( '.edition', self.elem ).each( function() {
			jQuery( '.book', this ).each( function() {
				console.log( this );
				jQuery( '.chapter', this ).each( function() {
					console.log( this );
				});
			})
		})
		//------------------------------------------------------------
		//  Start sidecart
		//------------------------------------------------------------
		jQuery( '#sidecart_'+id ).sidecart({
			side: 'top',
			inside: true,
			views: [
				{
					id: id+'-view-1',
					type: 'nav',
					link: 'index',
					src: '#content',
					init: function() {},
					refresh: function() {}
				},
				{
					id: id+'-view-2',
					type: 'extras',
					link: 'extras',
					src: '#content',
					init: function() {},
					refresh: function() {}
				},
				{
					id: id+'-view-3',
					type: 'config',
					link: 'config',
					src: '#content',
					init: function() {},
					refresh: function() {}
				}
			]
		});
	}
	
	BodinUI.prototype.tooltips = function() {
		var id = jQuery( this.elem ).attr('id');
		new Tooltipper( '#'+id+' .work' );
	}
	
	//----------------
	//	Extend JQuery 
	//----------------
	jQuery(document).ready( function( jQuery ) {
		jQuery.fn.BodinUI = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new BodinUI( this, options, id ) );
			});
		};
	})
})(jQuery);

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

/**
 * Tooltip
 */
function Tooltipper( _root ) {
	this.root = _root;
	this.tooltip = jQuery( '<div id="tooltipper"></div>' );
	this.start();
	this.target = null;
}

/**
 * Start Tooltipper
 */
Tooltipper.prototype.start = function() {
	var self = this;
	//------------------------------------------------------------
	//  Click listener
	//------------------------------------------------------------
	jQuery( self.root + ' [rel~=tooltip]' ).bind( 'touchstart click', function( _e ) {
		_e.preventDefault();
		//------------------------------------------------------------
		//  Store reference to clicked element.
		//------------------------------------------------------------
		self.target = jQuery(this);
		//------------------------------------------------------------
		//  Remove existing tooltip
		//------------------------------------------------------------
		jQuery( self.root+' #tooltipper' ).remove();
		//------------------------------------------------------------
		//  Check for title
		//------------------------------------------------------------
		var tip = jQuery( this ).attr( 'title' );
		if ( !tip || tip == '' ) {
			return false;
		}
		//------------------------------------------------------------
		//  Add the tooltip.
		//------------------------------------------------------------
		self.tooltip.css( 'opacity', 0 ).html( tip ).appendTo( 'body' );
		//------------------------------------------------------------
		//  Position it.
		//------------------------------------------------------------
		self.position();
	});
	//------------------------------------------------------------
	//  Listen for events that require repositioning
	//------------------------------------------------------------
	jQuery( window ).resize( function() {
		self.position() 
	});
	jQuery( self.root ).scroll( function() {
		self.position() 
	});
}

/**
 * Position the tooltip
 */
Tooltipper.prototype.position = function() {
	//------------------------------------------------------------
	//  Only procceed if you have what you need.
	//------------------------------------------------------------
	if ( this.tooltip == undefined || this.target == undefined ) {
		return;
	}
	//------------------------------------------------------------
	//  Calculate the position of tooltip relative to the target.
	//------------------------------------------------------------ 
	if ( jQuery( window ).width() < this.tooltip.outerWidth() * 1.5 ) {
		this.tooltip.css( 'max-width', jQuery( window ).width() / 2 );
	}
	else {
		this.tooltip.css( 'max-width', 340 );
	}
	var pos_left = this.target.offset().left + ( this.target.outerWidth() / 2 ) - ( this.tooltip.outerWidth() / 2 );
	var pos_top  = this.target.offset().top - this.tooltip.outerHeight() - 10;
	if ( pos_left < 0 ) {
		pos_left = this.target.offset().left + this.target.outerWidth() / 2 - 20;
		this.tooltip.addClass( 'left' );
	}
	else {
		this.tooltip.removeClass( 'left' );
	}
	if ( pos_left + this.tooltip.outerWidth() > jQuery( window ).width() ) {
		pos_left = this.target.offset().left - this.tooltip.outerWidth() + this.target.outerWidth() / 2 + 20;
		this.tooltip.addClass( 'right' );
	}
	else {
		this.tooltip.removeClass( 'right' );
	}
	if ( pos_top < 0 ) {
		var pos_top  = this.target.offset().top + this.target.outerHeight() + 10;
		this.tooltip.addClass( 'top' );
	}
	else {
		this.tooltip.removeClass( 'top' );
	}
	//------------------------------------------------------------
	//  Position that tooltip!
	//------------------------------------------------------------
	this.tooltip.css({ 
		left: pos_left, 
		top: pos_top 
	});
	this.tooltip.animate({
		opacity: 1 
	}, 50 );
}