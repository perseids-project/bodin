<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0">
    
    <!-- adds a CTS citation reference to a node -->
    
    <xsl:template name="make_cite">
        <xsl:param name="a_node"/>
        <xsl:param name="a_parts"/>
        <xsl:param name="a_schemes"/>
        <xsl:variable name="cite_attribute">
            <xsl:for-each select="$a_schemes/*">
                <xsl:variable name="cite_elem" select="."></xsl:variable>
                <xsl:if test="matches($a_node/saxon:path(),$cite_elem/@cite_xpath)" 
                    xmlns:saxon="http://saxon.sf.net/">
                    <xsl:value-of select="$a_node/@*[local-name(.) = $cite_elem/@cite_att]"/>
                </xsl:if>
            </xsl:for-each>    
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$cite_attribute != ''">
                <xsl:choose>
                    <!-- stop when we have enough parts or we've hit the tei:body element -->
                    <xsl:when test="count(($a_parts,$cite_attribute)) = count($a_schemes/*) or
                        name(.) = xs:string(QName('http://www.tei-c.org/ns/1.0','body')) or
                        not($a_node[parent::*])">
                        <xsl:if test="count(($a_parts,$cite_attribute))> 0">
                            <xsl:value-of select="string-join(reverse(($a_parts,$cite_attribute)),'.')"/>
                        </xsl:if>
                    </xsl:when>
                    <xsl:otherwise>     
                        <xsl:call-template name="make_cite">
                            <xsl:with-param name="a_node" select="$a_node/parent::*"></xsl:with-param>
                            <xsl:with-param name="a_parts" select="($a_parts,$cite_attribute)"></xsl:with-param>
                            <xsl:with-param name="a_schemes" select="$a_schemes"></xsl:with-param>
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:when test="not($a_node[parent::*])">
                <xsl:value-of select="string-join(reverse(($a_parts)),'.')"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="make_cite">
                    <xsl:with-param name="a_node" select="$a_node/parent::*"></xsl:with-param>
                    <xsl:with-param name="a_parts" select="$a_parts"></xsl:with-param>
                    <xsl:with-param name="a_schemes" select="$a_schemes"></xsl:with-param>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
</xsl:stylesheet>