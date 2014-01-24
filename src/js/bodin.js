/*!
 * bodin - bodin
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
;(function($) {
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn
	 *
	 * @param { obj } _options Key value pairs to hold the plugin's configuration
	 *
	 * @param { string } _id The id of the DOM element
	 */
	function bodin( _elem, _options, _id ) {
		var self = this;
		self.elem = _elem;
		self.id = _id;
		self.init( _elem, _options );
	}
	
	/**
	 * Holds default options, adds user defined options, and initializes the plugin
	 *
	 * @param { obj } _elem The DOM element where the plugin will be drawn
	 *
	 * @param { obj } _options Key value pairs to hold the plugin's configuration
	 */
	bodin.prototype.init = function( _elem, _options ) {
		var self = this;
		
		//------------------------------------------------------------
		//	Mark your territory
		//------------------------------------------------------------
		$( self.elem ).addClass('bodin');
		
		//------------------------------------------------------------
		//	User options 
		//------------------------------------------------------------
		self.options = $.extend({
			break: 'paragraph',
			break_count: null,
			blocks_per_page: 5,
			markers: null
		}, _options );
		
		//------------------------------------------------------------
		//  Events
		//------------------------------------------------------------
		self.events = {
			goTo: 'BODIN-GOTO',
			align: 'BODIN-ALIGN'
		};
		
		//------------------------------------------------------------
		//  Build the thing
		//------------------------------------------------------------
		self.build();
		
		//------------------------------------------------------------
		//  Start event listeners
		//------------------------------------------------------------
		self.start();
	}
	
	/**
	 * Scroll to a block.
	 *
	 * @param { int } _blockId The id of a block
	 */
	bodin.prototype.goTo = function( _blockId ) {
		var self = this;
		var marker = '#block-'+_blockId+' .marker';
		var pos = $( marker , self.elem ).position();
		var mb = $( marker, self.elem ).siblings('.text').css('margin-bottom');
		offset = parseInt( mb.replace('px','') );
		var scroll = pos.top - offset;
		var current = $( '.view', self.elem ).scrollTop();
		$( '.view', self.elem ).animate ({
			scrollTop: current + scroll
		}, 1000 );
	}
	
	/**
	 * Build the text
	 */
	bodin.prototype.build = function() {
		var self = this;
		
		//------------------------------------------------------------
		//  Break up the text into blocks.
		//------------------------------------------------------------
		self.blocks = [];
		switch ( self.options[ 'break'].toLowerCase() ) {
			case 'paragraph':
				var i = 0;
				$( 'p', self.elem ).each( function() {
					self.blocks[i] = $( this ).html();
					i++;
				});
				break;
		}
		
		//------------------------------------------------------------
		//  Build the blocks
		//------------------------------------------------------------
		$( self.elem ).empty();
		for ( var i=0, ii=self.blocks.length; i<ii; i++ ) {
			self.blockBuild( i );
		}
		
		//------------------------------------------------------------
		//  Build the pages
		//------------------------------------------------------------
		self.pageBuild();
		
		//------------------------------------------------------------
		//  Wrap it all up
		//------------------------------------------------------------
		$( self.elem ).wrapInner( '<div class="work"><div class="view"></div></div>')
		
		//------------------------------------------------------------
		//  Add a clear
		//------------------------------------------------------------
		$( self.elem ).append( '<div style="clear:both"></div>' );
		
		//------------------------------------------------------------
		//  Create a statistics object
		//------------------------------------------------------------
		self.stats = {
			total_blocks: self.blocks.length,
			blocks: {}
		};
	}
	
	/**
	 * Build a block.
	 *
	 * @param { int } _i The index of the block.
	 */
	bodin.prototype.blockBuild = function( _i ) {
		var self = this;
		var i=_i+1;
		var mrk = i;
		if ( self.options['markers'] != null ) {
			var mod = _i % self.options['markers'].length;
			mrk = self.options['markers'][mod];
		}
		var block = '<div id="block-'+i+'" class="block">';
		var marker = '<a href="" class="marker">'+mrk+'</a>';
		var text = '<div class="text">';
		$( self.elem ).append( block );
		$( '#block-'+i, self.elem ).append( marker );
		$( '#block-'+i, self.elem ).append( text );
		$( '#block-'+i+' .text', self.elem ).append( self.blocks[ _i ] );
	}
	
	/**
	 * Wrap blocks in pages.
	 */
	bodin.prototype.pageBuild = function() {
		var self = this;
		var blocks = $( ".block", self.elem );
		var perPage = self.options['blocks_per_page'];
		var page = 1;
		for ( var i=0, ii=blocks.length; i<ii; i+=perPage ) {
			blocks.slice( i, i+perPage ).wrapAll('<div class="page"></div>');
			$( '.page', self.elem ).last().append('<div style="clear:both"></div>');
			$( '.page', self.elem ).last().prepend('<div class="pageNum">'+page+'</div>');
			page++;
		}
	}
	
	/**
	 * Start event listeners.
	 */
	bodin.prototype.start = function() {
		var self = this;
		$( document ).on( self.events['goTo'], function( _e, _i ){
			self.goTo( _i );
		});
		$( '.marker', self.elem ).click( function( _e ) {
			var i = $(this).parent().attr('id').replace( 'block-','' );
			$( document ).trigger( self.events['goTo'], [i] );
			_e.preventDefault();
		});
	}
	
	/**
	 * Retrieve some statistics about the text
	 */
	bodin.prototype.textStats = function() {
		var self = this;
		//------------------------------------------------------------
		//  Get statistics at the block level
		//------------------------------------------------------------
		var tCount = 0;
		var textReport = {}; // Text level report
		var objExt = new ObjectExt();
		for ( var i=0, ii=self.blocks.length; i<ii; i++ ) {
			self.blockStats( i );
			tCount += self.stats['blocks'][i]['total_words'];
			objExt.mergeAdd( self.stats['blocks'][i]['report'], textReport );
		}
		self.stats['total_words'] = tCount;
		self.stats['report'] = textReport;
		return self.stats;
	}
	
	/**
	 * Retrieve some statistics about a block
	 */
	bodin.prototype.blockStats = function( _i ) {
		var self = this;
		self.stats['blocks'][_i] = {};
		//------------------------------------------------------------
		//  Get a word frequency report
		//------------------------------------------------------------
		self.stats['blocks'][_i]['report'] = self.blocks[_i].report();
		var report = self.stats['blocks'][_i]['report'];
		var uCount = 0;
		var tCount = 0;
		for ( var word in report ) {
			uCount++;
			tCount+=report[word];
		}
		self.stats['blocks'][_i]['unique_words'] = uCount;
		self.stats['blocks'][_i]['total_words'] = tCount;
	}
	
	//----------------
	//	Extend JQuery 
	//----------------
	jQuery(document).ready( function($) {
		jQuery.fn.bodin = function( options ) {
			var id = jQuery(this).selector;
			return this.each( function() {
				jQuery.data( this, id, new bodin( this, options, id ) );
			});
		};
	})
})(jQuery);

/**
 * Align the bodin blocks
 */
jQuery.fn.bodinAlign = function() {
	var heights = [];
	
	//------------------------------------------------------------
	//  Find the largest height
	//------------------------------------------------------------
	$( '.bodin .view' ).each( function() {
		var i=1;
		$( '.block .text', this ).each( function() {
			var h = $(this).height();
			heights[i] = ( i < heights.length && heights[i] > h ) ? heights[i] : h;
			i++;
		});
	});
	
	//------------------------------------------------------------
	//  Set the heights
	//------------------------------------------------------------
	for ( var i=0, ii=heights.length; i<ii; i++ ) {
		var id = i;
		$( '#block-'+id+' .text' ).css({ "min-height": heights[i] });
	}
}

/**
 * Bodin family.  Interact with multiple bodin objects.
 */
function bodinFamily() {
	this.bodins = [];
}

bodinFamily.prototype.add = function( _bodin ) {
	this.bodins.push( _bodin );
}