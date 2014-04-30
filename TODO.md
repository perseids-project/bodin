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
My explanation of the situation used pseudo-xml.  We can do something similar with real HTML.  Alignment tags could be spans <span> and anchors <a>, and the appropriate CSS and Javascript could make them functionally identical.  This works for a hanging overlap with 2 passages, but will this work for N passages?  I haven't thought that through all the way.