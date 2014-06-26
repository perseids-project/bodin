/**
 * BodinSelector
 */
var BodinSelector = function( _bodinUI ) {
	//------------------------------------------------------------
	//	  This class is a singleton.	Ensure only one instance exists.
	//------------------------------------------------------------
	if ( BodinSelector.prototype._singleton ) {
		return BodinSelector.prototype._singleton;
	}
	BodinSelector.prototype._singleton = this;
	
	this.bodinUI = _bodinUI;
	this.elem = this.bodinUI.elem;
	
	/**
	 * Get all of a token's active alignments
	 *
	 * @param { Dom } _target
	 * @param { string } _name Class name
	 */
	this.allTargets = function( _target, _name ) {
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
	 *
	 * @param { Event } _e
	 */
	this.menuCheck = function( _e ) {
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
		//  Ditto for link links
		//------------------------------------------------------------
		aligns = aligns.concat( self.allTargets( _e.currentTarget, '.link' ) );
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
			//  Normal
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
			//  External
			//------------------------------------------------------------
			if ( jQuery( aligns[i] ).hasClass('external') ) {
				items[ alignId ] = {};
				items[ alignId ]['type'] = 'external'
				items[ alignId ]['uri'] = jQuery( aligns[i] ).attr( 'data-alignuri' );
				items[ alignId ]['motivation'] = jQuery( aligns[i] ).attr( 'data-motivation' );
			}
			//------------------------------------------------------------
			//  Link
			//------------------------------------------------------------
			if ( jQuery( aligns[i] ).hasClass('link') ) {
				items[ alignId ] = {};
				items[ alignId ]['type'] = 'link'
				items[ alignId ]['uri'] = jQuery( aligns[i] ).attr( 'data-alignuri' );
				items[ alignId ]['motivation'] = jQuery( aligns[i] ).attr( 'data-motivation' );
			}
		}
		//------------------------------------------------------------
		//  Build the menu
		//------------------------------------------------------------
		self.menuBuild( items );
		//------------------------------------------------------------
		//  Move the menu into position.
		//------------------------------------------------------------
		self.menuPos( _e.clientX, _e.clientY );
		//------------------------------------------------------------
		//  Start the menu touch event listener.
		//------------------------------------------------------------
		self.menuStart();
		return true;
	}
	
	/**
	 * Build an overlap menu
	 *
	 * @param { Array } _items
	 */
	this.menuBuild = function( _items ) {
		var self = this;
		self.remove();
		self.menu = jQuery( '<div id="bodinMenu"></div>' );
		for ( var id in _items ) {
			var item = jQuery( self.menuItem( _items, id )  );
			item.addClass( _items[id]['color'] );
			item.addClass( 'active' );
			self.menu.append( item );
		}
		jQuery( 'body' ).append( self.menu );
	}
	
	/**
	 * Build an overlap menu item.
	 *
	 * @param { Array } _items
	 * @param { Array } _id
	 */
	this.menuItem = function( _items, _id ) {
		switch ( _items[ _id ]['type'] ) {
			//------------------------------------------------------------
			//  Alignment
			//------------------------------------------------------------
			case 'align':
				return this.alignLink( _items, _id );
			//------------------------------------------------------------
			//  External
			//------------------------------------------------------------
			case 'external':
				return this.externalLink( _items, _id );
			//------------------------------------------------------------
			//  Link
			//------------------------------------------------------------
			case 'link':
				return this.linkLink( _items, _id );
		}
	}
	
	/**
	 * Build an alignment link.
	 *
	 * @param { Array } _items
	 * @param { Array } _id
	 */
	this.alignLink = function( _items, _id ) {
		return '<a href="" \
					class="alignLink" \
					data-alignId="'+ _id +'"> \
					'+ _items[ _id ]['first_and_last'] +' \
				</a>'.smoosh();
	}
	
	this.linkLink = function( _items, _id ) {
		return '<a href="' + _items[ _id ]['uri'] + '" \
					class="link" \
					target="_blank" \
					data-motivation="'+ _items[ _id ]['motivation'] +'" \
					data-alignId="'+ _id +'"> \
					<span class="small">external -- </span>' + _items[ _id ]['uri'] + '\
				</a>'.smoosh();
	}
	
	/**
	 * Build an external link.
	 *
	 * @param { Array } _items
	 * @param { Array } _id
	 */
	this.externalLink = function( _items, _id ) {
		return '<a href="" \
					class="external" \
					data-alignuri="'+ _items[ _id ]['uri'] +'" \
					data-motivation="'+ _items[ _id ]['motivation'] +'" \
					data-alignId="'+ _id +'"> \
					<span class="small">external -- </span>' + _items[ _id ]['uri'] + '\
				</a>'.smoosh();
	}
	
	/**
	 * Build an external link.
	 *
	 * @param { Int } _x
	 * @param { Int } _y
	 */
	this.menuPos = function( _x, _y ) {
		var menuWidth = jQuery( '#bodinMenu' ).width();
		var winWidth = jQuery( window ).width();
		var menuHeight = jQuery( '#bodinMenu' ).height();
		var winHeight = jQuery( window ).height();
		_x = ( _x+menuWidth > winWidth ) ? winWidth-menuWidth : _x;
		_y = ( _y+menuHeight > winHeight ) ? winHeight-menuHeight : _y;
		jQuery( '#bodinMenu' ).css({
			top: _y,
			left: _x
		});
	}
	
	/**
	 * Remove the menu
	 */
	this.remove = function() {
		jQuery( '#bodinMenu' ).remove();
	}
	
	/**
	 * Start menu click events
	 */
	this.menuStart = function() {
		var self = this;
		self.bodinUI.externalClick( self.menu );
		jQuery( '#bodinMenu a.alignLink' ).on( 'touchstart click', function( _e ) {
			_e.stopPropagation();
			_e.preventDefault();
			self.bodinUI.alignTrigger( this );
			self.remove();
		});
		jQuery( window ).on( 'touchstart click', function( _e ) {
			self.remove();
		});
	}
	
	/**
	 * Get the start and end
	 *
	 * @param { String } _alignId The alignment id
	 */
	this.firstAndLast = function( _alignId ) {
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
				if ( 'start' in disp[ lang ] && 'end' in disp[ lang ] ) {
					to_join.push( disp[ lang ]['start'][i] );
					to_join.push( disp[ lang ]['end'][i] );
				}
			}
			html += '<span class="small">'+lang+' -- </span>'+ext.multijoin( to_join, [' ... ',' &nbsp; '] )+'</br>';
		}
		return html;
	}
}