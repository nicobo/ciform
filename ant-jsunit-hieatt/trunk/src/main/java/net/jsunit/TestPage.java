package net.jsunit;


import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.MissingResourceException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import net.jsunit.utility.SourcePathUtil;

import org.w3c.dom.DOMImplementation;
import org.w3c.dom.Document;
import org.w3c.dom.Element;



/**
 * <p>This utility class helps building JsUnit (HTML) test pages, provided a list of files to include.</p>
 * 
 * <p>TODO : allow the inclusion of distant files, not only local ones</p>
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class TestPage
{
	/**
	 * Key to use to include Javascript tags in the page.<br/>
	 * The corresponding value for this key in the {@link Map} must be a {@link Collection}&lt;{@link URI}&gt; containing
	 * all the <tt>src</tt> attributes of the corresponding &lt;script/&gt; tags.
	 * @see #setIncludes(Map)
	 */
	public static final String INCLUDE_JAVASCRIPT = "text/javascript";

	//
	// PRIVATE PROPERTIES AND INITIALISATION
	//

	private static final String TEMPLATE_FILENAME = "TestPageTemplate.html";
	private static final String TEMPLATE_TAG_PROJECT = "@project@";
	private static final String TEMPLATE_TAG_JSUNITCORE = "@jsUnitCore.js@";
	private static final String TEMPLATE_TAG_INCLUDES = "@includes@";

	private String project;
	private String jsUnitCore;
	private Map includes;



	/**
	 * @param project		The name of the project (used as a title in the page)
	 * @param JsUnitCore	The <tt>src</tt> value of a &lt;script/&gt; tag to include JsUnit's core Javascript library
	 * @param includes		A map of all the external resources to include in the page, indexed on their type.
	 * 						Use the <tt>INCLUDE_*</tt> constants as keys (types).
	 * @throws IOException
	 * @throws URISyntaxException
	 */
	public TestPage( String project, String JsUnitCore, Map includes )
	        throws IOException, URISyntaxException
	{
		setProject( project );
		setJsUnitCore( JsUnitCore );
		setIncludes( includes );
	}



	//
	// ACCESSORS
	//

	public String getProject()
	{
		return project;
	}



	public void setProject( String project )
	{
		this.project = project;
	}



	public String getJsUnitCore()
	{
		return jsUnitCore;
	}



	public void setJsUnitCore( String jsUnitCore )
	{
		this.jsUnitCore = jsUnitCore;
	}



	public Map getIncludes()
	{
		return includes;
	}



	public void setIncludes( Map includes )
	{
		this.includes = includes;
	}



	//
	// UTILITY METHODS
	//

	/**
	 * This method is to make sure we only include well-formed elements in the HTML page (since
	 * the resources to include are coming from outside, we cannot say if they're correctly formated or not).
	 * @see http://www.javazoom.net/services/newsletter/xmlgeneration.html
	 */
	private static String buildJavascriptTag( String src )
	        throws URISyntaxException, UnsupportedOperationException
	{
		try
		{
			DocumentBuilderFactory domFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder domBuilder = domFactory.newDocumentBuilder();
			DOMImplementation dom = domBuilder.getDOMImplementation();
			Document xmlDoc = dom.createDocument( null, null, null );
			Element tag = xmlDoc.createElement( "script" );
			tag.setAttribute( "type", "text/javascript" );
			tag.setAttribute( "src", SourcePathUtil.normalizePath( src ).toASCIIString() );

			TransformerFactory tf = TransformerFactory.newInstance();
			Transformer serializer = tf.newTransformer();
			serializer.setOutputProperty( OutputKeys.OMIT_XML_DECLARATION, "yes" );
			serializer.setOutputProperty( OutputKeys.ENCODING, "UTF-8" );
			StringWriter sw = new StringWriter();
			serializer.transform( new DOMSource( tag ), new StreamResult( sw ) );

			return sw.toString();
		}
		catch ( ParserConfigurationException pce )
		{
			throw new UnsupportedOperationException( pce );
		}
		catch ( TransformerConfigurationException tce )
		{
			throw new UnsupportedOperationException( tce );
		}
		catch ( TransformerException te )
		{
			throw new UnsupportedOperationException( te );
		}
	}



	/**
	 * <p>Builds complete JsUnit test suite page from the current environment.</p>
	 * 
	 * <p>Make sure all required properties are set and have a correct value before calling this method (see the arguments in {@link #TestPage(String, String, Map)}).</p>
	 * 
	 * @return The content of the generated test page
	 */
	public String asString() throws URISyntaxException
	{
		// Reads the template of the test suite page to generate into a local buffer
		InputStream is = getClass().getResourceAsStream( TEMPLATE_FILENAME );
		StringBuffer buffer = new StringBuffer();
		try
		{
			for ( int c = is.read(); c > -1; c = is.read() )
			{
				buffer.append( (char) c );
			}
			is.close();
		}
		catch ( IOException ioe )
		{
			throw new MissingResourceException( "Loading the template file", getClass().getName(), TEMPLATE_FILENAME );
		}

		// Replaces the variable parts of the template
		String out = buffer.toString();

		// Project name
		out = out.replaceAll( TEMPLATE_TAG_PROJECT, project );

		// JsUnit's core library
		out = out.replace( TEMPLATE_TAG_JSUNITCORE, getJsUnitCore() );

		// Other includes : currently only Javascript is supported
		StringBuffer includesBuffer = new StringBuffer();

		Collection javascripts = (Collection) getIncludes().get( INCLUDE_JAVASCRIPT );
		for ( Iterator itj = javascripts.iterator(); itj.hasNext(); )
		{
			URI javascript = (URI) itj.next();
			includesBuffer.append( buildJavascriptTag( javascript.toASCIIString() ) );
		}

		out = out.replace( TEMPLATE_TAG_INCLUDES, includesBuffer.toString() );

		return out;
	}



	/**
	 * <p>Writes this page to a file.</p>
	 * 
	 * @param file The file to write this page to.
	 * @return the file (so one can chain operations on it)
	 * @throws IOException If an open/write/close operation failed on the given file
	 */
	public File writeTo( File file ) throws IOException, URISyntaxException
	{
		FileWriter fw = new FileWriter( file );
		fw.write( asString() );
		fw.close();
		return file;
	}



	/**
	 * <p>Writes this page to a file.</p>
	 * 
	 * @param filename If null, writes to a temporary file
	 * @return	the File to which the data was written
	 * @throws IOException In case the temporary file failed to be created
	 * @see #writeTo(File)
	 */
	public File writeToFile( String filename ) throws IOException,
	        URISyntaxException
	{
		File file = filename != null ? new File( filename ) : File.createTempFile( "tmp-jsunit-", ".html" );
		return writeTo( file );
	}



	public File writeToFile() throws IOException, URISyntaxException
	{
		return writeToFile( null );
	}

}
