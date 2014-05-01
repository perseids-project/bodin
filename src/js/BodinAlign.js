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
		
		//------------------------------------------------------------
		// this assumes that the html is already pre-processed with 
		// word[occurrence] as the value of the data-ref attribute
		//------------------------------------------------------------
		var start = index[0];
		var end = index[1];
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
		//  Find the start and end elements
		//------------------------------------------------------------
		var start = _obj['start'];
		var end = _obj['end'];
		
		//-------------------------------------------------------------
		// calculation of positions needs knowledge of the citation structure
		// of the document -- this should be handled in a pre-processing 
		// state so ui code doesn't need to deal with it
		//---------------------------------------------------------------
		
		
		//------------------------------------------------------------
		//  identify each word in the passage with the alignment id 
		//------------------------------------------------------------
		var color = this._highlightColor( _alignId );
		var start_elem = jQuery("span.token.text[data-ref='" + start + "']");
		var end_elem = jQuery("span.token.text[data-ref='" + end + "']");
		
		if (start_elem && end_elem) {
	        //-----------------------------------------------------------
	        // note that this breaks if the start and end of the range 
	        // aren't in the same display hierarchy (e.g. if there are not
	        // citation-specific groupings that break up the hierarchy
	        // haven't figured out the best way to deal with that yet
	        //-----------------------------------------------------------
	        var sibs = $(start_elem).nextAll('.token').addBack();
	        var done = false;
	        for (var i=0; i<sibs.length; i++) {
	            if (done) {
	                break;
                }
                if ( jQuery(sibs[i]).hasClass('aligned') ) {
                    var num = parseInt(jQuery(sibs[i]).attr('data-aligned')) + 1;
                    jQuery(sibs[i]).attr('data-aligned',num);
                    var start_class = '';
                    var end_class = '';
                    if (i == 0) {
                        start_class = ' align-start';   
                    }
                    if (jQuery(sibs[i]).attr('data-ref') == end) {
                        // add a class to indicate its the end of the alignment
                        end_class = ' align-end';
                    }
                    //------------------------------------------------------
                    // if we already have aligned this word, we need to add 
                    // another wrapping element for the next alignment
                    // make it an inner element so that it doesn't break
                    // with finding siblings for other alignments
                    //------------------------------------------------------
                    jQuery(sibs[i]).wrapInner('<span class="token aligned align-' + ( _alignId ) + start_class + end_class +
                        '" data-alignId="' + (_alignId) + '" style="background-color:' + (color) +';"></span>');
                }
                else {
                    jQuery(sibs[i]).css("background-color",color).attr('data-alignId',( _alignId )).addClass('aligned').attr('data-aligned','1');
                    // add a class to indicate its the start of the alignment
                    if (i == 0) {
                        jQuery(sibs[i]).addClass('align-start');   
                    } 
                    if (jQuery(sibs[i]).attr('data-ref') == end) {
                        // add a class to indicate its the end of the alignment
                        jQuery(sibs[i]).addClass('align-end');
                    }
                    
                }
                
                if (jQuery(sibs[i]).attr('data-ref') == end) {
                    done = true;
                }
            } // end loop through siblings 		    
        }
        //------------------------------------------------------
        // we should probably handle the case where the matching
        // alignment couldn't be found and remove the highlights
        //------------------------------------------------------
        
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