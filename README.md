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
 * Example files loaded by this demo can be found in https://github.com/perseids-project/bodin/tree/master/examples/bodin/tempXml
     * new files with individual annotations can be created in the Perseids environment using the Annotation Editor linked from the CapiTainS Nemo interface at https://cts.perseids.org/. These files can be downloaded from Perseids and aggregated as described above.
         * e.g. to create a new annotation on Book 1 Chapter 1 of the French Edition:
	     * at https://cts.perseids.org/read/pdlpsci/bodin/livrep/perseus-fre1/1.1 , click 'Annotate in Perseids' (http://sosol.perseids.org/sosol/cite_publications/create_from_linked_urn/Oa/urn:cite:perseus:pdlann?init_value[]=urn:cts:pdlpsci:bodin.livrep.perseus-fre1:1.1)
	     * Edit to enter the Annotation Editor and select target and body passages	     
 
# Transform CapiTainS-compliant text into tokenized HTML with CTS passages identified per token

The Bodin application expects the CapiTainS TEI XML for the aligned texts to be transformed into tokenized HTML in which each token which might be included in the target or body of an annotation is wrapped in a `span` element with the classes `token text` and the parent passage reference supplied in a `data-cite` attribute. E.g.

    ```
        <span data-cite="1.2" class="token text">vn</span> 
    ```

## Process used for Perseids 

### Step 1: Tokenize the TEI XML
Use the Perseids llt tokenizer at http://services.perseids.org/llt/tokenize to tokenize the TEI XML. The LLT tokenizer can retrieve XML from a remote URL to tokenize, so if you can deploy your XML to a publicly accessible webserver, that is one way to parse the text.

E.g.

    ```
	curl -o bodin_fre.tok.xml "http://services.perseids.org/llt/tokenize?merging=false&splitting=false&uri=http%3A%2F%2Fexample.org%2Ffrench.xml"

    ```

### Step 2: Convert the tokenized XML to HTML
Use oXygen to run the cts_annotate_saxon transformation on the tokenized XML to create HTML with CTS passages identified per token.

e.g.
```
<w n="1">REPVBLIQVE</w> 
```

Gets transformed to:

```		
<span data-cite="1.1" data-ref="REPVBLIQVE[1]" class="token text">REPVBLIQVE</span> 
```

Where the CTS passage identifier is populated in the `data-cite` attribute and the CTS subreference identifier is populated in the `data-ref` attribute.

XSLT driver: [cts_annotate_saxon.xsl](https://github.com/perseids-project/bodin/blob/master/examples/xslt/cts_annotate_saxon.xsl)

Source XML: tokenized XML

The resulting HTML will be what you load into the view.

# Prepare the index.html

The [index.html](https://github.com/perseids-project/bodin/blob/master/index.html) provides an example driver for the Bodin interface.

The HTML files produced by transforming the TEI XML should be specified in `div` elements with the class attribute `bodin':

```
<div class="bodin" src="examples/bodin/tempHtml/latin.html" id="latin"></div>
<div class="bodin" src="examples/bodin/tempHtml/english.html" id="english"></div>
<div class="bodin" src="examples/bodin/tempHtml/french.html" id="french"></div>
```

The aggregated annotation RDF/XML files should be loaded in the `Bodin-LOADED` event handler:

```
jQuery( window ).on( 'Bodin-LOADED', function() {
				bodinAlign.start([
					{ 
						src: 'examples/bodin/tempXml/eng_lat_alignment.xml', 
						ids: { body: 'english', target: 'latin' }
					},
					{ 
						src: 'examples/bodin/tempXml/eng_fre_alignment.xml', 
						ids: { body: 'english', target: 'french' }
					},
					{ 
						src: 'examples/bodin/tempXml/commentary.xml', 
						ids: { body: 'french', target: 'english' }
					}
				]);
			});
```
