/**
 * BodinUI
 */
;(function( jQuery ) {
	
	/**
	 * Holds default config, adds user defined config, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn\
	 * @param { obj } _config Key value pairs to hold the plugin's configuration
	 * @param { string } _id The id of the DOM element
	 */
	function BodinUI( _elem, _config, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _config );
	}
	
	/**
	 * Holds default config, adds user defined config, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn
	 * @param { obj } _config Key value pairs to hold the plugin's configuration
	 */
	BodinUI.prototype.init = function( _elem, _config ) {
		var self = this;
		//------------------------------------------------------------
		//	Mark your territory
		//------------------------------------------------------------
		jQuery( self.elem ).addClass('bodin');
		//------------------------------------------------------------
		//  Get the instance id
		//------------------------------------------------------------
		self.id = jQuery( self.elem ).attr('id');
		//------------------------------------------------------------
		//	User config 
		//------------------------------------------------------------
		self.config = jQuery.extend({
			scrollPad: 40,
			blinkAlpha: .5,
			blinkLength: .5, // seconds
			blinkN: 3
		}, _config );
		//------------------------------------------------------------
		//  If alignment data gets passed
		//------------------------------------------------------------
		if ( 'align_config' in self.config ) {
			self.align_config = self.config['align_config'];
		}
		if ( 'alignments' in self.config ) {
			self.alignments = self.config['alignments'];
		}
		//------------------------------------------------------------
		//	Events
		//------------------------------------------------------------
		self.events = {
			milestone: 'BodinUI-MILESTONE',
			align: 'BodinUI-ALIGN',
			switch_highlight: 'BodinUI-SWITCH_HIGHLIGHT',
			external: 'BodinUI-EXTERNAL',
			inline: 'BodinUI-INLINE',
			hide: 'BodinUI-HIDE',
			show: 'BodinUI-SHOW'
		};
		//------------------------------------------------------------
		//  Sidecart is the option tab you see at the top
		//------------------------------------------------------------
		self.sidecart = undefined;
		//------------------------------------------------------------
		//	Start event listeners
		//------------------------------------------------------------
		self.start();
	}
	
	/**
	 * Hide BodinUI
	 */
	BodinUI.prototype.hide = function() {
		var self = this;
		if ( self.visible == true ) {
			jQuery( self.elem ).hide();
			self.makeRoom();
			jQuery( window ).trigger( self.events['hide'] );
		}
	}
	
	/**
	 * Is the BodinUI instance visible?
	 */
	BodinUI.prototype.visible = function() {
		var self = this;
		return jQuery( self.elem ).is(":visible");
	}
	
	/**
	 * Show BodinUI
	 */
	BodinUI.prototype.show = function() {
		var self = this;
		if ( self.visible == false ) {
			jQuery( self.elem ).show();
			self.makeRoom();
			jQuery( window ).trigger( self.events['show'] );
		}
	}
	
	/**
	 * Get all alignment ids
	 */
	BodinUI.prototype.alignIds = function() {
		var ids = {};
		jQuery( '.align', self.elem ).each( function(){
			ids[ jQuery( this ).attr( 'data-alignid' ) ] = 1;
		});
		console.log( ids );
	}
	
	/**
	 * Returns the options
	 */
	BodinUI.prototype.startOptionsUI = function() {
		var self = this;
		//------------------------------------------------------------
		//  Start the switch click event handlers
		//------------------------------------------------------------
		jQuery( '.onoffswitch-label', self.elem ).on( 'touchstart click', function(_e) {
			//------------------------------------------------------------
			//  Switch
			//------------------------------------------------------------
			var id = jQuery( this ).attr('for');
			var on_off = jQuery( '.onoffswitch input#' + id, self.elem );
			var on = ( on_off.prop( 'checked' ) == true ) ? false : true; 
			//------------------------------------------------------------
			//  Events
			//------------------------------------------------------------
			switch ( id ) {
				case 'highlight_' + self.id:
					//------------------------------------------------------------
					//  Grab ids to deactivate corresponding bodin instances
					//------------------------------------------------------------
					var align = jQuery( '.align', self.elem );
					var ids = {};
					align.each( function() {
						ids[ jQuery( this ).attr( 'data-alignid' ) ] = 1;
					});
					if ( on == false ) {
						self.deactivateIds( ids );
					}
					else {
						self.activateIds( ids );
					}
					break;
			}
			//------------------------------------------------------------
			//  Close the window
			//------------------------------------------------------------
			setTimeout( function(){
				self.sidecart.hide();
			}, .25*1000 );
		});
	}
	
	/**
	 * Deactivate/Unhighlight alignments
	 *
	 * @param { array } _ids
	 */
	BodinUI.prototype.deactivateIds = function( _ids ) {
		for ( var id in _ids ) {
			jQuery( '.align[ data-alignid = "' + id + '"]' ).removeClass( 'active' );
		}
	}
	
	/**
	 * Activate/Highlight alignments
	 *
	 * @param { array } _ids
	 */
	BodinUI.prototype.activateIds = function( _ids ) {
		for ( var id in _ids ) {
			jQuery( '.align[ data-alignid = "' + id + '"]' ).addClass( 'active' );
		}
	}
	
	/**
	 * Start the interface
	 */
	BodinUI.prototype.start = function() {
		var self = this;
		self.makeRoom();
		self.sizeCheck();
		self.buildNav();
		self.tooltips();
		self.align();
		jQuery( window ).resize( function() {
			self.sizeCheck();
		});
	}
	
	/**
	 * Used during development to explore DOM structure
	 *
	 * @param { dom } _target
	 * @param { string } _selector
	 */
	BodinUI.prototype.domProbe = function( _target, _selector ) {
		var self = this;
		var parents = jQuery( _target ).parents( _selector );
		var children = jQuery( _target ).children( _selector );
		var siblings = jQuery( _target ).siblings( _selector );
		console.log( '-- Parents ----');
		console.log( parents );
		console.log( '-- Children ----');
		console.log( children );
		console.log( '-- Siblings ----');
		console.log( siblings );
	}
	
	/**
	 * Trigger an alignment by passing 
	 *
	 * @param { dom } _elem
	 */
	BodinUI.prototype.alignTrigger = function( _elem ) {
		var self = this;
		var alignId = jQuery( _elem ).attr( 'data-alignId' );
		jQuery( window ).trigger( self.events['align'], [ 'align','data-alignId', alignId ] );
	}
	
	BodinUI.prototype.alignClick = function() {
		var self = this;
		//------------------------------------------------------------
		//  Alignment click.
		//------------------------------------------------------------
		jQuery( '.align', self.elem ).on( 'touchstart click', function( _e ) {
			_e.stopPropagation();
			_e.preventDefault();
			
			if ( 'selector' in self && self.selector != undefined ) {
				self.selector.remove();
			}
			self.selector = new BodinSelector( self );
			//------------------------------------------------------------
			//  If there isn't any overlap just align.
			//------------------------------------------------------------
			if ( self.selector.menuCheck( _e ) == false ) {
				self.alignTrigger( this );
			}
		});
	}
	
	BodinUI.prototype.externalClick = function( _elem ) {
		var self = this;
		jQuery( '.external, .link', _elem ).on( 'touchstart click', function( _e ) {
			if ( 'selector' in self && self.selector != undefined ) {
				self.selector.remove();
			}
			self.selector = new BodinSelector( self );
			//------------------------------------------------------------
			//  If there isn't any overlap just align.
			//------------------------------------------------------------
			if ( self.selector.menuCheck( _e ) == false ) {
				var id = jQuery( this ).attr('data-alignId')
				var uri = jQuery ( this ).attr('data-alignUri');
				var motivation = jQuery ( this ).attr('data-motivation');
				jQuery( window ).trigger( self.events['external'], [ uri, id, motivation ] );
			}
			_e.stopPropagation();
			_e.preventDefault();
		});
	}
	
	BodinUI.prototype.widgetClick = function() {
		var self = this;
		jQuery( '.inline-widget', self.elem ).on( 'touchstart click', function( _e ) {
			_e.stopPropagation();
			_e.preventDefault();
			//------------------------------------------------------------
			//  If the alignments are not active just exit.
			//------------------------------------------------------------
			if ( jQuery( this ).hasClass( 'active') == false ) {
				return;
			}
			var id = jQuery( this ).attr('data-alignId')
			var motivation = jQuery ( this ).attr('data-motivation');
			var src = jQuery( this ).attr('data-source');
			jQuery( window ).trigger( self.events['inline'], [ id, motivation, src ] );
		});
	}
	
	/**
	 * Start alignment events
	 */
	BodinUI.prototype.align = function() {
		var self = this;
		self.alignClick();
		self.externalClick( self.elem );
		self.widgetClick();
	}
	
	/**
	 * Alpha blink.
	 *
	 * @param { string } _id The dom element you want to blink.
	 */
	BodinUI.prototype.alphaBlink = function( _id ) {
		var self = this;
		var dom = jQuery( '#'+_id, self.elem );
		var times = [];
		self.blinkCounter = 0;
		var ii = (self.config['blinkN']*2);
		for ( var i=1; i<=ii; i++ ) {
			setTimeout( function() {
				jQuery( dom ).toggleClass( 'blink' );
				self.blinkCounter++;
			}, i*self.config['blinkLength']*1000 );
		}
	}
	
	/**
	* Alpha blink a specific element
	*
	*  @param { string } _filter a class filter to make it perform
	*  @param { string } _key The element attribute key name
	*  @param { string } _val The element attribute key value 
	*/
	BodinUI.prototype.filteredAlphaBlink = function( _filter, _key, _val) {
		var self = this;
		var dom = jQuery( '.'+_filter + '[' + _key + "='" + _val + "']" , self.elem );
		var times = [];
		self.blinkCounter = 0;
		var ii = (self.config['blinkN']*2);
		for ( var i=1; i<=ii; i++ ) {
			setTimeout( function() {
				jQuery( dom ).toggleClass( 'blink' );
				self.blinkCounter++;
			}, i*self.config['blinkLength']*1000 );
		}
	}
	
	/**
	 * Organize instances of bodin into columns
	 */
	BodinUI.prototype.makeRoom = function() {
		var self = this;
		var count = jQuery( '.bodin:visible' ).length
		var styler = new Styler();
		var percent = parseInt( 100/count );
		styler.add({
			'.bodin': 'width: '+percent+'%'
		});
	}
	
	/**
	 * Fit sidecart instance into this bodin instance
	 */
	BodinUI.prototype.sidecartFit = function() {
		var self = this;
		var events = self.events['hide']+' '+self.events['show'];
		jQuery( window ).on( events, function() {
			if ( self.sidecart != undefined ) {
				self.sidecart.fitToParent();
			}
		});
	}

	/**
	* Check the size of the instance.
	*/
	BodinUI.prototype.sizeCheck = function() {
		if ( jQuery( this.elem ).width() < 450 ) {
			jQuery( this.elem ).addClass('slim');
		}
		else {
			jQuery( this.elem ).removeClass('slim');
		}
	}
	
	/**
	* Milestones touch
	*/
	BodinUI.prototype.milestonesTouch = function() {
		var self = this;
		jQuery( '.milestone', self.elem ).on( 'touchstart click', function( _e ) {
			_e.preventDefault();
			console.log( jQuery( this ).prevAll( '.page_n' ) );
			jQuery( window ).trigger( self.events['milestone'], [ jQuery( this ).attr('id') ] );
		});
	}
	
	/**
	*  Go to a particular element
	*
	*  @param { string } _id The element's id
	*/
	BodinUI.prototype.goTo = function( _id ) {
		var self = this;
		var pos = jQuery( '#'+_id , self.elem ).position();
		if ( pos == undefined ) {
			return;
		}
		var scroll = pos.top - self.config['scrollPad'];
		var current = jQuery( '.work', self.elem ).scrollTop();
		jQuery( '.work', self.elem ).animate ({
			scrollTop: current + scroll
		}, 1000 );
	}
	
	/**
	*  Go to a particular element
	*  with the a supplied attribute
	*
	*  @param { string } _filter a class filter to make it perform
	*  @param { string } _key The element attribute key name
	*  @param { string } _val The element attribute key value 
	*/
	BodinUI.prototype.filteredGoTo = function( _filter, _key, _val ) {
		var self = this;
		var selector = '.'+_filter + '[' + _key + "='" + _val + "']";
		var pos = jQuery( selector , self.elem ).position();
		if ( pos == undefined ) {
			return;
		}
		var scroll = pos.top - self.config['scrollPad'];
		var current = jQuery( '.work', self.elem ).scrollTop();
		jQuery( '.work', self.elem ).animate ({
			scrollTop: current + scroll
		}, 1000 );
		//------------------------------------------------------------
		//  Add color
		//------------------------------------------------------------
		jQuery( selector ).addClass( 'active' );
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
		var nav = '<ul>';
		//------------------------------------------------------------
		//  Build the nav.
		//  TODO I could make this a recursive function...
		//  Is it worth it?
		//------------------------------------------------------------
		var chapter = 1; 
		var chapExists = false;
		jQuery( '.chapter', self.elem ).each( function() {
			chapExists = true;
			//------------------------------------------------------------
			//   What are you going to use as a chapter title?
			//------------------------------------------------------------
			var title = jQuery( 'h3', this ).text();
			var text = '<div>'+title+'</div>';
			//------------------------------------------------------------
			//  If no title is found just do this...
			//------------------------------------------------------------
			if ( title == '' ) {
				text = 'Chapter -- '+chapter;
			}
			var id = jQuery( this ).attr('id');
			nav += '<li><a href="#'+id+'">'+text+'</a></li>';
			chapter++;
		});
		nav += '</ul>';
		//------------------------------------------------------------
		//  Start sidecart
		//------------------------------------------------------------
		if ( chapExists == true ) {
			self.buildSidecart( id, nav );
		}
		//------------------------------------------------------------
		//  Start nav events
		//------------------------------------------------------------
		self.navEvents();
	}
	
	/**
	* Build the sidecart.
	*
	* @param { string } _id
	* @param { string } _text
	*/
	BodinUI.prototype.buildSidecart = function( _id, _text ) {
		var self = this;
		self.sidecart = jQuery( '#sidecart_'+_id ).sidecart({
			side: 'top',
			inside: true,
			views: [
				{
					id: _id+'-view-1',
					type: 'nav',
					link: 'Chapters',
					text: _text,
					init: function() {},
					refresh: function() {}
				}
			]
		}).data( '#sidecart_'+_id );
		self.sidecartFit();
	}
	
	/**
	* Start the index navigation events
	*/
	BodinUI.prototype.navEvents = function() {
		var self = this;
		var id = jQuery( self.elem ).attr('id');
		jQuery( '#sidecart_'+id+' .nav a', this.elem ).on( 'touchstart click', function( _e ) {
			_e.preventDefault();
			var id = jQuery( this ).attr('href').replace('#', '');
			self.sidecart.hide();
			self.goTo( id );
		});
	}
	
	/**
	* Start the tooltips
	*/
	BodinUI.prototype.tooltips = function() {
		var id = jQuery( this.elem ).attr( 'id' );
		new Tooltipper( '#'+id+' .work' );
	}
	
	//----------------
	//	Extend JQuery 
	//----------------
	jQuery( document ).ready( function( jQuery ) {
		jQuery.fn.BodinUI = function( config ) {
			var id = jQuery( this ).selector;
			return this.each( function() {
				jQuery.data( this, id, new BodinUI( this, config, id ) );
			});
		};
	})
})(jQuery);