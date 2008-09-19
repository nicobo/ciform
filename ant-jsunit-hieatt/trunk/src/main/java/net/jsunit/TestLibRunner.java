package net.jsunit;


import java.util.Iterator;
import java.util.Properties;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.model.Browser;



/**
 * <p>This JUnit {@link TestCase} allows the direct execution of Javascript libraries (<tt>.js</tt> files) containing JsUnit tests.</p>
 * 
 * <p>It removes the need to write HTML test pages for the JsUnit tests to be executed.<br/>
 * For that, it simply generates a JsUnit test suite page giving a list of files to include and executes it against
 * JUnit.<br/>Parameters are given as system {@link Properties}.</p>
 * 
 * @see System#setProperties()
 * @see TestPage
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class TestLibRunner extends StandaloneTest
{
	private TestLibRunnerConfigurationSource configurationSource;



	//
	// INITIALISATION
	//

	public TestLibRunner( TestLibRunnerConfigurationSource source )
	{
		super( source );
		setConfigurationSource( source );
	}



	protected TestLibRunnerConfigurationSource getConfigurationSource()
	{
		return configurationSource;
	}



	protected void setConfigurationSource(
	        TestLibRunnerConfigurationSource configurationSource )
	{
		this.configurationSource = configurationSource;
	}



	//
	// JUNIT SPECIFICATIONS
	//

	/**
	 * Entry point for JUnit &lt; v4 (and used first if existing)
	 */
	public static Test suite()
	{
		TestSuite suite = new TestSuite();

		// Executes the test against each browser given in the initial configuration
		ConfigurationSource originalSource = Configuration.resolveSource();
		Configuration configuration = new Configuration( originalSource );
		for ( Iterator itb = configuration.getBrowsers().iterator(); itb.hasNext(); )
		{
			final Browser browser = (Browser) itb.next();

			// the configuration source is adjusted to only return the current browser
			// TODO write the test page only once (then delete it after all tests have been executed)
			suite.addTest( new TestLibRunner( new TestLibRunnerConfigurationSource( originalSource ) {
				public String browserFileNames()
				{
					return browser.getFileName();
				}
			} ) );
		}

		return suite;
	}



	public void tearDown() throws Exception
	{
		getConfigurationSource().getTestPage().deleteOnExit();
		super.tearDown();
	}
}
