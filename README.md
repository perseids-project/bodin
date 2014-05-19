# bodin
bodin is a jQuery plugin used to visually compare related texts.
It's named after Jean Bodin, the French political philosopher, whose translated works are the mother of this invention.

# Features
* Supports TEI CTS texts.
* Multicolumnar display of texts.  The only limit to number of texts displayed is memory and monitor resolution.
* Easy navigation of aligned text.
* Builds index to easily find chapters.

# Use
Add the required Javascript and CSS files.

	<link href="Bodin.css" rel="stylesheet" type="text/css" />
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="Bodin.js"></script>

See *examples/bodin* for more info.

## Turn Perseids text and alignment XML into Bodin HTML
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