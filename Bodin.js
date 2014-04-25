/**
 * Extend jQuery
 */
jQuery.fn.cursorToEnd = function() {
	return this.each( function() {
		jQuery( this ).focus();
		
		//------------------------------------------------------------
		//   If this function exists...
		//------------------------------------------------------------
		if ( this.setSelectionRange ) {
			//------------------------------------------------------------
			// ... then use it ( Doesn't work in IE )
			// Double the length because Opera is inconsistent 
			// about whether a carriage return is one character or two.
			//------------------------------------------------------------
			var len = jQuery( this ).val().length * 2;
			this.setSelectionRange( len, len );
		} 
		else {
			//------------------------------------------------------------
			// ... otherwise replace the contents with itself
			// ( Doesn't work in Google Chrome )
			//------------------------------------------------------------
			jQuery( this ).val( jQuery( this ).val() );
		}
		//------------------------------------------------------------
		// Scroll to the bottom, in case we're in a tall textarea
		// ( Necessary for Firefox and Google Chrome )
		//------------------------------------------------------------
		this.scrollTop = 999999;
	});
};

/**
 *  Get an element's html
 */
jQuery.fn.myHtml = function() {
	return jQuery( this ).clone().wrap( '<div>' ).parent().html();
}

/**
 *  Get transition time in milliseconds
 *
 *  @return { Number } Time in milliseconds
 */
jQuery.fn.transLength = function() {
	var trans = jQuery( this ).css( 'transition' );
	var res = trans.match( / [\d|\.]+s/g );
	var sec = Number( res[0].replace( 's','' ) );
	return sec*1000;
}
/**
 * Remove newlines and tabs
 */
String.prototype.smoosh = function() {
	return this.replace(/(\r\n+|\n+|\r+|\t+)/gm,'');
}

/**
 * Strip html tags
 */
String.prototype.stripTags = function() {
	return this.replace(/<\/?[^>]+(>|$)/g, '' );
}

/**
 * Remove extra spaces
 */
String.prototype.oneSpace = function() {
	return this.replace(/\s{2,}/g, ' ');
}

/**
 * Alpha-numeric and spaces only
 */
String.prototype.alphaSpaceOnly = function() {
	return this.replace(/[^\w\s]/gi, '');
}

/**
 * Alpha-numeric characters only
 */
String.prototype.alphaOnly = function() {
	return this.replace(/[^\w]/gi, '');
}

/**
 * Capitalize the first letter of a string
 */
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Repeat a string n times
 *
 * @param {string} _n How many times you want to repeat a string
 */
String.prototype.repeat = function( _n ) {
	return new Array( _n + 1 ).join( this );
}

/**
 * Count the occurences of a string in a larger string
 *
 * @parm {string} _sub : The search string
 * @param {boolean} _overlap : Optional. Default: false
 * @return {int} : The count
 */
String.prototype.occurs = function( _search, _overlap ) {
	var string = this;
	//------------------------------------------------------------
	//  If _search is null just return a char count
	//------------------------------------------------------------
	if ( _search == undefined ) {
		return string.length;
	}
	//------------------------------------------------------------
	//  Make sure _search is a string
	//------------------------------------------------------------
	_search+="";
	//------------------------------------------------------------
	//  If no search term is past just return a character count
	//------------------------------------------------------------
	if ( _search.length <= 0 ) {
		return string.length;
	}
	//------------------------------------------------------------
	//  Otherwise start counting.
	//------------------------------------------------------------
	var n=0;
	var pos=0;
	var step = ( _overlap ) ? 1 : _search.length;
	while ( true ) {
		pos = string.indexOf( _search, pos );
		if ( pos >= 0 ) {
			n++;
			pos += step;
		}
		else {
			break;
		}
	}
	return n;
}

/**
 * Find the positions of occurences of a substring
 *
 * @parm {string} _sub : The search string
 * @param {boolean} _overlap : Optional. Default--false.
 * @param {boolean} _ignoreXML : Optional. Check to see if string is inside XML/HTML element.
 * @param {boolean} _onlyWords : Optional. Make sure string is a discrete word.
 * @return {Array} : An array of integers.
 */
String.prototype.positions = function( _search, _overlap, _ignoreXML, _onlyWords ) {
//	console.log( '----------' );
//	console.log( _search );
	var string = this;
	//------------------------------------------------------------
	//  Make sure _search is a string
	//------------------------------------------------------------
	_search+="";
	//------------------------------------------------------------
	//  Otherwise start counting.
	//------------------------------------------------------------
	var pos=0;
	//------------------------------------------------------------
	//  String overlapping allowed?
	//------------------------------------------------------------
	var step = ( _overlap ) ? 1 : _search.length;
	var p = [];
	while ( true ) {
		var ok = true;
		pos = string.indexOf( _search, pos );
		if ( pos >= 0 ) {
			//------------------------------------------------------------
			//  Ignore if search string was found within an XML/HTML tag
			//------------------------------------------------------------
			if ( _ignoreXML == true ) {
				for ( var i=pos; i<string.length; i++ ) {
					if ( string[i] == '<' ) {
						break;
					}
					if ( string[i] == '>' ) {
						ok = false;
					}
				}
			}
			//------------------------------------------------------------
			//  Check to see if search string is an isolated word
			//------------------------------------------------------------
			if ( _onlyWords == true ) {
//				console.log( string.substr((pos-1),(pos+_search.length+1)) );
//				console.log( string.substr((pos-1),(pos+_search.length+1)).isAlphaNum() );
				if ( string.substr((pos-1),(pos+_search.length+1)).isAlphaNum() == true ) {
					ok = false;
				}
			}
			//------------------------------------------------------------
			//  If everything is good
			//------------------------------------------------------------
			if ( ok == true ) {
				p.push( pos );
			}
			pos += step;
		}
		else {
			break;
		}
	}
	return p;
}

