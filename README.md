# bodin
bodin is a jQuery plugin used to visually compare texts.  
It's named after Jean Bodin, the French political philosopher, whose translated works are the mother of this invention.

# Requirements
* jQuery

# Installation
git clone ...

# Use
Something like this...

	<div id="bodin"></div>
	<div id="text1">
		<div id="one_0">
		</div>
		<div id="one_1">
		</div>
	</div>
	<div id="text2">
	</div>
	<div id="text3">
	</div>
	
	$( '#bodin' ).bodin({
		texts: [ '#text1', '#text2', '#text3' ]
	});
