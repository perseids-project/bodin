# bodin
bodin is a jQuery plugin used to visually compare texts.
It's named after Jean Bodin, the French political philosopher, whose translated works are the mother of this invention.

# Requirements
* jQuery

# Installation
Run this command in your terminal.

	git clone https://github.com/caesarfeta/bodin bodin


# Use
Add the required Javascript and CSS files.

	<link href="{% your-path %}/bodin/src/css/bodin.css" rel="stylesheet" type="text/css" />	
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="{% your-path %}/bodin/src/js/bodin.js"></script>

Add your text.

	<div class="bodin">
		<p>Once there was a man from Nantucket who would...
		... and that's how I spent my summer vacation.</p>
	</div>
	
	<div class="bodin">
		<p>Never could I imagine that Natalie would become...
		... after the Universe exploded we got pizza.</p>
	</div>

Start bodin.

	$( '.bodin' ).bodin();	

If you want to normalize the height of text blocks across all bodin instances, aka align the text.  Run the following.

	$( document ).bodinAlign();
