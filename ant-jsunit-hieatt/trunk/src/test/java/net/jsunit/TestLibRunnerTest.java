package net.jsunit;


import java.io.File;
import java.net.MalformedURLException;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import junit.framework.TestCase;
import junit.textui.TestRunner;
import net.jsunit.configuration.ConfigurationProperty;
import net.jsunit.utility.SourcePathUtil;



/**
 * This test is a bit unusual since :
 * <ol>
 * <li>It is a test for a JUnit {@link TestCase}
 * <li>It requires parameters to run correctly, that must be defined as system {@link Properties}.
 * </ol>
 *
 * @see #setUp()
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class TestLibRunnerTest extends TestCase implements
        TestLibRunnerParameters
{
	private File jsFail;
	private File jsSuccess1;
	private File jsSuccess2;



	/**
	 * <p>The following system properties must be set before calling this test :<ul>
	 * <li>{@link TestLibRunnerParameters#PROP_TESTRUNNER}
	 * <li>{@link TestLibRunnerParameters#PROP_COREJS}
	 * <li>{@link ConfigurationProperty#BROWSER_FILE_NAMES}
	 * </ul></p>
	 * 
	 * <p>This test also requires the following entries to be in the classpath :<ul>
	 * <li><tt>&lt;jsunit&gt;/java/lib/*.jar</tt>
	 * <li>jsunit.jar (can be found in <tt>&lt;jsunit&gt;/java/bin</tt>)
	 * <li><tt>&lt;jsunit&gt;/java/config</tt> (containing <tt>.xml</tt> configs)
	 * </ul>
	 * ... where &lt;jsunit&gt; is the directory where JsUnit is installed (see {@link ConfigurationProperty#RESOURCE_BASE}).</p>
	 * 
	 * <p>In addition, any property defined in {@link ConfigurationProperty} can be set to refine the execution of the test.</p>
	 */
	protected void setUp() throws Exception
	{
		// Sets some more properties
		System.setProperty( PROP_PROJECT, getClass().getName() );
		//System.setProperty( "resourceBase", "/home/cbonar/src/ant-jsunit-hieatt/lib/jsunit" );
		// if not set, sets a port less likely to conflict with existing services than the default one
		if ( !System.getProperties().containsKey( ConfigurationProperty.PORT.getName() ) )
		{
			System.setProperty( ConfigurationProperty.PORT.getName(), "45678" );
		}

		// Loads the resource scripts that contains the test functions
		jsFail = new File( getClass().getResource( "fail.js" ).toURI() );
		jsSuccess1 = new File( getClass().getResource( "success1.js" ).toURI() );
		jsSuccess2 = new File( getClass().getResource( "success2.js" ).toURI() );
	}



	public void testTestStandaloneRun() throws MalformedURLException
	{
		String urlFail = jsFail.toURI().toURL().toString();
		String urlSuccess1 = jsSuccess1.toURI().toURL().toString();
		String urlSuccess2 = jsSuccess2.toURI().toURL().toString();

		// must fail if the test fails
		List filesFail1 = Arrays.asList( new String[] { urlFail } );
		System.setProperty( PROP_JAVASCRIPTS, SourcePathUtil.filenamesToSourcePath( filesFail1 ) );
		TestLibRunner testFail1 = new TestLibRunner( new TestLibRunnerConfigurationSource() );
		assertFalse( TestRunner.run( testFail1 ).wasSuccessful() );

		// must succeed if the test succeeds
		List filesSuccess1 = Arrays.asList( new String[] { urlSuccess1 } );
		System.setProperty( PROP_JAVASCRIPTS, SourcePathUtil.filenamesToSourcePath( filesSuccess1 ) );
		TestLibRunner testSuccess1 = new TestLibRunner( new TestLibRunnerConfigurationSource() );
		assertTrue( TestRunner.run( testSuccess1 ).wasSuccessful() );

		// must fail if at least one test fails
		List filesFail2 = Arrays.asList( new String[] { urlFail, urlSuccess1 } );
		System.setProperty( PROP_JAVASCRIPTS, SourcePathUtil.filenamesToSourcePath( filesFail2 ) );
		TestLibRunner testFail2 = new TestLibRunner( new TestLibRunnerConfigurationSource() );
		assertFalse( TestRunner.run( testFail2 ).wasSuccessful() );

		// must succeed if all tests succeed
		List filesSuccess2 = Arrays.asList( new String[] { urlSuccess1, urlSuccess2 } );
		System.setProperty( PROP_JAVASCRIPTS, SourcePathUtil.filenamesToSourcePath( filesSuccess2 ) );
		TestLibRunner testSuccess2 = new TestLibRunner( new TestLibRunnerConfigurationSource() );
		assertTrue( TestRunner.run( testSuccess2 ).wasSuccessful() );
	}
}
