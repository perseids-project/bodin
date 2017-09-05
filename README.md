# bodin
bodin is a jQuery plugin used to visually compare related texts.
It's named after Jean Bodin, the French political philosopher, whose translated works are the mother of this invention.

# Features
* Supports TEI CTS texts.
* Multicolumnar display of texts.  The only limit to number of texts displayed is memory and monitor resolution.
* Easy navigation of aligned text.
* Builds index to easily find chapters.

# Prerequisites
 * [CapiTainS-compliant TEI XML](http://capitains.org/pages/guidelines) for the primary source texts and translations
 * Annotations serialized in RDF/XML according to the [Open Annotation Community Draft  08 February 2013](http://www.openannotation.org/spec/core/)
 * A single type of annotation __target__ resource is supported: target resource URLs should include a CTS URN which identifies a passage and word or range of words from the primary source text or translation (e.g. urn:cts:pdlpsci:bodin.livrep.perseus-fre1:1.1@REPUBLIQUE[1]-mesnages[1]) 
 * Three types of annotation __body__ resources are supported:
     * Annotations which are identifying aligned passages 
         * These should use the custom motivation oa:linking_translation and the resource should be a URL which includes a CTS URN which identifies a passage and word or range of words from the primary source text or translation (e.g. urn:cts:pdlpsci:bodin.livrep.perseus-fre1:1.1@REPUBLIQUE[1]-mesnages[1])
     * Annotations which are identifying external resources.
	 * These should use the the oa:linking motivation and the resource should be identified by URL 
     * Commentary annotations
         * These should use the oa:commenting motivation and the commentary should be included as an inline ContentAsText body resource
 * Annotation should be aggregated into files according to target, motivation and resource
     * e.g. all alignment annotations targeting source A with bodies which are aligned passages from source B should be in a single file
     * all commentary annotations for Source A shoudl be in a separate file
     * all external URL annotations for Source A shoudl be in a separate file
 
# Use
Add the required Javascript and CSS files.

	<link href="Bodin.css" rel="stylesheet" type="text/css" />
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="Bodin.js"></script>

See *examples/bodin* for more info.

## Turn CapiTainS-compliant text and Perseids alignment XML into Bodin HTML
### Grab the publication XML from the appropriate Board.
	http://sosol.perseids.org/sosol/user/board_dashboard?board_id=7
	http://sosol.perseids.org/sosol/publications/1396

### Download the publication as a zip archive.
	http://sosol.perseids.org/sosol/publications/download/1396

### Tokenize the XML
To tokenize the XML you must move it to a publicly accessible webserver.

	scp ~/Desktop/french.xml name@server.org:/var/www/french.xml

Run the XML through the LLT tokenizer.

	http://sosol.perseids.org/exist/rest/db/xq/tokenize.xquery?merging=false&splitting=false&uri=http%3A%2F%2Fserver.org%french.xml

Save the tokenized XML somewhere handy.

	examples/bodin/tempXml/bodin_fre.tok.xml

### Convert the tokenized XML to HTML
Open oXygen.
If you don't have oXygen get it here http://www.oxygenxml.com/
Contact someone in the know for one of our licenses.
Set the source XML to the newly tokenized XML.
Set the XSLT code to Bodin's cts_annotate_saxon.xsl

	XML 	examples/bodin/tempXml/bodin_fre.tok.xml
	XSLT 	examples/xslt/cts_annotate_saxon.xsl

Save the HTML output.

	examples/bodin/tempHtml/french.html
