<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
xpath-default-namespace="http://www.tei-c.org/ns/1.0">

<xsl:preserve-space elements="*"/>
<xsl:output method="html" encoding="utf-8"/>

<!-- Work ID -->
<xsl:variable name="wID">YEAH</xsl:variable>

<xsl:template match="/">
		<xsl:for-each select="TEI/text/body">
			<!-- Work -->
			<div id="{$wID}" class="work">
				<xsl:for-each select="div[@type='edition']">
					<!-- Edition -->
					<div class="edition">
						<!-- Book -->
						<xsl:for-each select="div[@subtype='book']">
							<xsl:variable name="bID"><xsl:value-of select="@n" /></xsl:variable>
							<div id="book-{$bID}" class="book">
								<!-- Chapter -->
								<xsl:for-each select="div[@subtype='chapter']">
									<xsl:variable name="pID">1</xsl:variable>
									<xsl:variable name="cID"><xsl:value-of select="@n" /></xsl:variable>
									<div id="book-{$bID}_chapter-{$cID}" class="chapter">
										<!-- Chapter Heading -->
										<div class="page">
											<h1><xsl:value-of select="head/hi" /></h1>
											<h2><xsl:value-of select="head/hi" /></h2>
										</div>
									</div>
								</xsl:for-each>
							</div>
						</xsl:for-each>
					</div>
				</xsl:for-each>
			</div>
		</xsl:for-each>
</xsl:template>

</xsl:stylesheet>