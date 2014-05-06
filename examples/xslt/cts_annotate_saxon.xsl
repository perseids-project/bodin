<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0">
    
    <xsl:include href="cts_annotate.xsl"/>
    <xsl:include href="make_cite.xsl"/>
    
    <xsl:param name="e_schemes">
        <scheme>
            <tei:div cite_att='n' cite_xpath='^.*text\[1\]/body\[1\]/div\[[\d]+\]/div\[[\d]+\]$'/>
            <tei:div cite_att='n' cite_xpath='^.*text\[1\]/body\[1\]/div\[[\d]+\]/div\[[\d]+\]/div\[[\d]+\]$'/>                        
        </scheme>
    </xsl:param>
    
    <!-- add cts subref values to w tokens -->
    <xsl:template match="tei:w|w">
        <xsl:variable name="thistext" select="text()"/>
        <xsl:element name="span">
            <xsl:attribute name="data-cite">
                <xsl:choose>
                    <!-- if we were given a citation then just apply it to all the words -->
                    <xsl:when test="$e_cite"><xsl:value-of select="$e_cite"/></xsl:when>
                    <!-- if we were given a citation scheme, then calculate it for each word -->
                    <xsl:when test="$e_schemes">
                        <xsl:call-template name="make_cite">
                            <xsl:with-param name="a_node" select="."></xsl:with-param>
                            <xsl:with-param name="a_schemes" select="$e_schemes/*"></xsl:with-param>
                            <xsl:with-param name="a_parts" select="()"></xsl:with-param>
                        </xsl:call-template>
                    </xsl:when>
                    <!-- otherwise we can't provide it -->
                    <xsl:otherwise></xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:choose>
                <!-- limit this to chapter 1 for now  need a better performing algorithm going forward -->
                <xsl:when test="ancestor::tei:div[@subtype='chapter' and @n='1' and ancestor::tei:div[@subtype='book' and @n='1']] and not(ancestor::tei:note) and not(ancestor::tei:head) and not(ancestor::tei:speaker)">
                    <!--ancestor::*[matches(saxon:path(),concat('/TEI/text\[[\d]+\]/body\[[\d]+\]/div\[[\d]+\]/div\[[\d]+\]/div\[', $n ,'\]'))] and-->
                    <xsl:variable name="subref"    
                        select="count(preceding::tei:w[
                        text() = $thistext])+1"></xsl:variable>
                    <xsl:attribute name="data-ref"><xsl:value-of select="concat($thistext,'[',$subref,']')"/></xsl:attribute>
                </xsl:when>
            </xsl:choose>
            <xsl:attribute name="class">token text</xsl:attribute>                    
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates select="node()"/>
        </xsl:element>
        <!-- add spaces back -->
        <xsl:if test="local-name(following-sibling::*[1]) = 'w' or 
            following-sibling::*[1][local-name(.) = 'choice' and descendant::tei:w] or
            ancestor::tei:choice[following-sibling::*[1][descendant::tei:w] or local-name(following-sibling::*[1]) = 'w']">
            <xsl:text> </xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="tei:TEI|TEI">
        <xsl:variable name="urn">
            <xsl:choose>
                <xsl:when test="(tei:div|div)[(@type='edition' or @type='translation') and contains(@n,'urn:cts:.*;')]">
                    <xsl:value-of select="(tei:div|div)[(@type='edition' or @type='translation')]/@n"/>
                </xsl:when>
                <xsl:when test="(tei:text|text)[contains(@n,'urn:cts')]">
                    <xsl:value-of select="(tei:text|text)/@n"/>
                </xsl:when>
                <xsl:otherwise></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:element name="div">
            <xsl:attribute name="class">work</xsl:attribute>
            <xsl:if test="$urn != ''">
                <xsl:attribute name="id"><xsl:value-of select="$urn"/></xsl:attribute>
            </xsl:if>
            <xsl:apply-templates select="@*[not(local-name(.) = 'id')]|node()"/>
        </xsl:element>
    </xsl:template>
</xsl:stylesheet>