package net.jsunit.ant;


import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Collection;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Map;
import java.util.Vector;

import net.jsunit.StandaloneTest;
import net.jsunit.configuration.ConfigurationProperty;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.DirectoryScanner;
import org.apache.tools.ant.taskdefs.optional.junit.JUnitTask;
import org.apache.tools.ant.types.FileSet;



/**
 * This task permits convenient access to the {@link StandaloneTest}
 * unit test.
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class StandaloneTestTask extends JUnitTask
{
	/** Name of the property pointing to the root directory of the JsUnit installation */
	public static final String PROP_JSUNITROOT = "jsunit.dir";
	/** Name of the property pointing to the JsUnit core library's file */
	public static final String PROP_COREJS = "jsunit.coreJs";
	/** Name of the property pointing to the JsUnit's <tt>testRunner.html</tt> file */
	public static final String PROP_TESTRUNNER = "jsunit.testRunner";

	/** Inner {@link JsUnitTestTask} elements */
	private Collection scriptsList = new Vector();
	private boolean runTests = true;
	private boolean keepTestPage = false;
	private String jsUnitRoot;
	private String coreJs;
	private String testRunner;



	//
	// INITIALISATION
	//

	public StandaloneTestTask() throws Exception
	{
		super();
	}



	protected Collection getScriptsList()
	{
		return scriptsList;
	}



	protected void setScriptsList( Collection scriptsList )
	{
		this.scriptsList = scriptsList;
	}



	//
	// ANT Task IMPLEMENTATION
	//

	public void addConfiguredTest( JsUnitTestTask anInner )
	{
		// Simply saves the gathered inner elements
		getScriptsList().add( anInner );
	}



	public String getJsUnitRoot()
	{
		return jsUnitRoot;
	}



	public void setJsUnitRoot( String jsUnitRoot )
	{
		this.jsUnitRoot = jsUnitRoot;
	}



	public boolean isKeepTestPage()
	{
		return keepTestPage;
	}



	public void setKeepTestPage( boolean keepTestPage )
	{
		this.keepTestPage = keepTestPage;
	}



	public boolean isRunTests()
	{
		return runTests;
	}



	public void setRunTests( boolean runTests )
	{
		this.runTests = runTests;
	}



	public String getCoreJs()
	{
		return coreJs;
	}



	public void setCoreJs( String coreJs )
	{
		this.coreJs = coreJs;
	}



	public String getTestRunner()
	{
		return testRunner;
	}



	public void setTestRunner( String testRunner )
	{
		this.testRunner = testRunner;
	}



	public void execute()
	{
		// A list of the URI of the files to include mapped to their type as key
		Map scriptsFiles = new Hashtable();

		if ( getScriptsList() == null || getScriptsList().size() == 0 )
		{
			throw new IllegalArgumentException( "No <script/> element !" );
		}

		// Several elements of this type can be nested inside.
		for ( Iterator itl = getScriptsList().iterator(); itl.hasNext(); )
		{
			JsUnitTestTask files = (JsUnitTestTask) itl.next();
			// Adds the inner list for this type of script, indexed on the
			// type's name
			if ( !scriptsFiles.containsKey( files.getType() ) )
			{
				scriptsFiles.put( files.getType(), new Vector() );
			}
			// Scans and adds all given input files to their respective type's
			// list
			for ( Iterator itr = files.getFilesets().iterator(); itr.hasNext(); )
			{
				FileSet fs = (FileSet) itr.next();
				DirectoryScanner ds = fs.getDirectoryScanner();
				for ( int f = 0; f < ds.getIncludedFiles().length; f++ )
				{
					File file = new File( ds.getBasedir(), ds.getIncludedFiles()[f] );
					((Collection) scriptsFiles.get( files.getType() )).add( file.toURI() );
				}
			}
		}

		// Gets the parameters
		String project = getProject().getName();
		String jsUnitRoot = getJsUnitRoot() != null ? getJsUnitRoot() : getProject().getProperty( PROP_JSUNITROOT );
		String coreJs = getCoreJs() != null ? getCoreJs() : getProject().getProperty( PROP_COREJS );
		String testRunner = getTestRunner() != null ? getTestRunner() : getProject().getProperty( PROP_TESTRUNNER );

		// Checks the parameters
		if ( jsUnitRoot != null )
		{
			if ( coreJs == null )
			{
				coreJs = new File( jsUnitRoot, "app/jsUnitCore.js" ).getAbsolutePath();
			}
			if ( testRunner == null )
			{
				testRunner = new File( jsUnitRoot, "testRunner.html" ).getAbsolutePath();
			}
		}
		if ( coreJs == null )
		{
			throw new IllegalArgumentException( "Missing property coreJs" );
		}
		if ( testRunner == null )
		{
			throw new IllegalArgumentException( "Missing property testRunner" );
		}

		// Builds the test suite page
		File testPage = null;
		try
		{
			testPage = buildTestSuitePage( project, coreJs, scriptsFiles );
			String url = buildURL( testRunner, testPage );
			System.setProperty( ConfigurationProperty.URL.getName(), url );
			// TODO : allow fork and find a way to pass parameters without system properties
			setFork( false );
		}
		catch ( URISyntaxException urise )
		{
			throw new BuildException( urise );
		}
		catch ( IOException ioe )
		{
			throw new BuildException( ioe );
		}

		// Lets the superclass do the job (will start the included test)
		if ( isRunTests() )
		{
			// Adds all tests to the test suite (TODO : what implications with more than one test ?)
			for ( Iterator itt = getScriptsList().iterator(); itt.hasNext(); )
			{
				JsUnitTestTask test = (JsUnitTestTask) itt.next();
				test.setName( StandaloneTest.class.getName() );
				// TODO : allow fork and find a way to pass parameters without system properties
				test.setFork( false );
				addTest( test );
			}

			// Really starts the test
			super.execute();
		}

		if ( !isKeepTestPage() )
		{
			// After execution, removes temporary files if asked
			testPage.deleteOnExit();
		}
	}



	//
	// UTILITY METHODS
	//

	/** The best effort to get a well formed URI */
	private static URI buildURI( String text ) throws URISyntaxException
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
	 * Writes a complete JsUnit test suite page from the current environment
	 * into a temporary file.
	 * 
	 * @return The generated test page
	 * @throws IllegalArgumentException
	 *             if a required property is missing
	 */
	private static File buildTestSuitePage( String project, String JsUnitCore,
	        Map includes, String filename ) throws IOException,
	        URISyntaxException
	{
		// Reads the template of the test suite page to generate into a local
		// buffer
		InputStream is = StandaloneTest.class.getResourceAsStream( "TestSuite.html" );
		StringBuffer buffer = new StringBuffer();
		for ( int c = is.read(); c > -1; c = is.read() )
		{
			buffer.append( (char) c );
		}
		is.close();

		// Replaces the variable parts of the template
		String out = buffer.toString();
		out = out.replaceAll( "@project@", project );
		out = out.replace( "@jsUnitCore.js@", JsUnitCore );
		StringBuffer includesBuffer = new StringBuffer();
		// Currently only Javascript is supported
		Collection javascripts = (Collection) includes.get( JsUnitTestTask.TYPE_JAVASCRIPT );
		//for ( int i = 0; i < javascripts.length; i++ )
		for ( Iterator itj = javascripts.iterator(); itj.hasNext(); )
		{
			URI javascript = (URI) itj.next();
			includesBuffer.append( "<script type=\"text/javascript\" src=\"" );
			includesBuffer.append( javascript/*new File( javascripts[i] ).toURI()*/);
			includesBuffer.append( "\"></script>\n" );
		}
		out = out.replace( "@includes@", includesBuffer.toString() );

		// writes the generated test suite to a temporary file
		File testSuitePage = filename != null ? new File( filename ) : File.createTempFile( "jsunit-", ".tmp" );
		FileWriter fw = new FileWriter( testSuitePage );
		fw.write( out );
		fw.close();

		return testSuitePage;
	}



	private static File buildTestSuitePage( String project, String JsUnitCore,
	        Map includes ) throws IOException, URISyntaxException
	{
		return buildTestSuitePage( project, JsUnitCore, includes, null );
	}



	/**
	 * Before calling this method, make sure {@link #setTestSuitePage(File)} has been correctly set.
	 * @throws IllegalStateException if a property is missing or is incorrect
	 */
	private String buildURL( String testRunner, File testPage )
	        throws URISyntaxException, IOException
	{
		URI uri = buildURI( testRunner );
		return new URI( uri.getScheme(), uri.getUserInfo(), uri.getHost(), uri.getPort(), uri.getPath(), "testPage="
		        + testPage.getPath(), uri.getFragment() ).toString();
	}

}
