## Alignment
Translation alignment is not accurate.
Translation alignments may be best done with an exisitng service outside this plugin.
See BodinAlign._mark().

## TEI to Bodin HTML
TEI needs to be transformed to Bodin HTML.
See TeoToBodin.js

Right now sample HTML files are being pulled in whole,
NOT transformed TEI XML

The tricky parts are splitting at milestones and pages.

Here's the basic HTML hierarchy.

	work > edition > book > chapter > page > milestone

Tooltip note pop-ups look like this.

	<a href="" title="The definition of a Commonweale." class="note" rel="tooltip">1</a>

Translation alignment passages are wrapped in spans like this one.

	<span id="align-2" class="align">for that in all arts and actions</span>

Aligned passages must have the same id attribute.

Here's a sampling.

	<div class="work">
		<div id="edition-1" class="edition">
			<div id="book-1" class="book">
				<div id="chapter-1" class="chapter">
					<div id="page-1" class="page">
						<h1>CHAP. I</h1>
						<h2>What the principall end is of a well ordered Commonweale.</h2>
					
						<p><a href="" class="milestone" id="stone-1">A</a>A Commonweale is a lawfull gouernment of many
						families,<a href="" title="The definition of a Commonweale." class="note" rel="tooltip">1</a> and of
						that which vnto them in common belongeth, w<span id="align-3" class="align" style="background-color:rgba(0,255,255,0.15)">ith a puissant soueraigntie</span>. This
						definition omitted by them which haue written of a Commonweale, wee haue placed
						in the first place: </p>
					
						<p><a href="" class="milestone" id="stone-2">B</a><span id="align-2" class="align" style="background-color:rgba(255,255,0,0.15)">for that in all arts
						and actions</span>, it behoueth vs first to behold the end, and afterward the meanes
						to attaine therunto. <span id="align-4" class="align" style="background-color:rgba(255,0,255,0.15)">For a definition is nothing else than the very end and
						scope of the matter propounded, which if it be not well and surely grounded,
						whatsoeuer you build <span id="align-10" class="align" style="background-color:rgba(255,0,255,0.15)">thereupon must together and in a moment fall. And yet
						oftentimes it falleth out with many, that hauing propounded vnto themselues
						certaine ends, yet can they not attaine vnto the end by them desired; no more
						than the vnskilfull archer who shooteth farre and wide from the marke he aimed
						at, whereas he which shooteth markeman like, although he misse somewhat the
						marke, yet shall he shoot neerer than he, neither shall</span></span></p>
					 
						<p><a href="" class="milestone" id="stone-3">C</a>he want the commendation of a good archer, hauing performed
						what a skilfull archer should haue done. <span id="align-5" class="align" style="background-color:rgba(255,255,0,0.15)">But he which knoweth not the end of
						the matter he hath in hand, is as farre from the hope of attaining thereunto,
						as he is from hitting the marke, which shooteth at randon, not knowing whereat.
						Wherefore let vs well examine the end, and euery part of the definition by vs
						before propounded. First we said that a Commonweale ought to be a lawfull or
						rightfull gouernment: for that the name of a Commonweale is holy</span>, as also to
						put a difference betwixt the same, and the great assemblies of robbers and
						pirats, with whome we ought not to haue any part, commercement, societie, or
						alliance, but vtter enmitie. <span id="align-7" class="align" style="background-color:rgba(255,0,255,0.15)">And therefore in all wise and well ordered
						Commonweales,
						<a href="" title="That a common weale ought to be a lawfull gouernment." class="note" rel="tooltip">2</a> whether question be of the publike faith for the more
						safetie to bee giuen;</span></p>
					 
						<p><a href="" class="milestone" id="stone-4">D</a>of leagues offensiue or
						defensiue to bee made; of warre to bee denounced, or vndertaken, either for the
						defending of the frontiers of the kingdom, or for the composing of the
						controuersies and differences of Princes amongst themselues; robbers and pirats
						are still excluded from all the benefit of the law of Armes. For why? <span id="align-8" class="align" style="background-color:rgba(255,255,0,0.15)">Princes
						which gouerne their States by their owne lawes, and the lawes of nations, haue
						alwayes diuided their iust and lawfull enemies, from these disordered, which
						seeke for nothing but the vtter ruine and subuertion of Commonweales, and of
						all ciuill societie. <span id="align-9" class="align" style="background-color:rgba(0,255,255,0.15)">For which cause, if ransome promised vnto robbers</span> for a
						mans redemption, bee not vnto them </span></p>
					 </div>

## Problems inherent with text alignment and HTML

So there is an obvious problem with using *one* tag to wrap *all* aligned text.
Can you guess what it is?

Overlap...  Not all kinds of overlap mind you but a particular variety.  Let's look at a passage.

	<span id="align-4" class="align">A definition is nothing else than the very end and
	scope of the matter propounded, which if it be not well and surely grounded,
	whatsoeuer you build <span id="align-10" class="align">thereupon must together and in a moment fall.</span> And yet
	oftentimes it falleth out with many, that hauing propounded vnto themselues
	certaine ends, yet can they not attaine vnto the end by them desired; no more
	than the vnskilfull archer who shooteth farre and wide from the marke he aimed
	at, whereas he which shooteth markeman like, although he misse somewhat the
	marke, yet shall he shoot neerer than he, neither shall</span>

