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