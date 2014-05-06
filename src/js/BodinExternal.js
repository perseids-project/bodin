/**
 * BodinExternal
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
	 */
	BodinExternal.prototype.init = function( _elem, _config ) {
	   var self = this;
	   
	   //------------------------------------------------------------
	   //	Mark your territory
	   //------------------------------------------------------------
	   jQuery( self.elem ).addClass('bodin-external');
	   
	   //------------------------------------------------------------
	   //  Get the instance id
	   //------------------------------------------------------------
	   self.id = jQuery( self.elem ).attr('id');
	   
	   //------------------------------------------------------------
	   //	User config 
	   //------------------------------------------------------------
		self.config = $.extend({
		}, _config );
		
		//------------------------------------------------------------
		//	Events
		//------------------------------------------------------------
		self.events = {
            load: 'BodinExternal-LOADTEXT',
			load_done: 'BodinExternal-TEXTLOADED'
		};
		//------------------------------------------------------------
		//	Start event listeners
		//------------------------------------------------------------
		self.start();
	}
	
	/**
	 * Start the interface
	 */
	BodinExternal.prototype.start = function() {
	   var self = this;
	   self.loadXslt(self.config.xslt_path);
	   self.listen();
	}
	
	BodinExternal.prototype.loadXslt = function(_xsltPath) {
	   var self = this;
	   jQuery.ajax({
	       dataType: "xml",
	       url: _xsltPath,
	       async: false
	    }).done( 
            function(_data) {
                self.passageTransform = new XSLTProcessor();
                self.passageTransform.importStylesheet(_data);   
        }).fail(
            function(jqXHR, textStatus, errorThrown) { 
                var msg = "Can't get Passage XSLT";
                alert(msg);
                throw(msg);
            }
        );
	}
	
	BodinExternal.prototype.listen = function() {
	   var self=this;
	   jQuery( window ).on( self.events.load, function( _e, _uri, _target, _motivation) {
	       self.loadText( _e, _uri, _target, _motivation );
	   });
	}
	
	BodinExternal.prototype.loadText = function(_e, _uri, _target, _motivation) {
	   var self = this;
	   var id = jQuery( self.elem );
	   var tokenizer_url = self.config.tokenizer;
	   var subref_index = _uri.indexOf('@');
	   var uri_no_subref = _uri;
	   if (subref_index != -1) {
	       uri_no_subref = _uri.substr(0,subref_index);    
	   }
	   var bodin_align = new BodinAlign();
	   var urn = bodin_align.getUrn(_uri);
	   var subref = bodin_align.target(_uri,urn);
	   var request_url = tokenizer_url + encodeURIComponent(uri_no_subref);
	   jQuery.get(request_url).done(
	       function(_data) {
	           if (self.passageTransform != null) {
	               if (subref) {
	                   self.passageTransform.setParameter(null,"e_cite",subref.cite);
	               }
                   var content = self.passageTransform.transformToDocument(_data);
                   if (content) {
                        var div = jQuery("div#tei_body",content);
                        if (div.length > 0) {
                           
                            var link_uri;
                            if (urn != '' && ! _uri.match(/^http:\/\/data\.perseus\.org/)) {
                                link_uri = 'http://data.perseus.org/';
                                if (subref) {
                                    link_uri = link_uri + 'citations/';
                                } else {
                                    link_uri = link_uri + 'texts/';
                                }
                                link_uri = link_uri + urn + ':' + subref.cite + '@' + subref.start + '-' + subref.end;
                            } else {
                                link_uri = _uri;
                            }
    
                            jQuery( self.elem ).html($(div).html()).
                                prepend('<div><a href="' + link_uri +'" target="_blank">' + link_uri + '</a></div>').
                                prepend('<h2>' + _motivation + '</h2>');
                            if (subref) {
                                bodin_align.mark(self.id,_target,subref,_motivation,null);
                            }
                        } else {
                            jQuery( self.elem ).html('<div class="error">Unable to transform the requested text.</div>')
                        }
                      } else {
                        jQuery( self.elem ).html(_data);
                    }
                } else {
                    jQuery( self.elem ).html(_data);
                }
                id.show();
              }).fail(
                function() {
                  jQuery( self.elem ).html('<div class="error">Unable to load the requested text.</div>');
                  id.show();
                }
              );
    }
          
    //----------------
	//	Extend JQuery 
	//----------------
	jQuery(document).ready( function( jQuery ) {
		jQuery.fn.BodinExternal = function( config ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new BodinExternal( this, config, id ) );
			});
		};
	})
})(jQuery);