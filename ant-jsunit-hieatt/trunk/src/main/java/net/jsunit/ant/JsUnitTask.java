package net.jsunit.ant;


import java.io.File;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Vector;

import net.jsunit.StandaloneTest;
import net.jsunit.TestLibRunner;
import net.jsunit.TestLibRunnerParameters;
import net.jsunit.TestPage;
import net.jsunit.utility.SourcePathUtil;

import org.apache.tools.ant.DirectoryScanner;
import org.apache.tools.ant.taskdefs.optional.junit.JUnitTask;
import org.apache.tools.ant.taskdefs.optional.junit.JUnitTest;
import org.apache.tools.ant.types.FileSet;



/**
 * <p>This task is a container and runner of {@link JsUnitTest}.<br>
 * It is equivalent to {@link JUnitTask}, but for a JsUnit test.</p>
 * 
 * <p>Sample usage :<code><pre>
 * </pre></code></p>
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class JsUnitTask extends JUnitTask implements TestLibRunnerParameters
{
	// PUBLIC CONSTANTS

	/** Name of the property pointing to the root directory of the JsUnit installation */
	public static final String PROP_JSUNITROOT = "jsunit.dir";

	// PRIVATE FIELDS

	/** All resources to include in the test suite page. Currently only Javascript */
	private List filesets = null;

	// PARAMETERS FROM THE BUILD SCRIPT / ENVIRONMENT

	//private boolean runTests = true;
	//	private boolean keepTestPage = false;
	private String jsUnitRoot;
	private String coreJs;
	private String testRunner;
	/** Either this field or {@link #filesets} must be present */
	private String testPage;



	//
	// INITIALISATION
	//

	public JsUnitTask() throws Exception
	{
		super();
	}



	//
	// PRIVATE ACCESSORS / MUTATORS
	//

	public List getFilesets()
	{
		if ( this.filesets == null )
		{
			this.filesets = new Vector();
		}
		return this.filesets;
	}



	/**
	 * <p>The files to test page, if any.</p>
	 * WARNING : {@link #setTestPage(String)} and this field must not be set at the same time.
	 */
	public void setFilesets( List filesets )
	{
		this.filesets = filesets;
	}



	//
	// ANT INTERFACE
	//

	public void addFileSet( FileSet fs )
	{
		getFilesets().add( fs );
	}



	/**
	 * <p>The filename of the test page, if any.</p>
	 * WARNING : {@link #setFilesets(List)} and this field must not be set at the same time.
	 */
	public String getTestPage()
	{
		return testPage;
	}



	public void setTestPage( String testPage )
	{
		this.testPage = testPage;
	}



	public String getJsUnitRoot()
	{
		return jsUnitRoot;
	}



	/**
	 * An optional parameter giving the path to the installation directory of JsUnit.
	 * Will be used to guess the path to other missing elements.
	 * 
	 * @param jsUnitRoot
	 */
	public void setJsUnitRoot( String jsUnitRoot )
	{
		this.jsUnitRoot = jsUnitRoot;
	}



	//
	//	public boolean isKeepTestPage()
	//	{
	//		return keepTestPage;
	//	}
	//
	//
	//
	//	/**
	//	 * Defaults to false.
	//	 * @param keepTestPage	If true, and if the test page was generated, ask not to delete it after the test is completed.
	//	 */
	//	public void setKeepTestPage( boolean keepTestPage )
	//	{
	//		this.keepTestPage = keepTestPage;
	//	}
	//

	//
	//	public boolean isRunTests()
	//	{
	//		return runTests;
	//	}
	//
	//
	//
	//	/**
	//	 * Defaults to true.
	//	 * @param runTests	If false, ask not to execute the tests. Can be used to generate an HTML test page for instance.
	//	 */
	//	public void setRunTests( boolean runTests )
	//	{
	//		this.runTests = runTests;
	//	}
	//

	public String getCoreJs()
	{
		return coreJs;
	}



	/**
	 * @param coreJs	Path to the core JsUnit's library (usually <tt>&lt;jsunit&gt;/app/jsUnitCore.js</tt>)
	 */
	public void setCoreJs( String coreJs )
	{
		this.coreJs = coreJs;
	}



	public String getTestRunner()
	{
		return testRunner;
	}



	/**
	 * @param testRunner	Path to JsUnit's test runner (usually &ltjsunit;&gt;/testRunner.html)
	 */
	public void setTestRunner( String testRunner )
	{
		this.testRunner = testRunner;
	}



	private Map getIncludes()
	{
		// A list of the URI of the files to include mapped to their type as key
		Map resources = new Hashtable();

		// Adds the inner list for this type of script, indexed on the type's name
		if ( !resources.containsKey( TestPage.INCLUDE_JAVASCRIPT ) )
		{
			resources.put( TestPage.INCLUDE_JAVASCRIPT, new Vector() );
		}

		// Scans and adds all given input files to their respective type's list
		for ( Iterator itr = getFilesets().iterator(); itr.hasNext(); )
		{
			FileSet fs = (FileSet) itr.next();
			DirectoryScanner ds = fs.getDirectoryScanner();
			for ( int f = 0; f < ds.getIncludedFiles().length; f++ )
			{
				File file = new File( ds.getBasedir(), ds.getIncludedFiles()[f] );
				((Collection) resources.get( TestPage.INCLUDE_JAVASCRIPT )).add( file.toURI() );
			}
		}

		return resources;
	}



	/**
	 * Checks the consistency of this object and returns the gathered parameters.
	 * @throws IllegalStateException	if the parameters of this object are not correct when put together
	 */
	private Properties getProperties() throws IllegalArgumentException
	{
		Properties props = new Properties();

		if ( getTestPage() != null
		        && (getFilesets() != null && getFilesets().size() > 0) )
		{
			throw new IllegalStateException( "Exactly one of testPage or nested fileset elements can be given at a time !" );
		}

		if ( getTestPage() == null
		        && (getFilesets() == null || getFilesets().size() == 0) )
		{
			throw new IllegalArgumentException( "No test defined !" );
		}

		// Checks some common parameters
		String jsUnitRoot = getJsUnitRoot() != null ? getJsUnitRoot() : getProject().getProperty( PROP_JSUNITROOT );
		String testRunner = getTestRunner() != null ? getTestRunner() : getProject().getProperty( PROP_TESTRUNNER );
		if ( jsUnitRoot != null )
		{
			if ( testRunner == null )
			{
				testRunner = new File( jsUnitRoot, "testRunner.html" ).getAbsolutePath();
			}
		}
		if ( testRunner == null )
		{
			throw new IllegalArgumentException( "Missing property testRunner" );
		}

		// a. case of an HTML test page
		if ( getTestPage() != null )
		{
			try
			{
				URI testPage = SourcePathUtil.normalizePath( getTestPage() );
				props.setProperty( "url" /*ConfigurationProperty.URL.name()*/, testRunner
				        + "?testPage=" + testPage.toString() );
			}
			catch ( URISyntaxException urise )
			{
				throw new IllegalArgumentException( urise );
			}
		}
		// b. case of Javascript files
		else
		{
			// Checks specific parameters
			String project = getProject().getName();
			String coreJs = getCoreJs() != null ? getCoreJs() : getProject().getProperty( PROP_COREJS );

			if ( jsUnitRoot != null )
			{
				if ( coreJs == null )
				{
					coreJs = new File( jsUnitRoot, "app/jsUnitCore.js" ).getAbsolutePath();
				}
			}
			if ( coreJs == null )
			{
				throw new IllegalArgumentException( "Missing property coreJs" );
			}

			// Builds properties from the parameters
			props.setProperty( PROP_PROJECT, project );
			props.setProperty( PROP_COREJS, coreJs );
			props.setProperty( PROP_TESTRUNNER, testRunner );
			// TODO : PROP_KEEPTESTPAGE
			// TODO : PROP_RUNTESTS
			Collection javascripts = (Collection) getIncludes().get( TestPage.INCLUDE_JAVASCRIPT );
			props.setProperty( PROP_JAVASCRIPTS, SourcePathUtil.filenamesToSourcePath( javascripts ) );
		}

		return props;
	}



	private JUnitTest asJUnitTest()
	{
		JUnitTest test = new JUnitTest();

		// a. case of an HTML test page
		if ( getTestPage() != null )
		{
			test.setName( StandaloneTest.class.getName() );
		}
		// b. case of Javascript files
		else
		{
			test.setName( TestLibRunner.class.getName() );
		}

		// TODO : allow fork and find a way to pass parameters without system properties
		test.setFork( false );

		return test;
	}



	public void execute()
	{
		// 1. Instantiates the test to execute
		addTest( asJUnitTest() );

		// 2. Sets the environment
		System.getProperties().putAll( getProperties() );

		// 3. Executes the test
		// Lets the superclass do the job (will start the included tests)
		// TODO : allow fork and find a way to pass parameters without system properties
		setFork( false );
		super.execute();
	}

}
