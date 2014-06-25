/**
 * BodinAlign
 */
var BodinAlign = function() {
	//------------------------------------------------------------
	//  This class is a singleton.
	//  Ensure only one instance exists.
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
	this.palette = new Palette( 'secondary' );
	this.events = {
		loaded: 'BodinAlign-LOADED'
	};
	this.annotation_classes = {
		align: 'align',
		external: 'external',
		inline: 'inline'
	}
	this.isolated = false;
	//------------------------------------------------------------
	//  Error storage
	//------------------------------------------------------------
	this.errors = '';
	
	/**
	 *	  Start it up!
	 *
	 *	  @param { obj } _config Looks like this...
	 *		  [
	 *			  { 
	 *				  src: 'tempXml/alignment.xml', 
	 *				  ids: { body: 'latin', target: 'english' },
	 *			  }
	 *		  ]
	 */
	this.start = function( _config ) {
		//------------------------------------------------------------
		// Store the config for later use
		//------------------------------------------------------------
		this.config = _config;
		//------------------------------------------------------------
		// Get the unique alignment source
		//------------------------------------------------------------
		for ( var i in _config ) {
			this.src[ _config[i]['src'] ] = 1;
		}
		//------------------------------------------------------------
		// Create a container
		//------------------------------------------------------------
		for ( var i in this.src ) {
			this.alignments[ i ] = { loaded: false };
		}
		//------------------------------------------------------------
		// Get each alignment xml
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
			self.alignments[ _src ]['json'] = self.json( _data, _src );
			self.loadCheck();
		})
		.fail( function(){
			console.log( 'Could not load alignment xml: '+ _src );
		})
	}
	
	/**
	 *	Extract target data from XML
	 *
	 *  @param { String } _id BodinUI ID
	 *	@param { Dom } _target
	 *	@param { Obj } _bodinTarget JSON version
	 */
	this.target = function( _id, _target, _bodinTarget ) {
		if ( _target == undefined ) {
			throw 'Error target is undefined';
		}
		var targetUrn = this.getUrn( _target );
		var uri = ( targetUrn == _bodinTarget ) ?  null :  _target;
		var colon = _target.lastIndexOf( ':' ) + 1;
		//------------------------------------------------------------
		//	Get passage
		//------------------------------------------------------------
		var cite;
		var start;
		var end;
		//------------------------------------------------------------
		//	Pull the passage and subref from the target
		//------------------------------------------------------------
		var at = _target.indexOf('@');
		if ( at == -1 ) {
			cite = _target.substr( colon );
		} 
		else {
			cite = _target.substr( colon, at - colon );
			//------------------------------------------------------------
			//	Get the word and occurence
			//------------------------------------------------------------
			_target = _target.substr( at+1 , _target.length );
			var index = _target.split('-');
			//------------------------------------------------------------
			// This assumes that the html is already pre-processed with
			// word[occurrence] as the value of the data-ref attribute
			//------------------------------------------------------------
			start = index[0];
			end = index[1];
			//------------------------------------------------------------
			// It's possible to have a single word as an alignment.
			// So in this case the start is the end.
			//------------------------------------------------------------
			end = ( end != undefined ) ? end : start;
		}
		//------------------------------------------------------------
		//  Make sure target is complete
		//------------------------------------------------------------
		try {
			this.completeCheck( start, end, targetUrn, _target );
		}
		catch( _e ) {
			this.addError( _e );
		}
		//------------------------------------------------------------
		//	Return target data JSON style
		//------------------------------------------------------------
		var tokens = undefined;
		try {
			tokens = this.tokenGroup( _id, start, end );
		}
		catch( _e ) {
			this.addError( _e );
			return undefined;
		}
		//------------------------------------------------------------
		//  Create the target
		//------------------------------------------------------------
		return { 
			'bodin_id': _id,
			'work': targetUrn, 
			'tokens': tokens,
			'cite' : cite, 
			'uri': uri 
		}
	}
	
	/**
	 *	Get tokens between start and end tokens data-ref
	 *
	 * @param { String } _id
	 * @param { String } _start
	 * @param { String } _end
	 *
	 * bodinAlign.tokenGroup( 'french', 'A[1]', 'soueraigntie[1]' );
	 */
	this.tokenGroup = function( _id, _start, _end ) {
		var tokens = [];
		var start = this.token( _id, _start );
		var end = this.token( _id, _end );
		tokens.push( start.get(0) );
		if ( _start == _end ) {
			return tokens
		}
		start.nextUntil( end, '.token' ).each( function(){
			var id = jQuery( this ).attr('data-ref');
			if ( id != undefined ) {
				tokens.push( this );
			}
		});
		tokens.push( end.get(0) );
		return tokens;
	}
	
	/**
	 *	Make sure token reference exists.
	 *
	 * @param { String } _target
	 */
	this.token = function( _id, _target ) {
		var token = jQuery( '.bodin#'+_id+' .token[data-ref="'+_target+'"]' );
		if ( token.length == 0 ) {
			throw 'Token ('+_target+') not found in '+_id;
		}
		if ( token.length > 1 ) {
			throw 'Something is wrong. Token ('+_target+') is not unique in '+_id;
		}
		return token;
	}
	
	/**
	 *	It start is undefined then end must be undefined too
	 */
	this.completeCheck = function( _start, _end, _urn, _target ) {
		if ( _start == undefined && _end != undefined ) {
			throw 'Alignment Error, start = undefined, urn = ' + _urn + ' end = ' + _end;
		}
		if ( _end == undefined && _start != undefined ) {
			throw 'Alignment Error, end = undefined, urn = ' + _urn + ' start = ' + _start;
		}
	}
	
	/**
	 *	Add an error message to error output.
	 */
	this.addError = function( _error ) {
		this.errors += _error + "\n";
	}
	
	/**
	 *	Turn XML alignment into something more usable.
	 *
	 *	@param { XML } _data
	 *	@param { String } _src
	 */
	this.json = function( _data, _src ) {
		var self = this;
		//------------------------------------------------------------
		//	Increment the jsonId
		//------------------------------------------------------------
		var ids = this.xmlToIds( _src );
		//------------------------------------------------------------
		// Get the body work text identifier
		//------------------------------------------------------------
		var bodinBody = ids['body'];
		var bodinTarg = ids['target'];
		
		var body_workid = $("#" + ids['body'] + " .work").attr('id');
		var target_workid = $("#" + ids['target'] + " .work").attr('id');
		
		var json = [];
		jQuery( _data ).find('Annotation').each( function(){
			//------------------------------------------------------------
			//	Get the target
			//------------------------------------------------------------
			var targets = self.getTargets( 'hasTarget', this, bodinTarg, target_workid );
			if ( targets.length == 0 ) {
				return true; // a continue in jQuery().each() land
			}
			
			//------------------------------------------------------------
			//  Get the body
			//------------------------------------------------------------
			var bodies = self.getTargets( 'hasBody', this, bodinBody, body_workid );
			if ( bodies.length == 0 ) {
				return true; // a continue in jQuery().each() land
			}
			
			//------------------------------------------------------------
			// Get the motivation
			//------------------------------------------------------------
			json.push({ 
				target: targets, 
				body: bodies, 
				motivation: self.getMotivation( this ) 
			});
		});
		return json;
	}
	
	this.getMotivation = function( _annot ) {
		var motivation = jQuery( _annot ).find( 'motivatedBy' );
		return jQuery( motivation[0] ).attr( 'rdf:resource' );
	}
	
	this.getTargets = function( _has, _annot, _bodin, _workid ) {
		var self = this;
		var targets = []
		jQuery( _annot ).find( _has ).each(
			function() {
				var target = this;
				target = jQuery( target ).attr('rdf:resource');
				target = self.target( _bodin, target, _workid );
				if ( target ) {
					targets.push( target );
				}
			}
		);
		return targets;
	}
	
	/**
	 *	Apply translation alignment tags to Bodin markup.
	 */
	this.apply = function() {
		//------------------------------------------------------------
		//	Loop through the alignment document data
		//------------------------------------------------------------
		var srcId = 0;
		for ( var src in this.alignments ) {
			srcId++;
			var ids = this.xmlToIds( src );
			if ( ids == undefined ) {
				throw 'No ids specified for ' + src;
				continue;
			}
			//------------------------------------------------------------
			//  Get the alignment data into the right format and mark
			//  the Bodin HTML.
			//------------------------------------------------------------
			var alignId = 0;
			for ( var j in this.alignments[src]['json'] ) {
				alignId++;
				var obj = this.alignments[src]['json'][j];
				this.align( srcId, alignId, obj );
			}
		}
	}
	
	this.align = function( _srcId, _alignId, _obj ) {
		//------------------------------------------------------------
		//  Get a color class
		//------------------------------------------------------------
		var color = this.palette.colorClass( _alignId );
		var type = this.annotationType();
		//------------------------------------------------------------
		//  Mark the body and the target
		//------------------------------------------------------------
		this.mark( color, _obj, type, 'body', _srcId, _alignId );
		this.mark( color, _obj, type, 'target', _srcId, _alignId )
	}
	
	this.mark = function( _color, _obj, _type, _dir, _srcId, _alignId ) {
		//------------------------------------------------------------
		//  Mark each alignment subsection
		//------------------------------------------------------------
		for ( var i=0; i<_obj[ _dir ].length; i++ ) {
			var tokens = _obj[ _dir ][i]['tokens'];
			//------------------------------------------------------------
			//  Mark each token
			//------------------------------------------------------------
			var count = tokens.length;
			for ( var j=0; j<count; j++ ) {
				var classes = [ _color, _type ];
				if ( j == 0 ) {
					classes.push( 'align-start' );
				}
				if ( j == count-1 ) {
					classes.push( 'align-end' );
				}
				var elem = this.alignSpan( _srcId+'-'+_alignId, classes, _obj['motivation'] );
				jQuery( tokens[j] ).wrap( elem.smoosh().noSpaceHtml() );
			}
		}
	}
	
	/**
	 *	Find ids associated with an xml source
	 *
	 *	@param { string } _src The path to the alignment xml
	 *	return { obj } or { undefined }
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
	 *	Get the annotation type
	 *
	 * @param { Obj } _body
	 */
	this.annotationType = function( _body ) {
		if ( _body != undefined ) {
			if ( _body.uris != undefined && _body.uris.length > 0 ) {
				return this.annotation_classes.external;
			} 
			else if ( _body.text != undefined ) {
				return this.annotation_classes.inline;
			} 
		}
		return this.annotation_classes.align;
	}
	
	this.commentSpan = function( _alignId, _classes, _motivation, _body ) {
		return '\
			<span \
				class="inline-widget' + _classes + '"\
				data-alignId="' + _alignId + '" \
				data-motivation="' + _motivation + '" \
				data-source="' + _body.src + '" \
			>C</span>';
	}
	
	this.alignSpan = function( _alignId, _classes, _motivation ) {
		_classes = _classes.join(' ');
		return '\
			 <span \
				 class="' + _classes + '" \
				 data-motivation="' + _motivation + '" \
				 data-alignId="'+ _alignId + '" \
			 >\
			 </span>';
	}
	
	/**
	 *	Clear the alignment highlights.
	 */
	this.clear = function( _alignId ) {
		if ( _alignId == undefined ) {
			return jQuery('.align').removeClass('active');
		}
		return jQuery('.align[data-alignid="'+_alignId+'"]').removeClass('active');
	}
	
	/**
	 *	Show the alignment highlights
	 */
	this.show = function( _alignId ) {
		if ( _alignId == undefined ) {
			return jQuery('.align').addClass('active');
		}
		return jQuery('.align[data-alignid="'+_alignId+'"]').addClass('active');
	}
	
	/**
	 *	Isolate active alignments toggle
	 */
	this.isolate = function() {
		if ( this.isolated == false ) {
			jQuery('.token').addClass('whiteout');
			jQuery('.align.active .token').removeClass('whiteout');
			this.isolated = true;
			return;
		}
		jQuery('.token').removeClass('whiteout');
		this.isolated = false;
	}
	
	/**
	 *	Trigger loaded event when each alignment is loaded
	 */
	this.loadCheck = function() {
		//------------------------------------------------------------
		//	Make sure all the alignments are loaded.
		//------------------------------------------------------------
		for ( var i in this.alignments ) {
			if ( this.alignments[i]['loaded'] != true ) {
				return;
			}
		}
		//------------------------------------------------------------
		//	Set the palette style.
		//------------------------------------------------------------
		this.palette = new BodinPalette();
		this.palette.styles();
		//------------------------------------------------------------
		//	Trigger the loaded event.
		//------------------------------------------------------------
		jQuery( window ).trigger( this.events['loaded'] );
	}
	
	/**
	 * Get the CTS urn (without passage) from a uri 
	 * 
	 * @param { string } _str The string containing the uri
	 */
	 this.getUrn = function( _str ) {
		var stripped = '';
		var match = _str.match("^https?://.*?/(urn:cts:.*)$");
		if ( match != null ) {
			stripped = match[1];
			var colon = stripped.lastIndexOf(':');
			stripped = stripped.substr(0,colon);
		}
		return stripped;
	}

}