/*
 * Insert a substring at a particular index
 *
 * @return { string } The modified string
 */
String.prototype.insertAt = function( _index, _string ) {
	return this.substr( 0, _index) + _string + this.substr( _index );
}

/*
 * Turn a string with HTTP GET style parameters to an object
 *
 * @return { obj } A collection of keys and values
 */
String.prototype.params = function() {
	var arr = this.split('?');
	var get = arr[1];
	arr = get.split('&');
	var out = {};
	for ( var i=0, ii=arr.length; i<ii; i++ ) {
		if ( arr[i] != undefined ) {
			var pair = arr[i].split('=');
			out[ pair[0] ] = pair[1];
		}
	}
	return out;
}

/*
 * Check for the existence of an upper-case letter
 *
 * @return { boolean }
 */
String.prototype.hasUpper = function() {
	return /[A-Z]/.test( this );
}

/*
 * Create a word frequency report object
 *
 * @return { obj } Report object
 */
String.prototype.report = function() {
	var words = this.toLowerCase().split(' ');
	var stats = {};
	for ( var i=0, ii=words.length; i<ii; i++ ) {
		var word = words[i];
		if ( ! ( word in stats ) ) {
			stats[word] = 1;
		}
		else {
			stats[word] += 1;
		}
	}
	return stats;
}

/*
 * Divide text into an array of lines by splitting on linebreaks
 *
 * @return { array } An array of lines
 */
String.prototype.lines = function() {
	return this.split("\n");
}

/*
 * Check to see if string is composed of only alphanumeric characters
 *
 * @return { boolean }
 */
String.prototype.isAlphaNum = function() {
	if ( /[^a-zA-Z0-9]/.test( this ) ) {
		return false;
	}
	return true;
}

/*
 * Divide text into an array of individual sentences
 * This is English-centric.  Forgive me.
 *
 * @return { array } An array of sentences
 */
String.prototype.sentences = function() {
	var check = this.match( /[^\.!\?]+[\.!\?]+/g );
	
	//------------------------------------------------------------
	//  Make sure characters aren't used for purposes other than
	//  sentences.
	//------------------------------------------------------------
	var vowels = [ 'a','e','i','o','u','y' ];
	var out = [];
	var carry = '';
	for ( var i=0; i<check.length; i++ ) {
		//------------------------------------------------------------
		//  Clean up.
		//------------------------------------------------------------
		var strCheck = carry + check[i];
		carry = '';
		//------------------------------------------------------------
		//  Check for the existence of a vowel, so we aren't
		//  accidentally thinking part of an abbreviation is its
		//  own sentence.
		//------------------------------------------------------------
		var merge = true;
		for ( var j=0; j<vowels.length; j++ ) {
			if ( strCheck.indexOf( vowels[j] ) != -1 ) {
				merge = false;
				break;
			}
		}
		//------------------------------------------------------------
		//  Also check for a capital letter on the first word.  
		//  Most sentences have those too.
		//------------------------------------------------------------
		var capTest = strCheck.trim();
		if ( ! capTest[0].hasUpper() ) {
			merge = true;
		}
		//------------------------------------------------------------
		//  If no vowel exists in the sentence you're probably
		//  dealing with an abbreviation.  Merge with last sentence.  
		//------------------------------------------------------------
		if ( merge ) {
			if ( out.length > 0 ) {
				out[ out.length-1 ] += strCheck;
			}
			else {
				carry = strCheck;
			}
			continue;
		}
		
		//------------------------------------------------------------
		//  Prepare output.
		//------------------------------------------------------------
		out.push( strCheck.smoosh().trim() );
	}
	return out;
}
ObjectExt = function() {}

/**
 * Take number values from one object and numerically add values 
 * from another object if the key names match.
 *
 * @param { obj } _obj1 An Object
 * @param { obj } _obj2 An Object
 */
ObjectExt.prototype.mergeAdd = function( _obj1, _obj2 ) {
	for ( var key in _obj1 ) {
		if ( ! ( key in _obj2 ) ) {
			_obj2[key] = 1;
			continue;
		}
		_obj2[key] += _obj1[key];
	}
}

/**
 * Count the characters of all values in an object
 *
 * @param { obj } _obj An Object
 * @return { int } character count
 */
ObjectExt.prototype.totalChars = function( _obj, _totalRoll, _depth ) {
	_totalRoll = ( _totalRoll == undefined ) ? 0 : _totalRoll;
	_depth = ( _depth == undefined ) ? 0 : _depth;
	for ( var i=0, ii=_obj.length; i<ii; i++ ) {
		var type = typeof _obj[i];
		if ( type == 'object' ) {
			_depth++;
			return this.totalChars( _obj[i], _totalRoll, _depth );
		}
		_totalRoll += _obj[i].toString().length;
	}
	return _totalRoll;
}

/**
 * Count the characters of all values in an object
 *
 * @param { obj } _obj An Object
 * @return { array } character count, array of character counts by column
 */
ObjectExt.prototype.totalKeys = function( _obj ) {
   var total = 0;
   for ( var i in _obj ) {
		if ( _obj.hasOwnProperty( i ) ) {
			total++;
		}
	}
	return total;
}

/**
 * Wrap each value of an object with strings of your choice
 *
 * @param { obj } _obj An Object
 * @param { obj } _str1 Prefix string
 * @param { obj } _str2 Suffix string
 * @return { obj } An Object of wrapped string values
 */
ObjectExt.prototype.wrap = function( _obj, _str1, _str2 ) {
	_str2 = ( _str2 == undefined ) ? _str1: _str2;
	var wrapped = [];
	for ( var i=0, ii=_obj.length; i<ii; i++  ) {
		wrapped[i] = _str1.toString() + _obj[i] + _str2.toString();
	}
	return wrapped;
}

