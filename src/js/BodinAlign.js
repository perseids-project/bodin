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
	this.palette = new Palette( 'secondary' );
	this.events = {
		loaded: 'BodinAlign-LOADED',
		aligned: 'BodinAlign-ALIGNED'
	};
	this.styler = new Styler();
	
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
			this.get( i );
		}
	}
	
	/**
	 *	Retrieve an alignment xml document
	 *
	 *	@param { string } _src URL to an XML document
	 */
	this.get = function( _src ) {
		var self = this;
		jQuery.get( _src )
		.done( function( _data ){
			self.alignments[ _src ]['xml'] = _data;
			self.alignments[ _src ]['loaded'] = true;
			self.alignments[ _src ]['json'] = self.json( _data );
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
	this.target = function( _target ) {
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
//		var start = this.wordAndOccurence( index[0] );
//		var end = this.wordAndOccurence( index[1] );
		//------------------------------------------------------------
		// This assumes that the html is already pre-processed with 
		// word[occurrence] as the value of the data-ref attribute
		//------------------------------------------------------------
		var start = index[0];
		var end = index[1];
		//------------------------------------------------------------
		//  Return target data JSON style
		//------------------------------------------------------------
		return { 'book': book, 'chapter': chapter, 'start': start, 'end': end }
	}
	
	this.json = function( _data ) {
		var self = this;
		var json = []
		jQuery( _data ).find('Annotation').each( function(){
			var annot = this;
			//------------------------------------------------------------
			//  Get the target
			//------------------------------------------------------------
			var target = jQuery( annot ).find('hasTarget');
			target = jQuery( target[0] ).attr('rdf:resource');
			target = self.target( target );
			if ( target == undefined ) {
				return true; // a continue in jQuery().each() land
			}
			//------------------------------------------------------------
			//  Get the body
			//------------------------------------------------------------
			var body = jQuery( annot ).find('hasBody');
			body = jQuery( body[0] ).attr('rdf:resource');
			body = self.target( body );
			if ( target == undefined ) {
				return true; // a continue in jQuery().each() land
			}
			json.push({ target: target, body: body });
		});
		return json;
	}
	
	this.wordAndOccurence = function( _string ) {
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
			var ids = this.xmlToIds( src );
			if ( ids == undefined ) {
				console.log( 'No ids specified for ' + src );
				continue;
			}
			var id = 1;
			for ( var j in this.alignments[src]['json'] ) {
				var obj = this.alignments[src]['json'][j];
				this.mark( ids['body'], id, obj['body'] );
				this.mark( ids['target'], id, obj['target'] );
				id++;
			}
		}
		//------------------------------------------------------------
		//  Announce alignment is complete
		//------------------------------------------------------------
		jQuery( window ).trigger( this.events['aligned'] );
	}
	
	/**
	 *  Find ids associated with an xml source
	 *
	 *  @param { string } _src The path to the alignment xml
	 *  return { obj }
	 */
	this.xmlToIds = function( _src ) {
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
	this.mark = function( _bodinId, _alignId, _obj ) {
		//------------------------------------------------------------
		//  Get the selector
		//------------------------------------------------------------
		var id = '#'+_bodinId;
		var book = '#book-'+_obj['book'];
		var chapter = '#chapter-'+_obj['chapter'];
		var select =  id+' '+book+' '+chapter;
		var html = jQuery( select ).html();
		//------------------------------------------------------------
		//  Find the start and end elements
		//------------------------------------------------------------
		var start = _obj['start'];
		var end = _obj['end'];
		var color_class = ' ' + this.colorClass( _alignId );
		
		//------------------------------------------------------------
		//  TODO: Position calculation needs the citation structure
		//  of the document -- Ideally this should be handled 
		//  during pre-processing so our UI code doesn't 
		//  need to do this.
		//------------------------------------------------------------
		//------------------------------------------------------------
		//  Identify each word in the passage with the alignment id 
		//------------------------------------------------------------
		var start_elem = jQuery( "span.token.text[data-ref='" + start + "']" );
		var end_elem = jQuery( "span.token.text[data-ref='" + end + "']" );
		if ( start_elem && end_elem ) {
			//-----------------------------------------------------------
			// TODO: This breaks if the start and end of the range 
			// aren't in the same display hierarchy. (e.g. If there are not
			// citation-specific groupings that break up the hierarchy ).
			//-----------------------------------------------------------
			var sibs = $( start_elem ).nextAll('.token').addBack();
			var done = false;
			for ( var i=0; i<sibs.length; i++ ) {
				if ( done ) {
					break;
				}
				var sib = jQuery( sibs[i] );
				var num = parseInt( sib.attr('data-aligned') ) + 1;
				sib.attr( 'data-aligned', num );
				var start_class = '';
				var end_class = '';
				if ( i == 0 ) {
					start_class = ' align-start';
				}
				//------------------------------------------------------------
				// Add a class to indicate its the end of the alignment
				//------------------------------------------------------------
				if ( sib.attr('data-ref') == end ) {
					end_class = ' align-end';
				}
				//------------------------------------------------------
				// If we already have aligned this word, we need to add 
				// another wrapping element for the next alignment
				// make it an inner element so that it doesn't break
				// with finding siblings for other alignments
				//------------------------------------------------------
				var elem = 	this.alignSpan( _alignId, start_class, end_class, color_class );
				sib.wrapInner( elem.smoosh() );
				
				if ( sib.attr('data-ref') == end ) {
					done = true;
				}
			}
		}
		//------------------------------------------------------
		// we should probably handle the case where the matching
		// alignment couldn't be found and remove the highlights
		//------------------------------------------------------
	}
	
	this.alignSpan = function( _alignId, _start_class, _end_class, _color_class ) {
		return '\
			<span \
				class="\
					aligned align-'+_alignId+ 
					_start_class + 
					_end_class + 
					_color_class + 
				'" \
				data-alignId="'+_alignId+'"\
			>\
			</span>';
	}
	
	/**
	 *  Retrieve a highlight color
	 *
	 *  @param { int } _id The alignment id
	 *  @return { string } An rgba(255,0,0,0.25) string
	 */
	this.highlightColor = function( _id ) {
		return this.alphaColor( _id, 0.15 );
	}
	
	/**
	 *  Retrieve a highlight blink color
	 *
	 *  @param { int } _id The alignment id
	 *  @return { string } An rgba(255,0,0,0.25) string
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
	 *  Create palette styles
	 */
	this.paletteStyles = function() {
		var rule = {};
		for ( var i=0; i<this.palette.colors.length; i++ ) {
			rule[ '.'+this.colorClass(i) ] = 'background-color:'+this.highlightColor(i);
			rule[ '.'+this.colorClass(i)+'.blink' ] = 'background-color:'+this.highlightBlinkColor(i);
			this.styler.add( rule );
		}
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
		this.paletteStyles();
		jQuery( window ).trigger( this.events['loaded'] );
	}
}