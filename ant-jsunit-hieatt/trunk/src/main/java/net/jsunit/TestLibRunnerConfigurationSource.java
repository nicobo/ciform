package net.jsunit;


import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Arrays;
import java.util.Collection;
import java.util.Hashtable;
import java.util.Map;

import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ConfigurationProperty;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.configuration.DelegatingConfigurationSource;



/**
 * This configuration redefines {@link #url()} to point to a custom file
 * and gathers automatically some more properties.
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class TestLibRunnerConfigurationSource extends
        DelegatingConfigurationSource
{
	/** Name of the property pointing to the JsUnit core library's file */
	public static final String PROP_COREJS = "jsunit.coreJs";
	/** Name of the property pointing to the JsUnit's <tt>testRunner.html</tt> file */
	public static final String PROP_TESTRUNNER = "jsunit.testRunner";
	/** Property name defining the Javascript files to include in the test page (path-like). */
	public static final String PROP_JAVASCRIPTS = "jsunit.in.javascripts";
	/** Property name defining the name of the project to use as the title of the generated page */
	public static final String PROP_PROJECT = "jsunit.in.project";

	protected static final String PARAM_TESTPAGE = "testPage";

	private File testPage = null;



	public TestLibRunnerConfigurationSource( ConfigurationSource source )
	{
		super( source );
	}



	public TestLibRunnerConfigurationSource()
	{
		this( Configuration.resolveSource() );
	}



	//
	// UTILITY METHODS
	//

	/**
	 * If the test page is not set yet or does not exist, creates it.
	 */
	public File getTestPage() throws URISyntaxException, IOException
	{
		if ( testPage == null || !testPage.exists() )
		{
			testPage = buildTestPage().writeToFile(); // throw URI, IO
		}
		return testPage;
	}



	public void setTestPage( File testPage )
	{
		this.testPage = testPage;
	}



	public String getTestRunner() throws URISyntaxException, IOException
	{
		return getRequiredURISystemProperty( PROP_TESTRUNNER );
	}



	/** The best effort to get a well formed URI */
	protected static URI getURI( String text ) throws URISyntaxException
	{
		try
		{
			return new URL( text ).toURI();
		}
		catch ( MalformedURLException murle )
		{
			return new File( text ).toURI();
		}
	}



	/**
	 * @param key
	 *            the name of the property to retrieve
	 * @return A well formed URI based on the value of the given property
	 * @throws IllegalArgumentException
	 *             if the given property doesn't exist.
	 */
	protected static String getRequiredURISystemProperty( String key )
	        throws URISyntaxException
	{
		String val = System.getProperty( key );

		if ( val == null )
		{
			System.err.println( "Missing property : " + key );
			throw new IllegalArgumentException( "Missing property : " + key );
		}

		return getURI( val ).toString();
	}



	/**
	 * <p>Builds a new test page from the current System properties.</p>
	 * 
	 * <p>See <tt>PROP_*</tt> constants for the list of recognised properties.</p>
	 */
	protected static TestPage buildTestPage() throws URISyntaxException,
	        IOException
	{
		// a. Gathers parameters from the System
		String project = System.getProperty( PROP_PROJECT, "Unknown project" );
		String jsUnitCore = getRequiredURISystemProperty( PROP_COREJS );
		Collection javascripts = Arrays.asList( System.getProperty( PROP_JAVASCRIPTS, "" ).split( File.pathSeparator ) );
		Map includes = new Hashtable();
		includes.put( TestPage.INCLUDE_JAVASCRIPT, javascripts );

		// b. Builds the test page from the parameters
		return new TestPage( project, jsUnitCore, includes );
	}



	//
	// ConfigurationSource IMPLEMENTATION
	//

	/**
	 * <p>Builds the URL based so that it points to the generated test page.</p>
	 * 
	 * <p>Before calling this method, make sure {@link #setTestSuitePage(File)} has been correctly set.</p>
	 * 
	 * <p>NOTE : This is a bit weird because the test page's file is created in this method,
	 * but must be deleted by the unit test once done. This is because I had to hack into this class
	 * to reuse the maximum of existing code (in order to limit the risks of broken code with the future versions).</p>
	 * 
	 * @return The full URL to use with JsUnit (the existing property : {@value ConfigurationProperty#URL} is ignored)
	 * @throws IllegalArgumentException if a property is missing or is incorrect
	 * FIXME don't create the test page here
	 */
	public String url()
	{
		try
		{
			return getTestRunner() + "?" + PARAM_TESTPAGE + "="
			        + getTestPage().getCanonicalPath();
		}
		catch ( URISyntaxException urise )
		{
			urise.printStackTrace( System.err );
			throw new IllegalArgumentException( urise );
		}
		catch ( IOException ioe )
		{
			ioe.printStackTrace( System.err );
			throw new IllegalArgumentException( ioe );
		}
	}

}