/**
 * src: http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
 *	by A. Levy
 *
 * Clone an object.
 *
 * @param { obj } _obj An Object
 * @return { obj } _obj Cloned Object
*/
ObjectExt.prototype.clone = function( _obj ) {
	//------------------------------------------------------------
	// Handle the 3 simple types, and null or undefined
	//------------------------------------------------------------
	if ( null == _obj || "_object" != typeof _obj ) return _obj;
	//------------------------------------------------------------
	// Handle Date
	//------------------------------------------------------------
	if ( _obj instanceof Date ) {
		var copy = new Date();
		copy.setTime( _obj.getTime() );
		return copy;
	}
	//------------------------------------------------------------
	// Handle Array
	//------------------------------------------------------------
	if ( _obj instanceof Array ) {
		var copy = [];
		for ( var i=0, ii=_obj.length; i<ii; i++ ) {
			copy[i] = this.clone( _obj[i] );
		}
		return copy;
	}
	//------------------------------------------------------------
	// Handle Object
	//------------------------------------------------------------
	if ( _obj instanceof Object ) {
		var copy = {};
		for ( var attr in _obj ) {
			if ( _obj.hasOwnProperty( attr ) ) copy[attr] = this.clone( _obj[attr] );
		}
		return copy;
	}
	throw new Error( "Unable to copy obj! Its type isn't supported." );
}

/**
 * src: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
 *	by Alnitak
 *
 * Use a string as a nested object selector
 *
 * @param { obj } _obj An Object
 * @param { obj } _str Nested selector string
 * @return { ??? } The value stored in _obj referenced by _str
 */
