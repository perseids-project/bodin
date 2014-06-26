/**
 * BodinExternal
 * 
 * Plugin for retrieving and displaying external annotation bodies
 * Currently works only with CTS-enabled annotiation body URIs
 */
;(function( jQuery ) {
	/**
	 * Holds default config, adds user defined config, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn\
	 * @param { obj } _config Key value pairs to hold the plugin's configuration
	 * @param { string } _id The id of the DOM element
	 */
	function BodinExternal( _elem, _config, _id ) {
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
	 *						  Expected: { xslt_path : path to transformation of annotation body xml,
	 *									  tokenizer : url to tokenizer service
	 *									 }
	 */
	BodinExternal.prototype.init = function( _elem, _config ) {
		var self = this;
		
		//------------------------------------------------------------
		//	  Mark your territory
		//------------------------------------------------------------
		jQuery( self.elem ).addClass('bodin-external');
		
		//------------------------------------------------------------
		//	Get the instance id
		//------------------------------------------------------------
		self.id = jQuery( self.elem ).attr('id');
		
		//------------------------------------------------------------
		//	  User config 
		//------------------------------------------------------------
		 self.config = $.extend({}, _config );
		 
		 //------------------------------------------------------------
		 //	   Events
		 //------------------------------------------------------------
		 self.events = {
			loadtext: 'BodinExternal-LOADTEXT',
			loadinline: 'BodinExternal-LOADINLINE',
			textloaded: 'BodinExternal-TEXTLOADED'
		 };
		 //------------------------------------------------------------
		 //	   Start event listeners
		 //------------------------------------------------------------
		 self.start();
	 }
	
	/**
	 * Start the interface
	 * Loads the XSLT and sets up event listeners
	 */
	BodinExternal.prototype.start = function() {
		var self = this;
		self.loadXslt(self.config.xslt_path);
		self.listen();
	}
	
	/**
	 * Load XSLT
	 * 
	 * @param {string} _xsltPath path to XSLT file for
	 *				   annotation transform
	 */
	BodinExternal.prototype.loadXslt = function( _xsltPath ) {
		var self = this;
		jQuery.ajax({
			dataType: "xml",
			url: _xsltPath,
			async: false
		})
		.done( 
			function( _data ) {
				self.passageTransform = new XSLTProcessor();
				self.passageTransform.importStylesheet( _data );
		}).
		fail(
			function( jqXHR, textStatus, errorThrown ) { 
				var msg = "Can't get Passage XSLT";
				alert(msg);
				throw(msg);
			}
		);
	}
	
	/**
	* Listen for events
	* 
	* Adds a listener to load annotation text 
	*/
	BodinExternal.prototype.listen = function() {
		var self=this;
		jQuery( window ).on( self.events['loadtext'], function( _e, _uri, _target, _motivation ) {
			self.loadText( _e, _uri, _target, _motivation );
		});
		jQuery( window ).on( self.events['loadinline'], function( _e, _target, _motivation, _src ) {
			self.loadInlineText( _e, _target, _motivation, _src );
		});
	}
	
	/**
	* Build a uri to a perseus data record
	* 
	* @param { string } _urn
	* @param { string } _uri
	* @param { object } _subref
	*		Object {
	*			work: "urn:cts:greekLit:tlg0086.tlg010.perseus-eng1", 
	*			start: "since[1]", 
	*			end: "superior[1]", 
	*			cite: "1177a-1178a", 
	*			uri: null
	*		}
	* @param { array } _subrefs An array of _subref objects
	*/
	BodinExternal.prototype.buildUri = function( _urn, _uri, _subref, _subrefs ) {
		if ( _urn != '' && ! _uri.match(/^http:\/\/data\.perseus\.org/ ) ) {
			var link_uri = 'http://data.perseus.org/';
			if ( _subref ) {
				link_uri = link_uri + 'citations/';
			} 
			else {
				link_uri = link_uri + 'texts/';
			}
			link_uri = link_uri + _urn;
			if (_subrefs.length > 0) {
				link_uri = link_uri	 + ':' + _subrefs[0].cite;
			}
			return link_uri;
		} 
		else {
			return _uri;
		}
	}
	
	/**
	 * Load inline annotation text
	 * 
	 * @param {string} _target the identifier for the html element containing the target of the annotation
	 * @param {string} _motivation the motivation for the annotation
	 * @param {string} _source the annotation source
	 */
	BodinExternal.prototype.loadInlineText = function( _e, _target, _motivation, _src ) {
		var self = this;
		var id = jQuery( self.elem );
		var bodin_align = new BodinAlign();
		var text = bodin_align.alignments[_src]['json'][_target].bodyText;
		if ( text != null ) {
			//------------------------------------------------------------
			//	Add the HTML
			//------------------------------------------------------------
			jQuery( self.elem ).html( text ).
				prepend('<h2>' + _motivation + '</h2>');
			
			//------------------------------------------------------------
			//	Add bodin class for the style.
			//------------------------------------------------------------
			jQuery( self.elem ).addClass( 'bodin' );
			id.show();
		}
		return;
	}
	/**
	 * Load external annotation text
	 * 
	 * @param {event} _e the event
	 * @param {string} _uri space-separated list of uris representing the annotation
	 * @param {string} _target the identifier for the html element containing the target of the annotation
	 * @param {string} _motivation the motivation for the annotation
	 */
	BodinExternal.prototype.loadText = function( _e, _uri, _target, _motivation ) {
	   var self = this;
	   var uris = _uri.split(/ /);
	   var id = jQuery( self.elem );
	   var tokenizer_url = self.config.tokenizer;
	   
	   //------------------------------------------------------------
	   // for now, all annotations with multiple bodies must point
	   // at the same base uri and just use multiple references for 
	   // non-contiguous subref spans so we can just call get once
	   // on the base uri 
	   //------------------------------------------------------------
	   var uri_no_subref = uris[0];
	   var subref_index = uri_no_subref.indexOf('@');
	   if ( subref_index != -1 ) {
		   uri_no_subref = uris[0].substr( 0, subref_index );
	   }
	   var bodin_align = new BodinAlign();
	   var urn = bodin_align.getUrn( uris[0] );
	   var subrefs = [];
	   var subref = null;
	   for ( var i=0; i<uris.length; i++ ) {
		   subref = bodin_align.target( uris[i], urn );
		   if ( subref != undefined ) {
			   subrefs.push( subref );
		   }
	   }
	   
	   //------------------------------------------------------------
	   //  Ajax call
	   //------------------------------------------------------------
	   var request_url = tokenizer_url + encodeURIComponent( uri_no_subref );
	   jQuery.get( request_url ).done(
		   function( _data ) {
				//------------------------------------------------------------
				//	If the data doesn't need to be passed through XSLT just
				//	display the data raw.
				//------------------------------------------------------------
				if ( self.passageTransform == null ) {
					jQuery( self.elem ).html( _data );
					id.show();
					return
				}
				//------------------------------------------------------------
				//	So you need to do some XSLT processing.
				//------------------------------------------------------------
				if ( subrefs.length > 0 ) {
					self.passageTransform.setParameter( null,"e_cite", subrefs[0].cite );
				}
				var content = self.passageTransform.transformToDocument( _data );
				//------------------------------------------------------------
				//	No content after XSLT processing?  Show an error message.
				//------------------------------------------------------------
				if ( content == undefined ) {
					jQuery( self.elem ).html( '<div class="error">Unable to transform the requested text.</div>' )
					id.show();
					return
				}
				//------------------------------------------------------------
				//	You have some content that needs to be aligned.
				//------------------------------------------------------------
				var div = jQuery( "div#tei_body", content );
				if ( div.length > 0 ) {
					//------------------------------------------------------------
					//	Build the URI
					//------------------------------------------------------------
					var link_uri = self.buildUri( urn, _uri, subref, subrefs );
					//------------------------------------------------------------
					//	Add the HTML
					//------------------------------------------------------------
					jQuery( self.elem ).html( $(div).html() ).
						prepend('<div><a href="' + link_uri +'" target="_blank">' + link_uri + '</a></div>').
						prepend('<h2>' + _motivation + '</h2>');
					//------------------------------------------------------------
					//	Mark the aligned passages
					//------------------------------------------------------------
					if ( subref != undefined ) {
						bodin_align.mark( self.id, _target, subrefs, _motivation, null );
					}
					//------------------------------------------------------------
					//	Add bodin class for the style.
					//------------------------------------------------------------
					jQuery( self.elem ).addClass( 'bodin' );
					id.show();
					return;
				}
				//------------------------------------------------------------
				//	If you've made it this far something unusual probably
				//	happend. You'll get the raw data returned.
				//------------------------------------------------------------
				jQuery( self.elem ).html( _data );
				id.show();
				return
			})
			.fail(
				function() {
					jQuery( self.elem ).html('<div class="error">Unable to load the requested text.</div>');
					id.show();
				}
			);
	}
		  
	//----------------
	//	  Extend JQuery 
	//----------------
	jQuery( document ).ready( function( jQuery ) {
		jQuery.fn.BodinExternal = function( config ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new BodinExternal( this, config, id ) );
			});
		};
	})
})(jQuery);