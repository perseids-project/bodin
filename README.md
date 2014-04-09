# bodin
bodin is a jQuery plugin used to visually compare texts.
It's named after Jean Bodin, the French political philosopher, whose translated works are the mother of this invention.

# Requirements
* jQuery
* jslib

# Installation
Run this command in your terminal.

	git clone https://github.com/caesarfeta/bodin bodin
	git submodule update --init

# Use
Add the required Javascript and CSS files.

	<link href="bodin/src/css/bodin.css" rel="stylesheet" type="text/css" />	
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="bodin/third_party/jslib/src/js/ObjectExt.js"></script>
	<script type="text/javascript" src="bodin/third_party/jslib/src/js/StringExt.js"></script>
	<script type="text/javascript" src="bodin/third_party/jslib/src/js/jQueryPlus.js"></script>
	<script type="text/javascript" src="bodin/src/js/bodin.js"></script>

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

# Work Log
# 2014-04-09
So I'm going to use XSLT to convert the TEI XML into something usable by the Bodin Plugin.

Here's some great info to help me get started...
http://www.w3schools.com/xsl/xsl_client.asp


# Okay... let's party.
Step 1.  Manually build ideal HTML
Step 2.  XSL Transform of Main Text Body.
Step 3.  Text alignments...  IDs and such.

	Text Annotations-Annotations_for_1586_De_Republica.xml

	<Annotation xmlns="http://www.w3.org/ns/oa#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" rdf:about="http://data.perseus.org/perseids/annotations/1016/1451/1455/138/3">
		<hasTarget xmlns="http://www.w3.org/ns/oa#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" rdf:resource="http://sosol.perseids.org/sosol/cts/getpassage/1451/urn:cts:pdlpsci:bodin.livrep.perseus-lat1:1.1@quoniam[1]-ex[1]"/>
		<hasBody xmlns="http://www.w3.org/ns/oa#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" rdf:resource="http://sosol.perseids.org/sosol/cts/getpassage/1453/urn:cts:pdlpsci:bodin.livrep.perseus-eng1:1.1@for[1]-actions[1]"/>
		<motivatedBy xmlns="http://www.w3.org/ns/oa#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" rdf:resource="oa:linking_translation"/>
		<annotatedBy xmlns="http://www.w3.org/ns/oa#">
			<Person xmlns="http://xmlns.com/foaf/0.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" rdf:about="http://data.perseus.org/sosol/users/Ashwin%20Chak"/>
		</annotatedBy>
		<annotatedAt xmlns="http://www.w3.org/ns/oa#">2014-02-12T17:31:37+00:00</annotatedAt>
	</Annotation>
	
	Body: http://sosol.perseids.org/sosol/cts/getpassage/1453/urn:cts:pdlpsci:bodin.livrep.perseus-eng1:1.1@for[1]-actions[1]
		returns: "for that in all arts and actions"
	Target: http://sosol.perseids.org/sosol/cts/getpassage/1451/urn:cts:pdlpsci:bodin.livrep.perseus-lat1:1.1@quoniam[1]-ex[1]
		returns: "quoniam artium tradendarum,ac rerum omnium agendarum ex"
		
	Target: http://sosol.perseids.org/sosol/cts/getpassage/1451/urn:cts:pdlpsci:bodin.livrep.perseus-lat1:1.1@quoniam[2]-ad[1]


Okay so "Text Annotations" has target and body tags.
They have an rdf:resource attribute which stores URNs which store passages of text.
Following those URLs returns plain text.  
But how are these linked to "Passage Text"?
Okay so @firstword[occurence]-lastword[occurence]
I'm assuming in firstword[occurence] occurence is relative to the entire text but is lastword[occurence] relative to the entire text or to firstword?

