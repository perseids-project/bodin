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

# 2014-04-10
I did some research and found the tei2html project on google code.
jhellingman@gmail is the person behind this.
Let's see what it includes shall we.

So here are some commands that will help me explore the possibilities afforded me by this treasure trove of XSLT sheets.

## extract-page.xsl 
	saxon examples/xml/passage.xml third_party/tei2html-read-only/extract-page.xsl
		Extracting page '-1' at position 0
		<?xml version="1.0" encoding="UTF-8"?>

Let's try the namesake ehhh?
## tei2html.xsl
	saxon examples/xml/passage.xml third_party/tei2html-read-only/tei2html.xsl

It doesn't look like there's going to be any silver bullets...
Maybe I need to be in a different directory.  I'm not sure how XSLT includes work... so let's try this.

	cd third_party/tei2html-read-only
	saxon ../../examples/xml/passage.xml tei2html.xsl

I dunno... I might abandon XSLT all together...  Client side XSLT seems to be falling out of favor...  Nobody is going to use my plug-in if it requires server side code.  Considering I've found inconsistencies in XSLT parsers saxon and Chrome's even while doing rudimentary things has shaken my faith...
https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/zIg2KC7PyH0%5B1-25-false%5D

2 steps forward... 3 steps back.

## Forgetting XSLT

Back to Javascript.

#2014-04-14