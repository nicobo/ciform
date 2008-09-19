package net.jsunit.ant;


import java.io.File;
import java.util.Collection;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Map;
import java.util.Vector;

import net.jsunit.StandaloneTest;
import net.jsunit.TestLibRunner;
import net.jsunit.TestLibRunnerConfigurationSource;

import org.apache.tools.ant.DirectoryScanner;
import org.apache.tools.ant.taskdefs.optional.junit.JUnitTask;
import org.apache.tools.ant.types.FileSet;



/**
 * This task permits convenient access to the {@link TestLibRunner} unit test.
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class JsUnitBatchTestTask extends JUnitTask
{
	// PUBLIC CONSTANTS

	/** Name of the property pointing to the root directory of the JsUnit installation */
	public static final String PROP_JSUNITROOT = "jsunit.dir";
	/** @see TestLibRunnerConfigurationSource#PROP_COREJS */
	public static final String PROP_COREJS = TestLibRunnerConfigurationSource.PROP_COREJS;
	/** @see TestLibRunner#PROP_TESTRUNNER */
	public static final String PROP_TESTRUNNER = "jsunit.testRunner";

	// PRIVATE FIELDS

	/** Inner {@link JsUnitTestTask} elements */
	private Collection scriptsList = new Vector();

	// PARAMETERS FROM THE BUILD SCRIPT / ENVIRONMENT

	private boolean runTests = true;
	private boolean keepTestPage = false;
	private String jsUnitRoot;
	private String coreJs;
	private String testRunner;



	//
	// INITIALISATION
	//

	public JsUnitBatchTestTask() throws Exception
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
		//		File testPageFile = null;
		//TestPage testPage = null;
		//		try
		//		{
		//			testPage = new TestPage( project, coreJs, scriptsFiles );
		//			//			testPageFile = testPage.writeToFile();
		//			//			String url = testPageFile.toURL()( testRunner, testPage );
		//			//System.setProperty( ConfigurationProperty.URL.getName(), url );
		//			// TODO : allow fork and find a way to pass parameters without system properties
		setFork( false );
		//		}
		//		catch ( URISyntaxException urise )
		//		{
		//			throw new BuildException( urise );
		//		}
		//		catch ( IOException ioe )
		//		{
		//			throw new BuildException( ioe );
		//		}

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

			// Really executes the tests
			super.execute();
		}

		//		if ( !isKeepTestPage() )
		//		{
		//			// After execution, removes temporary files if asked
		//			testPageFile.deleteOnExit();
		//		}
	}

}
