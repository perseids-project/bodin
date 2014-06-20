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
	 * Returns the options
	 */
	BodinUI.prototype.optionsUI = function() {
		var self = this;
		return '\
			<div class="switches">\
			\
				<!-- Highlights -->\
				<h3>Highlights</h3>\
				<div class="onoffswitch">\
					<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="highlight_'+self.id+'" checked>\
					<label class="onoffswitch-label" for="highlight_'+self.id+'">\
						<div class="onoffswitch-inner"></div>\
						<div class="onoffswitch-switch"></div>\
					</label>\
				</div>\
				<!-- External -->\
				<h3>External Only</h3>\
				<div class="onoffswitch">\
					<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="external'+self.id+'" checked>\
					<label class="onoffswitch-label" for="external'+self.id+'">\
						<div class="onoffswitch-inner"></div>\
						<div class="onoffswitch-switch"></div>\
					</label>\
				</div>\
				<!-- Commentaries -->\
				<h3>Commentaries Only</h3>\
				<div class="onoffswitch">\
					<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="commentaries'+self.id+'" checked>\
					<label class="onoffswitch-label" for="commentaries'+self.id+'">\
						<div class="onoffswitch-inner"></div>\
						<div class="onoffswitch-switch"></div>\
					</label>\
				</div>\
			\
			</div>'
	}
	
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
//					jQuery( '.external', self.elem ).toggleClass( 'active' );
//					jQuery( ' .inline', self.elem ).toggleClass( 'active' );
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
	
	BodinUI.prototype.deactivateIds = function( _ids ) {
		for ( var id in _ids ) {
			jQuery( '.align[ data-alignid = "' + id + '"]' ).removeClass( 'active' );
		}
	}
	
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
	 * Get all of a token's active alignments
	 */
	BodinUI.prototype.allTargets = function( _target, _name ) {
		var self = this;
		var targets = [];
		var className = _name.substring(1);
		if ( jQuery( _target ).hasClass( className ) ) {
			targets.push( _target );
		}
		var parents = jQuery( _target ).parents( _name );
		for ( var i=0; i<parents.length; i++ ) {
			targets.push( parents[i] );
		}
		return targets;
	}
	
	/**
	 * Build the overlap menu.
	 */
	BodinUI.prototype.overlapMenu = function( _e ) {
		var self = this;
		//------------------------------------------------------------
		//  Check to see if alignment is overlapping.
		//------------------------------------------------------------
		var aligns = self.allTargets( _e.currentTarget, '.align' );
		//------------------------------------------------------------
		//  Check to see if external links are overlapping.
		//------------------------------------------------------------
		aligns = aligns.concat( self.allTargets( _e.currentTarget, '.external' ) );
		//------------------------------------------------------------
		//  Otherwise display a menu to select the right alignment.
		//------------------------------------------------------------
		if ( aligns.length == 1 ) {
			return false;
		}
		//------------------------------------------------------------
		//  Grab the align-id and color.
		//------------------------------------------------------------
		var items = {};
		for ( var i=0; i<aligns.length; i++ ) {
			var alignId = jQuery( aligns[i] ).attr( 'data-alignId' );
			//------------------------------------------------------------
			//  Normal alignment
			//------------------------------------------------------------
			if ( jQuery( aligns[i] ).hasClass('align') ) {
				var clss = jQuery( aligns[i] ).attr( 'class' ).split(' ');
				for ( var j=0; j<clss.length; j++ ) {
					if ( clss[j].indexOf( 'color-' ) != -1 ) {
						items[ alignId ] = {};
						items[ alignId ]['color'] = clss[j];
					}
				};
				items[ alignId ]['type'] = 'align'
				items[ alignId ]['first_and_last'] = self.firstAndLast( alignId );
			}
			//------------------------------------------------------------
			//  External alignment
			//------------------------------------------------------------
			if ( jQuery( aligns[i] ).hasClass('external') ) {
				items[ alignId ] = {};
				items[ alignId ]['type'] = 'external'
				items[ alignId ]['uri'] = jQuery( aligns[i] ).attr( 'data-alignuri' );
				items[ alignId ]['motivation'] = jQuery( aligns[i] ).attr( 'data-motivation' );
			}
		}
		//------------------------------------------------------------
		//  Build the menu
		//------------------------------------------------------------
		self.overlapMenuBuild( items );
		//------------------------------------------------------------
		//  Move the menu into position.
		//------------------------------------------------------------
		self.overlapMenuPos( _e.clientX, _e.clientY );
		//------------------------------------------------------------
		//  Start the menu touch event listener.
		//------------------------------------------------------------
		self.overlapMenuStart();
		return true;
	}
	
	BodinUI.prototype.overlapMenuBuild = function( _items ) {
		var self = this;
		self.overlapMenuRemove();
		self.menu = jQuery( '<div id="bodinMenu"></div>' );
		for ( var id in _items ) {
			var item = jQuery( self.overlapMenuItem( _items, id )  );
			item.addClass( _items[id]['color'] );
			item.addClass( 'active' );
			self.menu.append( item );
		}
		jQuery( 'body' ).append( self.menu );
	}
	
	/**
	 * Build an overlap menu item.
	 */
	BodinUI.prototype.overlapMenuItem = function( _items, _id ) {
		switch ( _items[ _id ]['type'] ) {
		//------------------------------------------------------------
		//  Alignment link
		//------------------------------------------------------------
		case 'align':
			return '<a href="" \
						class="alignLink" \
						data-alignId="'+ _id +'"> \
						'+ _items[ _id ]['first_and_last'] +' \
					</a>'.smoosh();
					
		//------------------------------------------------------------
		//  External link
		//------------------------------------------------------------
		case 'external':
			return '<a href="" \
						class="external" \
						data-alignuri="'+ _items[ _id ]['uri'] +'" \
						data-motivation="'+ _items[ _id ]['motivation'] +'" \
						data-alignId="'+ _id +'"> \
						<span class="small">external -- </span>' + _items[ _id ]['uri'] + '\
					</a>'.smoosh();
		}
	}
	
	BodinUI.prototype.overlapMenuPos = function( _x, _y ) {
		jQuery( '#bodinMenu' ).css({
			top: _y,
			left: _x
		});
	}
	
	BodinUI.prototype.overlapMenuRemove = function() {
		var self = this;
		jQuery( '#bodinMenu' ).remove();
	}
	
	BodinUI.prototype.overlapMenuStart = function() {
		var self = this;
		self.externalClick( self.menu );
		jQuery( '#bodinMenu a.alignLink' ).on( 'touchstart click', function( _e ) {
			_e.stopPropagation();
			_e.preventDefault();
			self.alignTrigger( this );
			self.overlapMenuRemove();
		});
		jQuery( window ).on( 'touchstart click', function( _e ) {
			self.overlapMenuRemove();
		});
	}
	
	BodinUI.prototype.firstAndLast = function( _alignId ) {
		var self = this;
		var id = jQuery( self.elem ).attr('id');
		var sub_select = '[ data-alignId="'+_alignId +'" ]';
		var ext = new ArrayExt();
		
		var disp = {};
		jQuery( '.align-start'+sub_select ).each( function(){
			var bodin = jQuery( this ).parents('.bodin');
			var lang = jQuery( bodin ).attr('id');
			disp[ lang ] = {};
			disp[ lang ]['start'] = [];
			jQuery( '#'+lang+' .align-start'+sub_select ).each( function(){
				disp[ lang ]['start'].push( jQuery(this).text().trim() );
			});
		});
		
		jQuery( '.align-end'+sub_select ).each( function(){
			var bodin = jQuery( this ).parents('.bodin');
			var lang = jQuery( bodin ).attr('id');
			disp[ lang ]['end'] = [];
			jQuery( '#'+lang+' .align-end'+sub_select ).each( function(){
				disp[ lang ]['end'].push( jQuery(this).text().trim() );
			});
		});
		var html = '';
		for ( var lang in disp ) {
			var to_join = []
			for ( var i in disp[ lang ]['start'] ) {
				to_join.push( disp[ lang ]['start'][i] );
				to_join.push( disp[ lang ]['end'][i] );
			}
			html += '<span class="small">'+lang+' -- </span>'+ext.multijoin( to_join, [' ... ',' &nbsp; '] )+'</br>';
		}
		return html;
	}
	
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
			//------------------------------------------------------------
			//  If there isn't any overlap just align.
			//------------------------------------------------------------
			self.overlapMenuRemove();
			if ( self.overlapMenu( _e ) == false ) {
				//------------------------------------------------------------
				//  If the alignments are not active just exit.
				//------------------------------------------------------------
//				if ( jQuery( this ).hasClass( 'active' ) == false ) {
//					return;
//				}
				self.alignTrigger( this );
			}
		});
	}
	
	BodinUI.prototype.externalClick = function( _elem ) {
		var self = this;
		jQuery( '.external', _elem ).on( 'touchstart click', function( _e ) {
			_e.stopPropagation();
			_e.preventDefault();
			//------------------------------------------------------------
			//  If the alignments are not active just exit.
			//------------------------------------------------------------
			if ( jQuery( this ).hasClass( 'active') == false ) {
				return;
			}
			var id = jQuery( this ).attr('data-alignId')
			var uri = jQuery ( this ).attr('data-alignUri');
			var motivation = jQuery ( this ).attr('data-motivation');
			jQuery( window ).trigger( self.events['external'], [ uri, id, motivation ] );
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
	 *
	 * @param {int } _count The number of instances.
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
		jQuery( '.chapter', self.elem ).each( function() {
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
		self.buildSidecart( id, nav );
		//------------------------------------------------------------
		//  Start nav events
		//------------------------------------------------------------
		self.navEvents();
	}
	
	//------------------------------------------------------------
	//  Start sidecart
	//------------------------------------------------------------
	BodinUI.prototype.buildSidecart = function( _id, _nav ) {
		var self = this;
		self.sidecart = jQuery( '#sidecart_'+_id ).sidecart({
			side: 'top',
			inside: true,
			views: [
				{
					id: _id+'-view-1',
					type: 'nav',
					link: 'Chapters',
					text: _nav,
					init: function() {},
					refresh: function() {}
				}
				/*
				,{
					id: id+'-view-2',
					type: 'options',
					link: '&clubs; Options',
					text: self.optionsUI(),
					init: function() { self.startOptionsUI() },
					refresh: function() {}
				}
				*/
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