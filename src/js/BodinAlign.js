/**
 * BodinAlign
 */
var BodinAlign = function() {
    //------------------------------------------------------------
    //    This class is a singleton.    Ensure only one instance exists.
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
        external: 'external'
    }
    this.styler = new Styler();
    
    /**
     *    Start it up!
     *
     *    @param { obj } _config Looks like this...
     *        [
     *            { 
     *                src: 'tempXml/alignment.xml', 
     *                ids: { body: 'latin', target: 'english' },
     *            }
     *        ]
     */
    this.start = function( _config ) {
        //------------------------------------------------------------
        //    Store the config for later use
        //------------------------------------------------------------
        this.config = _config;
        //------------------------------------------------------------
        //    Get the unique alignment source
        //------------------------------------------------------------
        for ( var i in _config ) {
            this.src[ _config[i]['src'] ] = 1;
        }
        //------------------------------------------------------------
        //    Create a container
        //------------------------------------------------------------
        for ( var i in this.src ) {
            this.alignments[ i ] = { loaded: false };
        }
        //------------------------------------------------------------
        //    Get each alignment xml
        //------------------------------------------------------------
        for ( var i in this.src ) {
            this.get( i );
        }
    }
    
    /**
     *    Retrieve an alignment xml document
     *
     *    @param { string } _src URL to an XML document
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
     *    Extract target data from XML
     *    @param { dom }
     *  @param { obj } JSON version
     */
    this.target = function( _target, _bodinTarget ) {
        var targetUrn = this.getUrn(_target);
        var uri = (targetUrn == _bodinTarget) ?  null :  _target;
        var colon = _target.lastIndexOf(':')+1;
        
        //------------------------------------------------------------
        //  Get passage
        //------------------------------------------------------------
        var cite;
        var start;
        var end;
        
        //------------------------------------------------------------
        //  Pull the passage and subref from the target
        //------------------------------------------------------------
        var at = _target.indexOf('@');
        if ( at == -1 ) {
            if (targetUrn == _bodinTarget) {
                // if the target is for one of the bodin texts
                // we don't want to process alignments without subreferences
                return undefined;
            } else {
                cite = _target.substr( colon );
            }
        } else {
            cite = _target.substr( colon, at-colon );
            //------------------------------------------------------------
            //  Get the word and occurence
            //------------------------------------------------------------
            _target = _target.substr( at+1 , _target.length );
            var index = _target.split('-');
            //------------------------------------------------------------
            // This assumes that the html is already pre-processed with
            // word[occurrence] as the value of the data-ref attribute
            //------------------------------------------------------------
            start = index[0];
            end = index[1];
        }
        //------------------------------------------------------------
        //  Return target data JSON style
        //------------------------------------------------------------
        return { 'work': targetUrn, 'start': start, 'end': end, 'cite' : cite, 'uri': uri }
    }
    
    this.json = function( _data, _src ) {
        var self = this;
        var ids = this.xmlToIds( _src );
        //------------------------------------------------------------
        // Get the body work text identifier
        //------------------------------------------------------------
        var body_workid = $("#" + ids['body'] + " .work").attr('id');
        var target_workid = $("#" + ids['target'] + " .work").attr('id');
        
        var json = [];
        jQuery( _data ).find('Annotation').each( function(){
            var annot = this;
            //------------------------------------------------------------
            //  Get the target
            //------------------------------------------------------------
            var targets = [];
            jQuery( annot ).find('hasTarget').each(
                function() {
                    var target = this;
                    target = jQuery( target ).attr('rdf:resource');
                    target = self.target( target, target_workid );
                    if (target) {
                        targets.push(target);
                    }
                }
            );
            
            if ( targets.length == 0 ) {
                return true; // a continue in jQuery().each() land
            }
           //------------------------------------------------------------
           //  Get the body
           //------------------------------------------------------------
           var bodies = [];
           jQuery( annot ).find('hasBody').each(
               function() {
                  var body = this;
                  body = jQuery( body ).attr('rdf:resource');
                  body = self.target( body, body_workid );
                  if (body) {
                      bodies.push(body);
                  }
               }
           );
           if ( bodies.length == 0 ) {
               return true; // a continue in jQuery().each() land
           }
           
           //------------------------------------------------------------
           // Get the motivation
           //------------------------------------------------------------
           var motivation = jQuery( annot ).find('motivatedBy');
           motivation = jQuery( motivation[0] ).attr('rdf:resource');
           
         
           json.push({ target: targets, body: bodies, motivation: motivation  });
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
                var uris = [];
                for (var k = 0; k< obj.body.length; k++) {
                    if (obj.body[k].uri) {
                        uris.push(obj.body[k].uri);
                    }
                }
                if ( uris.length == 0) {
                    this.mark( ids['body'], id, obj['body'], null, null );
                }
                this.mark( ids['target'], id, obj['target'], obj['motivation'], uris);                    
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
     *  @param { string } _uri
     */
    this.mark = function( _bodinId, _alignId, _obj, _motivation, _uri ) {
        //------------------------------------------------------------
        //  Get the text selector
        //------------------------------------------------------------
        var id = '#'+_bodinId;
                
        //------------------------------------------------------------
        //  Get the tokens from the text
        //------------------------------------------------------------
        var tokens = jQuery(id + " .token[data-cite='" + _obj[0]['cite'] + "']");
        
        //------------------------------------------------------------
        //  Get the color class for this alignment
        //------------------------------------------------------------
        var color_class = this.colorClass( _alignId );
        var annotation_type = this.annotation_classes.external;
        if (_uri == null || _uri.length == 0) {
          annotation_type = this.annotation_classes.align;
        }
    
        //------------------------------------------------------------
        //  Identify each word in the passage with the alignment id 
        //------------------------------------------------------------
        if ( tokens.length > 0) {
            for ( var j=0; j<_obj.length; j++ ) {
                var start = _obj[j]['start'];
                var end = _obj[j]['end'];
                 var sibs = tokens;
                 var done = false;
                 var started = false;
                 for ( var i=0; i<sibs.length; i++ ) {
                     if ( done ) {
                         break;
                     }
                     var sib = jQuery( sibs[i] );
                     var start_class = '';
     
                     if ( ! started ) { 
                         if (sib.attr('data-ref') == start) {
                            start_class = annotation_type + '-start';
                            started = true;
                         } 
                         else {
                             continue;
                         }
                     }
                     var end_class = '';
                     //------------------------------------------------------------
                     // Add a class to indicate its the end of the alignment
                     //------------------------------------------------------------
                     if ( sib.attr('data-ref') == end ) {
                         end_class = annotation_type + '-end';
                     }
                     //------------------------------------------------------
                     // Add a wrapping element on the token to hold alignment
                     // info and make it an inner element so that the original 
                     // token element remains the outermost element
                     //------------------------------------------------------
                     var classes = [annotation_type, annotation_type + '-' + _alignId, end_class, start_class, color_class ].join(' ');
                     var elem =     this.alignSpan( _alignId, classes, _uri, _motivation);
                     sib.wrapInner( elem.smoosh() );
                     
                     if ( sib.attr('data-ref') == end ) {
                         done = true;
                     }
                 }
             }
        }
        //------------------------------------------------------
        // we should probably handle the case where the matching
        // alignment couldn't be found and remove the highlights
        //------------------------------------------------------
    }
    
    this.alignSpan = function( _alignId, _classes, _uri, _motivation ) {
       var uris = _uri != null ? _uri.join(' ') : '';  
       return '\
            <span \
                class="' +
                    _classes +
                '" data-motivation="' + _motivation + '"\
                data-alignUri="' + uris + '" data-alignId="'+_alignId+'"\
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
    
    /**
     * Get the CTS urn (without passage) from a uri 
     * 
     * @param { string } the string containing the uri
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