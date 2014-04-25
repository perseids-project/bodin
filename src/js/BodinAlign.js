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
		var self = this;
		//------------------------------------------------------------
		//  Get the selector
		//------------------------------------------------------------
		var id = '#'+_bodinId;
		var book = '#book-'+_obj['book'];
		var chapter = '#chapter-'+_obj['chapter'];
		var select =  id+' '+book+' '+chapter;
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
		//  Get the root node
		//------------------------------------------------------------
		var root = jQuery( select, self.elem ).get(0);
		//------------------------------------------------------------
		//  Insert start span
		//------------------------------------------------------------
		var span = '<span id="align-'+_alignId+'" class="align" style="background-color:'+color+'">'
		this._nodeCheck( root, start.word, start.occurence, span, false, 0, undefined );
		//------------------------------------------------------------
		//  Close span
		//------------------------------------------------------------
		span = '</span>';
		this._nodeCheck( root, end.word, start.occurence, span, true, 0, undefined );
		
	}
	
	this._nodeCheck = function( _node, _search, _occurence, _insert, _after, _count ) {
		var node = _node;
		var next;
		//------------------------------------------------------------
		//  Elements
		//------------------------------------------------------------
		if ( node.nodeType === 1 ) {
			//------------------------------------------------------------
			//  Ignore this node?
			//------------------------------------------------------------
			if ( this.ignoreTag[ node.nodeName ] == true ) {
				this._nodeCheck( node.nextSibling, _search, _occurence, _insert, _after, _count );
				return;
			}
			//------------------------------------------------------------
			//  Start walking that DOM
			//------------------------------------------------------------
			if ( node = node.firstChild ) {
				do {
					next = node.nextSibling;
					this._nodeCheck( node, _search, _occurence, _insert, _after, _count );
				} while( node = next );
			}
		//------------------------------------------------------------
		//  Text
		//------------------------------------------------------------
		} else if ( node.nodeType === 3 ) { 
			var text = node.data
			var regex = new RegExp( _search+'[^a-zA-Z0-9]', 'gm' );
			var matches = regex.exec( text );
			//------------------------------------------------------------
			//  Hey you have a match!
			//------------------------------------------------------------
			if ( matches != null ) {
				for ( var i=0; i<matches.length; i++ ) {
					_count++;
					//------------------------------------------------------------
					//  Is this the right occurence?
					//------------------------------------------------------------
					if ( _count == _occurence ) {
						//------------------------------------------------------------
						//  Before or after the matched word?
						//------------------------------------------------------------
						var index = matches.index;
						if ( _after == true ) {
							index += _search.length;
						}
						//------------------------------------------------------------
						//  Splice the insert string and exit!
						//------------------------------------------------------------
						text = text.splice( _insert, index );
						node.data = text;
						//------------------------------------------------------------
						//  Okay inserting nodes is tricky
						//------------------------------------------------------------
						return;
					}
				}
			}
		}
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