So there are two spans wrapping all the text in this passage.  Things are fine if one alignment passage is contained completely within another: &lt;1&gt;&lt;2&gt;&lt;/2&gt;&lt;/1&gt;  *thereupon-fall* is inside *A-shall* ( a nested overlap ), but what if the two passages were *thereupon-shall* and *A-fall* &lt;1&gt;&lt;2&gt;&lt;/1&gt;&lt;/2&gt;, ( a hanging overlap )

### Proposed solutions.
My explanation of the situation used pseudo-xml.  We can do something similar with real HTML.  Alignment tags could be spans &lt;span&gt; and anchors &lt;a&gt;, and the appropriate CSS and Javascript could make them functionally identical.  This works for a hanging overlap with 2 passages, but will this work for N passages?  I haven't thought that through all the way.

## BMA Feedback 2014-05-01

### Alignments
I think we need to turn the alignment problem inside out a bit.

First, I think the only solution to the problem of overlapping hierarchies is to
higlight the tokens themselves and not try to use wrapping spans. This is also
more consistent with the annotations themselves, which are at the level of the 
token.

Second, it has been my assumption that the dissemination process eventually will
be responsible for applying annotations to the source texts as appropriate for
the given display type being disseminated. For very simple annotations and 
displays, this might not always be necessary, but for a complex UI like we are
trying to do for Bodin, which applies overlapping alignments of various types 
across multiple texts, on a very large text, I don't think we will be able to 
get the performance we need by doing it client-side at runtime.  It also would 
require the display UI to know details about the citation scheme, tokenization 
algorithms, etc. as these are all needed in order to correctly apply the 
annotations. (Eventually the annotations also need to carry provenance 
information to make this information available to consumers).

So, that said, here's what I've done so far:

#### Dissemination Steps

(Manual for now, but eventually should be automated through a workflow service)

1. tokenized the XML using the same perseids tokenization services and configuration options that were used to prepare the texts for annotations. Prior to running through the tokenization service, I stripped the teiHeaders and deployed the stripped XML on perseids.org for access by URI. 
    * `http://sosol.perseids.org/exist/rest/db/xq/tokenize.xquery?merging=false&splitting=false&uri=http%3A%2F%2Fperseids.org%2Fbodin_english.xml`
    * `http://services.perseids.org/llt/tokenize?xml=true&merging=false&splitting=false&uri=http%3A%2F%2Fperseids.org%2Fbodin_latin.xml`
2. The tokenized output is in the `bodin_lat.tok.xml` and `bodin_eng.tok.xml` in the tempXml folder. (note that I also removed all except chaps 1 and 2 for now for performance reasons -- pulling in the entire text killed the browser).
3. Ran the `cts_annotate.xsl` (including modifications for bodin display expectations) 
to 
    1. transform the XML to HTML 
    2. apply subreference identifiers matching the ctsurn subreference syntax to the tokens. This produced HTML markup for the word tokens that looks like:

    `<span class="token text" data-ref="word[1]">word</span> <span class="token text" data-ref="another[1]>another</span><span class="token punc">.</span>`

#### UI Changes

1. the BodinAlign._mark method no longer tries to calculate the position of the words to highlight.
Instead it :
    * looks for elements with class 'token' that have a data-ref attribute matching the start and end
      of the alignment range
    * tries to find all intermediate token elements in the range
        * but note that this isn't perfect still because it relies on siblings not being disrupted
          by intervening markup. This is a problem in the annotation interface too and I need to find
          a way to deal with it.
    * applies styling to the token span
    * uses an attribute to identify the number of overlapping alignments a word has
    * inserts wrapping spans for each distinct alignment


2. We can no longer use ids to identify distinct alignments as there are many words with the same id, so I added new filteredGoTo and filteredAlphaBlink methods to BodinUI that look for elements with specified key/value pairs, as filtered by a class.

    *. For the moment I have made the click only active on the start and end elements of a range. What should probably happen though is that it is active on all the aligned words but looks for the start element for that alignment.

    * it might also be nice to make it possible to select which overlapping alignment you want to view when a word has multiple

### Pages and Milestones

Because pages and milestones are not part of the citation scheme, we cannot have them as wrapping elements in the display. Also, since milestones can repeat in a text (in the case of Bodin they are only unique within page breaks) we can't use ids identify and trigger behavior on them.  

I made a few changes to accomodate this, but haven't fully got the milestones working again as you had them before. In the end, since we didn't actually align on the milestones, I'm not sure we even want to have clicking on a milestone trigger navigation across displays, because I don't know if it will be accurate. This might be something we should check with Yannis.

### Additional Notes:

* the algorithms for applying the cts subreferences to the tokens needs a little work still. It needs
to be able to peform well against an entire text and to apply the citation scheme to know where to restart numbering. The algorithm I have currently will fall down on the entire Bodin text.

* Ultimately I think we will want some general ways to identify things about the citation scheme and markup that trigger certain functionality in the various UIs we support - but this is also part of a larger Perseus 5 discussion. 

* I think I might have broken your index and options navigations. Haven't looked into why yet -- could just be a style thing caused by changes in the markup.

* There is still more work I need to do on the cts_annotate.xslt transformation -- it ignores tags it doesn't know about for now, but should really try to do something with them, particularly if they are display related (like the hi@rend=italics tags).  This is related to the problem of finding siblings of the start/end elements because adding extra span tags around tokens for things like this break the sibling order. Probably I should check for and handle these when processing the w tags.