ObjectExt.prototype.byString = function( _obj, _str ) {
	if ( _str == undefined ) {
		return _obj;
	}
	_str = _str.replace(/\[['|"]*(\w+)['|"]*\]/g, '.$1' );
	_str = _str.replace(/^\./, '');
	var a = _str.split('.');
	while ( a.length ) {
		var n = a.shift();
		if ( n in _obj ) {
			_obj = _obj[n];
		}
		else {
			return;
		}
	}
	return _obj;
}
/**
 * Add/Change CSS with Javascript,
 * working at the class/selector level instead of the tag level.
 */
function Styler() {
	this.head = document.getElementsByTagName('head')[0];
	this.style = document.createElement('style');
	this.style.type = 'text/css';
	this.head.appendChild( this.style );
}

/**
 * Add CSS declarations
 * @param { obj } _rules An object of selector:style pairs.
 */
Styler.prototype.add = function( _rules ) {
	for ( var selector in _rules ) {
		var dec = document.createTextNode( selector+' { '+_rules[ selector ]+' }' );
		if ( this.style.styleSheet ) {
			style.styleSheet.cssText = dec.nodeValue;
		}
		else {
			this.style.appendChild( dec );
		}
	}
}
/**
 * Palettes are collections of colors.
 * Dependencies:
 * 		Culuh.js
 * 		Sorted.js
 * 		ObjectExt.js
 *
 * @param { string } _name The name of the palette.
 */
function Palette( _name ) {
	this.colors = [];
	this.load( _name );
}

/**
 * Load a palette
 *
 * @param { string } _name The name of the palette.
 */
Palette.prototype.load = function( _name ) {
	switch ( _name ) {
		case 'grayscale':
			this.add([ 
				'#000000', 
				'#333333', 
				'#666666', 
				'#999999', 
				'#CCCCCC', 
				'#FFFFFF' 
			]);
			break;
		case 'primary':
			this.add([ 
				'#FF0000', // red
				'#00FF00', // green
				'#0000FF'  // blue
			]);
			break;
		case 'secondary':
			this.add([ 
				'#00FFFF', // cyan
				'#FF00FF', // magenta
				'#FFFF00'  // yellow
			]);
			break;
		case 'candy':
			this.add([
				'#F4DDBE', // coffee milk
				'#465A95', // sunset purple
				'#10CCD5', // blue raspberry
				'#FD8471', // peach skin
				'#88D499'  // blue grass
			]);
		case 'nes':
			this.add([
				'#7C7C7C',
				'#0000FC',
				'#0000BC',
				'#4428BC',
				'#940084',
				'#A80020',
				'#A81000',
				'#881400',
				'#503000',
				'#007800',
				'#006800',
				'#005800',
				'#004058',
				'#000000',
				'#000000',
				'#000000',
				'#BCBCBC',
				'#0078F8',
				'#0058F8',
				'#6844FC',
				'#D800CC',
				'#E40058',
				'#F83800',
				'#E45C10',
				'#AC7C00',
				'#00B800',
				'#00A800',
				'#00A844',
				'#008888',
				'#000000',
				'#000000',
				'#000000',
				'#F8F8F8',
				'#3CBCFC',
				'#6888FC',
				'#9878F8',
				'#F878F8',
				'#F85898',
				'#F87858',
				'#FCA044',
				'#F8B800',
				'#B8F818',
				'#58D854',
				'#58F898',
				'#00E8D8',
				'#787878',
				'#000000',
				'#000000',
				'#FCFCFC',
				'#A4E4FC',
				'#B8B8F8',
				'#D8B8F8',
				'#F8B8F8',
				'#F8A4C0',
				'#F0D0B0',
				'#FCE0A8',
				'#F8D878',
				'#D8F878',
				'#B8F8B8',
				'#B8F8D8',
				'#00FCFC',
				'#F8D8F8',
				'#000000',
				'#000000'
			]);
			break;
		case undefined:
			this.add([ 
				'#000000', // black
				'#FFFFFF'  // white
			]);
	}
}

/**
 * Reset the palette
 */
Palette.prototype.reset = function() {
	this.colors = [];
}

/**
 * Add colors to a palette
 *
 * @param { array } _colors The colors you would like to add
 */
Palette.prototype.add = function( _colors ) {
	for ( var i=0; i<_colors.length; i++ ) {
		this.colors.push( new Culuh( _colors[i] ) );
	}
}

/**
 * Print out the hex representation of all the colors
 *
 * @param { string } _name The name of the palette.
 */
Palette.prototype.print = function() {
	for ( var i=0; i<this.colors.length; i++ ) {
		console.log( this.colors[i].hex() );
	}
}

/**
 * Print palette to screen
 *
 * @param { int } _cols (Optional) The number of columns
 * @param { int } _size (Optional) The size of the swatch in pixels
 */
Palette.prototype.show = function( _cols, _size ) {
	//------------------------------------------------------------
	//  Set some defaults
	//------------------------------------------------------------
	_size = ( _size == undefined ) ? 20 : _size;
	_cols = ( _cols == undefined ) ? this.colors.length : parseInt( _cols );
	//------------------------------------------------------------
	//  Hide any previous palette
	//------------------------------------------------------------
	this.hide();
	//------------------------------------------------------------
	//  Build the palette wrapper
	//------------------------------------------------------------
	var palette = document.createElement('div');
	palette.setAttribute( 'id', 'palette-sample' );
	palette.style.position = 'absolute';
	palette.style.left = '0';
	palette.style.top = '0';
	document.body.appendChild( palette );
	//------------------------------------------------------------
	//  Build the swatches
	//------------------------------------------------------------
	for ( var i=0; i<this.palette.length; i++ ) {
		var color = '#'+ this.palette[i].hex();
		var swatch = document.createElement('div');
		swatch.style.backgroundColor = color;
		swatch.style.height = _size+'px';
		swatch.style.width = _size+'px';
		swatch.style.float = 'left';
		palette.appendChild( swatch );
		if ( i%_cols == _cols-1 ) {
			palette.appendChild( document.createElement('br') );
		}
	}
}

/**
 * Hide a displayed palette
 */
Palette.prototype.hide = function() {
	var palette = document.getElementById("palette-sample");
	if ( palette != undefined ) {
		palette.parentNode.removeChild( palette );
	}
}

/**
 * Sort your palette
 *
 * @param { string } _type The type of sort: [list types here]
 */
Palette.prototype.sort = function( _type ) {
	switch ( _type ) {
		//------------------------------------------------------------
		//  Value
		//------------------------------------------------------------
		case 'value':
			this.sortNum( function( _color ) {
				return _color.v;
			});
			break;
		//------------------------------------------------------------
		//  Hue
		//------------------------------------------------------------
		case 'hue':
			this.sortNum( function( _color ) {
				return _color.h
			});
			break;
		//------------------------------------------------------------
		//  Saturation
		//------------------------------------------------------------
		case 'saturation':
			this.sortNum( function( _color ) {
				return _color.s
			});
			break;
		//------------------------------------------------------------
		//  Red
		//------------------------------------------------------------
		case 'red':
			this.sortNum( function( _color ) {
				var sub = (_color.gInt()+_color.bInt())/2;
				return _color.rInt()-sub;
			});
			break;
		//------------------------------------------------------------
		//  Green
		//------------------------------------------------------------
		case 'green':
			this.sortNum( function( _color ) {
				var sub = (_color.rInt()+_color.bInt())/2;
				return _color.gInt()-sub;
			});
			break;
		//------------------------------------------------------------
		//  Blue
		//------------------------------------------------------------
		case 'blue':
			this.sortNum( function( _color ) {
				var sub = (_color.rInt()+_color.gInt())/2;
				return _color.bInt()-sub;
			});
			break;
	}
}

/**
 * Sort your palette by some numerical value.
 *
 * @param { function } _func A function which returns an int.
 *  	This function will be passed a { Culuh } object as a parameter
 */
Palette.prototype.sortNum = function( _func ) {
	var sorted = new Sorted();
	var toCheck = [];
	for ( var i=0; i<this.colors.length; i++ ) {
		toCheck[i] = { value: _func( this.colors[i] ), color: this.colors[i] };
	}
	toCheck = sorted.numSort( toCheck, 'value' );
	for ( var i=0; i<toCheck.length; i++ ) {
		this.colors[i] = toCheck[i]['color'];
	}
}
/**
 * A smarter way to control colors
 */
function Culuh( _color ) {
	this.r=0; // red
	this.g=0; // blue
	this.b=0; // green
	this.h=0; // hue
	this.s=0; // saturation
	this.v=0; // value
	if ( _color != undefined ) {
		this.original = _color;
		this.reset();
		this.hsvUpdate();
	}
}

/**
 * Reset the color to the original color 
 * declared in the constructor.
 */
Culuh.prototype.reset = function( ) {
	var self = this;
	var color = this.original;
	
	//------------------------------------------------------------
	//  Check if it's RGB
	//------------------------------------------------------------
	color = color.toUpperCase();
	if ( color.indexOf( 'RGB' ) > -1 ) {
		var vals = color.match( /\d+\.?\d*/g );
		this.r = parseInt( vals[0] );
		this.g = parseInt( vals[1] );
		this.b = parseInt( vals[2] );
	}
	
	//------------------------------------------------------------
	//  No... then it's a hex
	//------------------------------------------------------------
	else {
		var vals = color.match( /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i );
		this.r = this.hexToInt( vals[1] );
		this.g = this.hexToInt( vals[2] );
		this.b = this.hexToInt( vals[3] );
	}
}

/**
 * Builds HSV ( Hue, Saturation, and Value ) from RGB
 * ported from http://lodev.org/cgtutor/color.html
 */
Culuh.prototype.hsvUpdate = function() {
	var h; 
	var s;
	var v;
	
	var r = this.r / 255;
	var g = this.g / 255;
	var b = this.b / 255;
	
	//------------------------------------------------------------
	//  Find the value
	//------------------------------------------------------------
	var min = Math.min( r, g, b );
	var max = Math.max( r, g, b );
	var delta = max-min;
	v = max;
	
	//------------------------------------------------------------
	//  If black well... saturation is easy
	//------------------------------------------------------------
	if ( max == 0 ) {
		s = 0;
	}
	else {
		s = delta / max;
	}
	if ( s == 0 ) {
		h = 0;
	}
	else {
		if ( r == max ) {
			h = ( g-b ) / delta;
		}
		else if ( g == max ) {
			h = 2 + ( b-r ) / delta;
		}
		else {
			h = 4 + ( r-g ) / delta;
		}
		
		if ( isNaN( h ) ) {
			h = 0;
		}
		h /= 6;
		if ( h < 0 ) {
			h++;
		}

	}
	this.h = h * 255;
	this.s = s * 255;
	this.v = v * 255;
}

/**
 * Builds RGB from HSV
 * ported from http://lodev.org/cgtutor/color.html
 */
Culuh.prototype.rgbUpdate = function() {
	var r;
	var g;
	var b;
	
	var h = this.h / 255;
	var s = this.s / 255;
	var v = this.v / 255;
	
	//------------------------------------------------------------
	// No saturation means achromatic aka 'gray'
	//------------------------------------------------------------
	if ( s == 0 ) {
		r = g = b = v;
	}
	
	//------------------------------------------------------------
	// If there is saturation things get messy 
	//------------------------------------------------------------
	else {
		h *= 6;
		var i = Math.floor( h );
		var frac = h % 1;
		var p = v * ( 1 - s );
		var q = v * ( 1 - ( s * frac ));
		var t = v * ( 1 - ( s * ( 1 - frac )));

		switch( i ) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			case 5:
				r = v;
				g = p;
				b = q;
				break;
		}
	}
	this.r = parseInt( r * 255 );
	this.g = parseInt( g * 255 );
	this.b = parseInt( b * 255 );	
}

/**
 * Builds hexadecimal color value
 *
 * @param { string } _pre hexadecimal prefix typically '#' or '0x'
 * @return { string } hexadecimal color value
 */
Culuh.prototype.hex = function( _pre ) {
	_pre = ( _pre == undefined ) ? '' : _pre;
	return _pre + this.rHex() + this.gHex() + this.bHex();
}

/**
 * Returns RGB color value
 *
 * @return { string } rgb color value
 */
Culuh.prototype.rgb = function() {
	return 'rgb('+this.r+','+this.g+','+this.b+')';
}

/**
 * Returns red hex value
 *
 * @return { string } red hex value
 */
Culuh.prototype.rHex = function() {
	return this.intToHex( this.r );
}

/**
 * Returns green hex value
 *
 * @return { string } green hex value
 */
Culuh.prototype.gHex = function() {
	return this.intToHex( this.g );
}

/**
 * Returns blue hex value
 *
 * @return { string } blue hex value
 */
Culuh.prototype.bHex = function() {
	return this.intToHex( this.b );
}

/**
 * Returns red integer value 0-255
 *
 * @return { int } red int value
 */
Culuh.prototype.rInt = function() {
	return this.r;
}

/**
 * Returns green integer value 0-255
 *
 * @return { int } green int value
 */
Culuh.prototype.gInt = function() {
	return this.g;
}

/**
 * Returns blue integer value 0-255
 *
 * @return { int } blue int value
 */
Culuh.prototype.bInt = function() {
	return this.b;
}

/**
 * Converts hex to integer value
 *
 * @return { int } integer value
 */
Culuh.prototype.hexToInt = function( _hex ) {
	return parseInt( _hex, 16 );
}

/**
 * Converts integer to hex value
 *
 * @return { string } hexadecimal value
 */
Culuh.prototype.intToHex = function( _int ) {
	var hex = _int.toString(16);
	if ( hex.length < 2 ) {
		hex = '0'+hex;
	}
	return hex.toUpperCase();
}

/**
 * Change the saturation of the color
 *
 * @param { float } _sat saturation multiplier
 * @param { boolean: false } _new return new Culuh
 *		and don't change the current Culuh values
 * @return { Culuh }
 */
Culuh.prototype.sat = function( _sat, _out ) {
	var sat = this.s;
	sat *= _sat;
	if ( _out != true ) {
		this.s = sat;
		this.rgbUpdate();
	}
	else {
		var out = new Culuh( this.rgb() );
		out.sat( _sat );
		return out;
	}
}

/**
 * Return rgba string with specified alpha value
 *
 * @param { float } _float A number between 0 and 1
 * @return { string }
 */
Culuh.prototype.toAlpha = function( _float ) {
	_float = parseFloat( _float );
	_float = ( _float < 0 ) ? 0 : _float;
	_float = ( _float > 1 ) ? 1 : _float;
	return 'rgba('+this.r+','+this.g+','+this.b+','+_float+')';
}

/**
 * Invert the color
 *
 * @param { boolean: false } _new return new Culuh
 *		and don't change the current Culuh values
 * @return { Culuh }
 */
Culuh.prototype.invert = function( _out ) {
	if ( _out != true ) {
		this.r = 255 - this.r;
		this.g = 255 - this.g;
		this.b = 255 - this.b;
		this.hsvUpdate();
	}
	else {
		var out = new Culuh( this.rgb() );
		out.invert();
		return out;
	}
}
/*!
 * sidecart - sidecart
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
;( function( jQuery ) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn
	 * @param { obj } _config Key value pairs to hold the plugin's configuration
	 * @param { string } _id The id of the DOM element
	 */
	function sidecart( _elem, _config, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _config );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn
	 * @param { obj } _config Key value pairs to hold the plugin's configuration
	 */
	sidecart.prototype.init = function( _elem, _config ) {
		var self = this;
		//------------------------------------------------------------
		//	Mark your territory
		//------------------------------------------------------------
		jQuery( self.elem ).addClass('sidecart')
		//------------------------------------------------------------
		//	User options 
		//------------------------------------------------------------
		self.config = jQuery.extend({
			side: 'right',
			inside: false,
			'bottom-space': 40
		}, _config );
		//------------------------------------------------------------
		//  Get a styler object handy
		//------------------------------------------------------------
		self.styler = new Styler();
		//------------------------------------------------------------
		//  Start me up!
		//------------------------------------------------------------
		self.start();
	}
	
	/**
	 * Start up sidecart.
	 */
	sidecart.prototype.start = function() {
		this.buildWrapper();
		this.buildViews();
		this.eventStart();
		this.showFirst();
		this.hide();
	}
	
	/**
	 * Build the application wrapper.
	 */
	sidecart.prototype.buildWrapper = function() {
		//------------------------------------------------------------
		//  Hide initially
		//------------------------------------------------------------
		jQuery( this.elem ).addClass('hidden');
		//------------------------------------------------------------
		//  Left side
		//------------------------------------------------------------
		switch ( this.config['side'] ) {
			case 'left':
				this.buildTabsLast();
				jQuery( this.elem ).addClass('left');
				break;
			case 'top':
				this.buildTabsLast();
				jQuery( this.elem ).addClass('top');
				break;
			default: // right side
				jQuery( this.elem ).append( '\
					<div class="tabs"></div>\
					<div class="inner">\
						<div class="views"></div>\
					</div>\
				');
		}
		//------------------------------------------------------------
		//  Inside parent?
		//------------------------------------------------------------
		this.fitToParent();
	}
	
	/**
	 * Fit sidecart inside parent.
	 */
	sidecart.prototype.fitToParent = function() {
		if ( this.config['inside'] == true ) {
			var parent = jQuery( this.elem ).parent();
			var position = parent.position();
			jQuery( this.elem ).css({ left: position.left });
			if ( this.config['side'] == 'top' ) {
				jQuery( this.elem ).width( parent.outerWidth() );
				var height = parent.height()-jQuery( '.tabs', this.elem ).height()-this.config['bottom-space'];
				var style = {};
				style[this.id+' .inner'] = 'height:'+height+'px';
				style[this.id+'.hidden .inner'] = 'height:0';
				this.styler.add( style );
			}
		}
	}
	
	/**
	 * Build with tab after inner.
	 */
	sidecart.prototype.buildTabsLast = function() {
		jQuery( this.elem ).append( '\
			<div class="inner">\
				<div class="views"></div>\
			</div>\
			<div class="tabs"></div>\
		');
	}
	
	/**
	 * Build with tab before inner.
	 */
	sidecart.prototype.buildTabsFirst = function() {
		jQuery( this.elem ).append( '\
			<div class="tabs"></div>\
			<div class="inner">\
				<div class="views"></div>\
			</div>\
		');
	}
	
	/**
	 * Build all of the views.
	 */
	sidecart.prototype.buildViews = function() {
		for ( var i=0, ii=this.config['views'].length; i<ii; i++ ) {
			var view = this.config['views'][i];
			this.buildView( view );
		}
	}
	
	/**
	 * Build a single view.
	 *
	 * @param { Object } _view 		A single view config object.
	 *								See constructor.
	 */
	sidecart.prototype.buildView = function( _view ) {
		//------------------------------------------------------------
		//  Build the view
		//------------------------------------------------------------
		jQuery( '.views', this.elem ).append('\
			<div id="'+ _view.id +'" class="'+ _view.type +'"></div>\
		');
		//------------------------------------------------------------
		//  Already in the dom?
		//------------------------------------------------------------
		if ( _view.src != undefined ) {
			var src = jQuery( _view.src );
			//------------------------------------------------------------
			//  Move the source html
			//------------------------------------------------------------
			src.detach().appendTo( '#'+_view.id );
		}
		//------------------------------------------------------------
		//  Passed as a text string?
		//------------------------------------------------------------
		else if ( _view.text != undefined ) {
			jQuery( '#'+_view.id ).append( _view.text );
		}
		//------------------------------------------------------------
		//  Build the link
		//------------------------------------------------------------
		var link = '<a href="#'+ _view.id +'">'+ _view.link +'</a>';
		jQuery( '.tabs', this.elem ).append( link );
		//------------------------------------------------------------
		// Run view init function
		//------------------------------------------------------------
		_view['init']( this );
	}
	
	/**
	 * Start event listeners.
	 */
	sidecart.prototype.eventStart = function() {
		this.tabClick();
		this.resize();
	}
	
	/**
	 * Start window resize listener.
	 */
	sidecart.prototype.resize = function() {
		var self = this;
		jQuery( window ).resize( function() {
			self.fitToParent();
		})
	}
	
	/**
	 * Click a tab and things happen.
	 */
	sidecart.prototype.tabClick = function() {
		var self = this;
		jQuery( '.tabs a', self.elem ).on( 'touchstart click', function( _e ) {
			_e.preventDefault();
			var id = jQuery( this ).attr('href').replace('#','');
			self.showView( id );
		});
	}
	
	/**
	 * Slide cart in and out.
	 */
	sidecart.prototype.slide = function() {
		if ( this.hidden() ) {
			this.show();
		}
		else {
			this.hide();
		}
	}
	
	/**
	 * Check if sidecart is hidden.
	 */
	sidecart.prototype.hidden = function() {
		return jQuery( this.elem ).hasClass('hidden')
	}
	
	/**
	 * Show the cart.
	 */
	sidecart.prototype.show = function() {
		jQuery( this.elem ).removeClass('hidden');
	}
	
	/**
	 * Hide the cart.
	 */
	sidecart.prototype.hide = function() {
		jQuery( this.elem ).addClass('hidden');
	}
	
	/**
	 * Hide all the views.
	 */
	sidecart.prototype.hideViews = function() {
		jQuery( '.views ', this.elem ).children().hide();
	}
	
	/**
	 * Show a specific view and hide the others.
	 *
	 * @param { string } _id The id of the view.
	 */
	sidecart.prototype.showView = function( _id ) {
		if ( _id !== this.last_tab ) {
			this.last_tab = _id;
			this.hideViews();
			jQuery( '#'+_id, this.elem ).show();
			jQuery( '.tabs a', this.elem ).removeClass('selected');
			jQuery( '.tabs a[href="#'+_id+'"]', this.elem ).addClass('selected');
			if ( this.hidden() ) {
				this.slide();
			}
		}
		else {
			this.slide();
		}
		//------------------------------------------------------------
		//  Run view refresh callback
		//------------------------------------------------------------
		this.viewRefresh( _id );
	}
	
	/**
	 * Show a specific view and hide the others.
	 *
	 * @param { string } _id The id of the view.
	 */
	sidecart.prototype.viewRefresh = function( _viewName ) {
		for ( var i=0, ii=this.config['views'].length; i<ii; i++ ) {
			var view = this.config['views'][i];
			if ( view.id == _viewName && view.refresh != undefined ) {
				view.refresh( this );
			}
		}
	}
	
	/**
	 * Show the first tab. 
	 */
	sidecart.prototype.showFirst = function() {
		var self = this;
		//------------------------------------------------------------
		//  Grab the id of the first tab if no default is set.
		//------------------------------------------------------------
		var id = jQuery( '.tabs a', self.elem ).first().attr('href').replace('#','');
		self.showView( id );
	}
	
	//----------------
	//	Extend JQuery 
	//----------------
	jQuery( document ).ready( function( jQuery ) {
		jQuery.fn.sidecart = function( _config ) {
			var id = jQuery( this ).selector;
			return this.each( function() {
				jQuery.data( this, id, new sidecart( this, _config, id ) );
			});
		};
	})
})( jQuery );
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
	//------------------------------------------------------------
	//  Properties
	//------------------------------------------------------------
	this.src = {};
	this.alignments = {};
	this.config = null;
	//------------------------------------------------------------
	//  Ignore node lookup... see _mark()
	//------------------------------------------------------------
	this.ignoreTag = { 
		H1: true, 
		H2: true 
	};
	this.ignoreClass = {
		note: true,
		milestone: true
	}
	this.palette = new Palette( 'secondary' );
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
	 *				ids: { body: 'latin', target: 'english' },
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
			this.alignments[ i ] = { loaded: false };
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
			self.alignments[ _src ]['xml'] = _data;
			self.alignments[ _src ]['loaded'] = true;
			self.alignments[ _src ]['json'] = self._json( _data );
			self.loadCheck();
		})
		.fail( function(){
			console.log( 'Could not load alignment xml: '+ _src );
		})
	}
	
	/**
	 *	Extract target data from XML
	 *	@param { dom }
	 *  @param { obj } JSON version
	 */
	this._target = function( _target ) {
		//------------------------------------------------------------
		//  Get book and chapter
		//------------------------------------------------------------
		var colon = _target.lastIndexOf(':')+1;
		//------------------------------------------------------------
		//  Make sure _target is valid
		//------------------------------------------------------------
		var at = _target.indexOf('@');
		if ( at == -1 ) {
			return undefined;
		}
		//------------------------------------------------------------
		//  Get book and chapter
		//------------------------------------------------------------
		var sub = _target.substr( colon, at-colon );
		var split = sub.split('.');
		var book = parseInt( split[0] );
		var chapter = parseInt( split[1] );
		//------------------------------------------------------------
		//  Get the word and occurence
		//------------------------------------------------------------
		_target = _target.substr( at+1 , _target.length );
		var index = _target.split('-');
		var start = this._wordAndOccurence( index[0] );
		var end = this._wordAndOccurence( index[1] );
		//------------------------------------------------------------
		//  Return target data JSON style
		//------------------------------------------------------------
		return { 'book': book, 'chapter': chapter, 'start': start, 'end': end }
	}
	
	this._json = function( _data ) {
		var self = this;
		var json = []
		jQuery( _data ).find('Annotation').each( function(){
			var annot = this;
			//------------------------------------------------------------
			//  Get the target
			//------------------------------------------------------------
			var target = jQuery( annot ).find('hasTarget');
			target = jQuery( target[0] ).attr('rdf:resource');
			target = self._target( target );
			if ( target == undefined ) {
				return true; // a continue in jQuery().each() land
			}
			//------------------------------------------------------------
			//  Get the body
			//------------------------------------------------------------
			var body = jQuery( annot ).find('hasBody');
			body = jQuery( body[0] ).attr('rdf:resource');
			body = self._target( body );
			if ( target == undefined ) {
				return true; // a continue in jQuery().each() land
			}
			json.push({ target: target, body: body });
		});
		return json;
	}
	
	this._wordAndOccurence = function( _string ) {
		var sep = _string.indexOf('[');
		var word = _string.substr( 0 , sep );
		var occurence = _string.substr( sep, _string.length-1 ).replace('[','').replace(']','');
		return { 'word': word, 'occurence': occurence }
	}
	
	/**
	 *  Apply translation alignment tags to Bodin markup.
	 */
	this.apply = function() {
		//------------------------------------------------------------
		//  Loop through the alignments and markup where appropriate
		//------------------------------------------------------------
		for ( var src in this.alignments ) {
			var ids = this._xmlToIds( src );
			if ( ids == undefined ) {
				console.log( 'No ids specified for ' + src );
				continue;
			}
			var id = 1;
			for ( var j in this.alignments[src]['json'] ) {
				var obj = this.alignments[src]['json'][j];
				this._mark( ids['body'], id, obj['body'] );
				this._mark( ids['target'], id, obj['target'] );
				id++;
			}
		}
	}
	
	/**
	 *  Find ids associated with an xml source
	 *
	 *  @param { string } _src The path to the alignment xml
	 *  return { obj }
	 */
	this._xmlToIds = function( _src ) {
		for ( var i in this.config ) {
			if ( this.config[i]['src'] == _src ) {
				return ( this.config[i]['ids'] );
			}
		}
		return undefined;
	}
	
	/**
	 *  Markup html with tags for translation alignment UI display
	 *  @param { string } _bodinId The id of the bodin instance
	 *  @param { int } _alignId The id of the alignment
	 *  @param { obj } _obj 
	 */
	this._mark = function( _bodinId, _alignId, _obj ) {
		//------------------------------------------------------------
		//  Get the selector
		//------------------------------------------------------------
		var id = '#'+_bodinId;
		var book = '#book-'+_obj['book'];
		var chapter = '#chapter-'+_obj['chapter'];
		var select =  id+' '+book+' '+chapter;
		var html = jQuery( select ).html();
		//------------------------------------------------------------
		//  Find the start and end positions
		//------------------------------------------------------------
		var start = _obj['start'];
		var end = _obj['end'];
		var positions = html.positions( start['word'], false, true, true );
		var ind = positions[ start['occurence']-1 ];
		//------------------------------------------------------------
		//  Wrap the passage in a span tag
		//------------------------------------------------------------
		var color = this._highlightColor( _alignId );
		html = html.insertAt( ind, '<span id="'+( _alignId )+'" class="align" style="background-color:'+color+'">' );
		positions = html.positions( end['word'], false, true, true );
		ind = positions[ ( end['occurence']-1 ) ]+end['word'].length;
		html = html.insertAt( ind, '</span>' );
		jQuery( select ).html( html );
	}
	
	/*
	this._mark = function( _bodinId, _alignId, _obj ) {
		var self = this;
		//------------------------------------------------------------
		//  Get the selector
		//------------------------------------------------------------
		var id = '#'+_bodinId;
		var book = '#book-'+_obj['book'];
		var chapter = '#chapter-'+_obj['chapter'];
		var select =  id+' '+book+' '+chapter+' *';
		//------------------------------------------------------------
		//  Find the start and end positions
		//------------------------------------------------------------
		var start = _obj['start'];
		var end = _obj['end'];
		//------------------------------------------------------------
		//  Get a color
		//------------------------------------------------------------
		var color = this._highlightColor( _alignId );
		//------------------------------------------------------------
		//  Retrieve text nodes
		//------------------------------------------------------------
		var startOccur = parseInt( start['occurence'] );
		var endOccur = parseInt( end['occurence'] );
		var textNodes = [];
		
		jQuery( select ).each( function() {
			var tag = jQuery( this ).get(0).tagName;
			var cls = jQuery( this ).attr( 'class' );
			//------------------------------------------------------------
			//  Ignore tag?
			//------------------------------------------------------------
			if ( self.ignoreTag[ tag ] == true ) {
				return 1;
			}
			if ( cls != undefined ) {
				cls = cls.replace( '.', '' );
				if ( self.ignoreClass[ cls ] == true ) {
					return 1;
				}
			}
			//------------------------------------------------------------
			//  Store the DOM element and its words to rebuild later
			//------------------------------------------------------------
			var startFound = false;
			var endFound = false;
			var words = jQuery( this ).html().replace( /\n/g, " " ).split(" ");
			for ( var i=0, ii=words.length; i<ii; i++ ) {
				var check = words[i];
				//------------------------------------------------------------
				//  Skip over html tags
				//------------------------------------------------------------
				if ( check.indexOf( '<' ) == 0 ) {
					while( check.indexOf( '>' ) == -1 && i<ii ) {
						i++;
					}
					continue;
				}
				//------------------------------------------------------------
				//  Clean up string to ensure accurate checks
				//------------------------------------------------------------
				check = check.stripTags().alphaOnly();
				//------------------------------------------------------------
				//  Check for word and occurence
				//------------------------------------------------------------
				if ( check == start['word'] && startFound == false ) {
					if ( startOccur == 1 ) {
						startFound = true;
						words[i] = '<span id="align-'+( _alignId )+'" class="align" style="background-color:'+color+'">' + words[i];
					}
					startOccur--;
				}
				if ( check == end['word'] && endFound == false ) {
					if ( endOccur == 1 ) {
						endFound = true;
						words[i] = words[i] + '</span>';
					}
					endOccur--;
				}
				if ( startFound == true && endFound == true ) {
					break;
				}
			}
			console.log( words.join(' ') );
			jQuery( this ).html( words.join(' ') );
		});
	}
	
	/**
	 *  Retrieve a highlight color
	 *
	 *  @param { int } _id The alignment id
	 *  @return { string } An rgba(255,0,0,0.25) string
	 */
	this._highlightColor = function( _id ) {
		var color = this.palette.colors[  _id % this.palette.colors.length ];
		return color.toAlpha( 0.15 );
	}
	
	/**
	 *  Trigger loaded event when each alignment is loaded
	 */
	this.loadCheck = function() {
		for ( var i in this.xml ) {
			if ( this.alignments[i]['loaded'] != true ) {
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
		var self = this;
		self.makeRoom();
		self.sizeCheck();
		self.buildNav();
		self.tooltips();
		self.align();
		if ( self.options['milestones'] != undefined ) {
			self.milestones();
		}
		jQuery( window ).resize( function() {
			self.sizeCheck();
		});
		
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
		if ( colors == undefined ) {
			return;
		}
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
	 * @return { array }
	 */
	BodinUI.prototype._alphaBlinkColors = function( _dom ) {
		if ( _dom == undefined ) {
			return undefined;
		}
		var color = jQuery( _dom ).css( 'background-color' );
		if ( color == undefined ) {
			return undefined;
		}
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
		if ( jQuery( this.elem ).width() < 450 ) {
			jQuery( this.elem ).addClass('slim');
		}
		else {
			jQuery( this.elem ).removeClass('slim');
		}
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
