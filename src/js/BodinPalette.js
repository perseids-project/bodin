/**
 * BodinPalette
 */
var BodinPalette = function() {
	//------------------------------------------------------------
	//	  This class is a singleton.	Ensure only one instance exists.
	//------------------------------------------------------------
	if ( BodinPalette.prototype._singleton ) {
		return BodinPalette.prototype._singleton;
	}
	BodinPalette.prototype._singleton = this;
	this.palette = new Palette( 'secondary' );
	this.styler = new Styler();
	
	/**
	 *	Retrieve a highlight color
	 *
	 *	@param { int } _id The alignment id
	 *	@return { string } An rgba(255,0,0,0.25) string
	 */
	this.highlightColor = function( _id ) {
		return this.alphaColor( _id, 0.15 );
	}
	
	/**
	 *	Retrieve a highlight blink color
	 *
	 *	@param { int } _id The alignment id
	 *	@return { string } An rgba(255,0,0,0.25) string
	 */
	this.highlightBlinkColor = function( _id ) {
		return this.alphaColor( _id, 0.5);
	}
	
	this.alphaColor = function( _id, _alpha ) {
		var color = this.palette.colors[  this.colorId(_id) ];
		return color.toAlpha( _alpha );
	}
	
	this.colorId = function( _int ) {
		return _int % this.palette.colors.length
	}
	
	this.colorClass = function( _int ) {
		return 'color-'+this.colorId(_int);
	}
	
	/**
	 *	Create palette styles
	 */
	this.styles = function() {
		var rules = {};
		for ( var i=0; i<this.palette.colors.length; i++ ) {
			rules[ '.align.'+this.colorClass(i)+':hover' ] = 'background-color:'+this.highlightColor(i);
			rules[ '.active.'+this.colorClass(i) ] = 'background-color:'+this.highlightColor(i);
			rules[ '.active.'+this.colorClass(i)+':hover' ] = 'background-color:'+this.highlightBlinkColor(i);
			rules[ '.'+this.colorClass(i)+'.blink' ] = 'background-color:'+this.highlightBlinkColor(i);
			this.styler.add( rules );
		}
	}
	
	/**
	 *	Change palette
	 */
	this.paletteChange = function( _name ) {
		this.palette = new Palette( _name );
		this.styles();
	}
}