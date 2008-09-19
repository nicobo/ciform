package net.jsunit;


import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.MissingResourceException;



/**
 * This utility class helps building JsUnit (HTML) test pages, giving a list of files to include.
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class TestPage
{
	/**
	 * Key to use to include Javascript tags in the page.<br/>
	 * The corresponding value for this key in the {@link Map} must be a {@link Collection}&lt;String&gt; containing
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
	 * <p>Builds complete JsUnit test suite page from the current environment.</p>
	 * 
	 * <p>Make sure all required properties are set and have a correct value before calling this method (see the arguments in {@link #TestPage(String, String, Map)}).</p>
	 * 
	 * @return The content of the generated test page
	 */
	public String asString()
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
		Collection javascripts = (Collection) includes.get( INCLUDE_JAVASCRIPT );
		for ( Iterator itj = javascripts.iterator(); itj.hasNext(); )
		{
			URI javascript = (URI) itj.next();
			includesBuffer.append( "<script type=\"text/javascript\" src=\"" );
			includesBuffer.append( javascript/*new File( javascripts[i] ).toURI()*/);
			includesBuffer.append( "\"></script>\n" );
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
	public File writeTo( File file ) throws IOException
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
	public File writeToFile( String filename ) throws IOException
	{
		File file = filename != null ? new File( filename ) : File.createTempFile( "jsunit-", ".tmp" );
		return writeTo( file );
	}



	public File writeToFile() throws IOException
	{
		return writeToFile( null );
	}

	//	/** The best effort to get a well formed URI */
	//	private static URI asURI( String text ) throws URISyntaxException
	//	{
	//		try
	//		{
	//			return new URL( text ).toURI();
	//		}
	//		catch ( MalformedURLException murle )
	//		{
	//			return new File( text ).toURI();
	//		}
	//	}
	//
	//
	//
	//	/**
	//	 * <p>Builds the URL to pass to {@link Configuration#setTestURL(URL)}</p>
	//	 * 
	//	 * @throws IllegalStateException if a property is missing or is incorrect
	//	 */
	//	private String asURL( String testRunner, File testPage )
	//	        throws URISyntaxException, IOException
	//	{
	//		URI uri = asURI( testRunner );
	//		return new URI( uri.getScheme(), uri.getUserInfo(), uri.getHost(), uri.getPort(), uri.getPath(), "testPage="
	//		        + testPage.getPath(), uri.getFragment() ).toString();
	//	}

}
