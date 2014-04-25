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
		self.options = $.extend({
			scrollPad: 40,
			blinkAlpha: .5
		}, _options );
		//------------------------------------------------------------
		//	Events
		//------------------------------------------------------------
		self.events = {
			milestone: 'BodinUI-MILESTONE',
			align: 'BodinUI-ALIGN'
		};
		//------------------------------------------------------------
		//	Start event listeners
		//------------------------------------------------------------
		self.start();
	}
	
	/**
	 * Start the interface
	 */
	BodinUI.prototype.start = function() {
		this.makeRoom();
		this.sizeCheck();
		this.buildNav();
		this.tooltips();
		this.align();
		if ( this.options['milestones'] != undefined ) {
			this.milestones();
		}
	}
	
	/**
	 * Start alignment events
	 */
	BodinUI.prototype.align = function() {
		var self = this;
		jQuery( '.align', self.elem ).on( 'touchstart click', function( _e ) {
			_e.preventDefault();
			jQuery( window ).trigger( self.events['align'], [ jQuery( this ).attr('id') ] );
		});
	}
	
	/**
	 * Alpha blink.
	 *
	 * @param { string } _id The dom element you want to blink.
	 */
	BodinUI.prototype.alphaBlink = function( _id ) {
		var self = this;
		var dom = jQuery( '#'+_id, self.elem );
		var colors = self._alphaBlinkColors( dom );
		var times = [];
		self.blinkCounter = 0;
		for ( var i=1; i<=9; i++ ) {
			setTimeout( function() {
				jQuery( dom ).css('background-color', colors[ self.blinkCounter%colors.length ] );
				self.blinkCounter++;
			}, i*500 );
		}
	}
	
	/**
	 * Alpha blink.
	 *
	 * @param { string } _id The dom element you want to blink.
	 * @return 
	 */
	BodinUI.prototype._alphaBlinkColors = function( _dom ) {
		var color = jQuery( _dom ).css( 'background-color' );
		var numString = color.substring( color.indexOf('(')+1, color.indexOf(')')-1 );
		var numArray = numString.split(',');
		numArray[3] = this.options['blinkAlpha'];
		var newColor = 'rgba('+numArray.join(',')+')'
		return [ color, newColor ];
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
	
	/**
	* Build milestones
	*/
	BodinUI.prototype.milestones = function() {
		var self = this;
		var i = 0;
		var stones = self.options['milestones'];
		jQuery( 'p', self.elem ).each( function() {
			var index = i % stones.length;
			var stone = stones[index];
			i++;
			jQuery( this ).prepend( '<a href="" class="milestone" id="stone-'+i+'">' + stone + '</a>' );
		});
		jQuery( '.milestone' ).on( 'touchstart click', function( _e ) {
			_e.preventDefault();
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
		var pos = $( '#'+_id , self.elem ).position();
		if ( pos == undefined ) {
			return;
		}
		var scroll = pos.top - self.options['scrollPad'];
		var current = $( '.work', self.elem ).scrollTop();
		$( '.work', self.elem ).animate ({
			scrollTop: current + scroll
		}, 1000 );
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
		//------------------------------------------------------------
		//  Edition
		//------------------------------------------------------------
		var edition = 1;
		jQuery( '.edition', self.elem ).each( function() {
			var id = jQuery( this ).attr('id');
			nav += '<li><a href="#'+id+'">Edition -- '+edition+'</a></li>';
			nav += '<ul>';
			edition++;
			//------------------------------------------------------------
			//  Book
			//------------------------------------------------------------
			var book = 1;
			jQuery( '.book', this ).each( function() {
				var id = jQuery( this ).attr('id');
				nav += '<li><a href="#'+id+'">Book -- '+book+'</a></li>';
				nav += '<ul>';
				book++
				//------------------------------------------------------------
				//  Chapter
				//------------------------------------------------------------
				var chapter = 1;
				jQuery( '.chapter', this ).each( function() {
					//------------------------------------------------------------
					//   What are you going to use as a chapter title?
					//------------------------------------------------------------
					var title = jQuery( 'h1', this ).text();
					var subtitle = jQuery( 'h2', this ).text();
					var text = 'Chapter -- '+chapter;
					if ( title != '' ) {
						text = '<div>'+title+'</div><div>'+subtitle+'</div>';
					}
					var id = jQuery( this ).attr('id');
					nav += '<li><a href="#'+id+'">'+text+'</a></li>';
					chapter++;
				});
				nav += '</ul>';
			});
			nav += '</ul>';
		});
		nav += '</ul>';
		//------------------------------------------------------------
		//  Start sidecart
		//------------------------------------------------------------
		self.sidecart = jQuery( '#sidecart_'+id ).sidecart({
			side: 'top',
			inside: true,
			views: [
				{
					id: id+'-view-1',
					type: 'nav',
					link: 'index',
					text: nav,
					init: function() {},
					refresh: function() {}
				}
			]
		}).data( '#sidecart_'+id );
		//------------------------------------------------------------
		//  Start nav events
		//------------------------------------------------------------
		self.navEvents();
	}
	
	BodinUI.prototype.navEvents = function() {
		var self = this;
		var id = jQuery( self.elem ).attr('id');
		jQuery( '#sidecart_'+id+' .nav a', this.elem ).on( 'touchstart click', function( _e ){
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