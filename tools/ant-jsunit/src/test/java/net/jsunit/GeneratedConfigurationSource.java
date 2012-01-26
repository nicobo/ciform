package net.jsunit;





/**
 * This configuration redefines {@link #url()} to point to a custom file
 * and gathers automatically some more properties.
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class GeneratedConfigurationSource //extends DelegatingConfigurationSource
{
	//	//
	//	// CONSTANTS
	//	//
	//
	//	/**
	//	 * Property name defining the Javascript files to include in the test suite
	//	 * page.
	//	 */
	//	public static final String PROP_JAVASCRIPTS = "jsunit.in.javascripts";
	//
	//	/**
	//	 * Associates a type of script to the corresponding property where their
	//	 * name is stored.
	//	 */
	//	public static final String[][] TYPE_PROP = { { JsUnitTestTask.TYPE_JAVASCRIPT, PROP_JAVASCRIPTS } };
	//
	//	//
	//	// PRIVATE FIELDS
	//	//
	//
	//	/** The generated test suite page */
	//	private File testSuitePage = null;
	//	private String project;
	//	private String coreJs;
	//	private String testRunner;
	//	private Map includes;
	//
	//
	//
	//	//
	//	// INITIALISATION
	//	//
	//
	//	public GeneratedConfigurationSource( /*ConfigurationSource source,*/
	//	String project, String coreJs, String testRunner )
	//	        throws URISyntaxException
	//	{
	//		//super( source );
	//
	//		// Checks for required parameters
	//		if ( System.getProperty( PROP_JAVASCRIPTS ) == null )
	//		{
	//			throw new IllegalArgumentException( "Missing required property "
	//			        + PROP_JAVASCRIPTS );
	//		}
	//
	//		setProject( project );
	//		setCoreJs( coreJs );
	//		setTestRunner( testRunner );
	//
	//		// Gathers all parameters
	//		// TODO Allow generic URI to be included in the generated file
	//		Map includes = new Hashtable();
	//		for ( int s = 0; s < TYPE_PROP.length; s++ )
	//		{
	//			String[] files = System.getProperty( TYPE_PROP[s][1] ).split( File.pathSeparator );
	//			// indexed on the property's type
	//			includes.put( TYPE_PROP[s][0], files );
	//		}
	//	}
	//
	//
	//
	//	public GeneratedConfigurationSource( /*ConfigurationSource source */)
	//	        throws URISyntaxException
	//	{
	//		this( /*Configuration.resolveSource(),*/"a JsUnit test suite", getRequiredURISystemProperty( PROP_COREJS ), getRequiredURISystemProperty( PROP_TESTRUNNER ) );
	//	}
	//
	//
	//
	//	//		public GeneratedConfigurationSource() throws URISyntaxException
	//	//		{
	//	//			this( Configuration.resolveSource() );
	//	//		}
	//
	//	//
	//	// ACCESSORS
	//	//
	//
	//	public File getTestSuitePage()
	//	{
	//		return testSuitePage;
	//	}
	//
	//
	//
	//	public void setTestSuitePage( File testSuitePage )
	//	{
	//		this.testSuitePage = testSuitePage;
	//	}
	//
	//
	//
	//	public String getProject()
	//	{
	//		return project;
	//	}
	//
	//
	//
	//	public void setProject( String project )
	//	{
	//		this.project = project;
	//	}
	//
	//
	//
	//	public String getCoreJs()
	//	{
	//		return coreJs;
	//	}
	//
	//
	//
	//	public void setCoreJs( String coreJs )
	//	{
	//		this.coreJs = coreJs;
	//	}
	//
	//
	//
	//	public String getTestRunner()
	//	{
	//		return testRunner;
	//	}
	//
	//
	//
	//	public void setTestRunner( String testRunner )
	//	{
	//		this.testRunner = testRunner;
	//	}
	//
	//
	//
	//	public Map getIncludes()
	//	{
	//		return includes;
	//	}
	//
	//
	//
	//	public void setIncludes( Map includes )
	//	{
	//		this.includes = includes;
	//	}
	//
	//
	//
	//	//
	//	// UTILITY METHODS
	//	//
	//
	//	/** The best effort to get a well formed URI */
	//	private static URI getURI( String text ) throws URISyntaxException
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
	//	 * @param key
	//	 *            the name of the property to retrieve
	//	 * @return A well formed URI based on the value of the given property
	//	 * @throws IllegalArgumentException
	//	 *             if the given property doesn't exist.
	//	 */
	//	private static String getRequiredURISystemProperty( String key )
	//	        throws URISyntaxException
	//	{
	//		String val = System.getProperty( key );
	//
	//		if ( val == null )
	//		{
	//			System.err.println( "Missing property : " + key );
	//			throw new IllegalArgumentException( "Missing property : " + key );
	//		}
	//
	//		return getURI( val ).toString();
	//	}
	//
	//
	//
	//	//
	//	// ConfigurationSource IMPLEMENTATION
	//	//
	//
	//	/**
	//	 * Before calling this method, make sure {@link #setTestSuitePage(File)} has been correctly set.
	//	 * @throws IllegalStateException if a property is missing or is incorrect
	//	 */
	//	public String makeUrl() throws URISyntaxException, IOException
	//	{
	//		//		try
	//		//		{
	//		// returns the full URL to use with JsUnit
	//		return getRequiredURISystemProperty( PROP_TESTRUNNER ) + "?testPage="
	//		        + getTestSuitePage().getCanonicalPath();
	//
	//		//		}
	//		//		// URISyntaxException, IOException
	//		//		catch ( Exception e )
	//		//		{
	//		//			e.printStackTrace( System.err );
	//		//			throw new IllegalStateException( e );
	//		//		}
	//	}

}
