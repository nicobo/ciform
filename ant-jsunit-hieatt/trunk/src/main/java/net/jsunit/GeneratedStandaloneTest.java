package net.jsunit;


import java.util.Iterator;

import junit.framework.Test;
import junit.framework.TestSuite;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.configuration.DelegatingConfigurationSource;
import net.jsunit.model.Browser;



/**
 * Generates a JsUnit test suite page giving resources and executes it against
 * JUnit.
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class GeneratedStandaloneTest extends StandaloneTest
{

	//
	// INITIALISATION
	//

	public GeneratedStandaloneTest( String name )
	{
		super( name );
	}



	public GeneratedStandaloneTest( ConfigurationSource source )
	{
		super( "" );//new GeneratedConfigurationSource( source ) );
	}



	//
	// JUNIT SPECIFICATIONS
	//

	public static Test suite()
	{
		try
		{
			TestSuite suite = new TestSuite();
			ConfigurationSource originalSource = Configuration.resolveSource();
			Configuration configuration = new Configuration( originalSource );
			for ( Iterator itb = configuration.getBrowsers().iterator(); itb.hasNext(); )
			{
				final Browser browser = (Browser) itb.next();
				suite.addTest( new GeneratedStandaloneTest( new DelegatingConfigurationSource( originalSource ) {
					public String browserFileNames()
					{
						return browser.getFileName();
					}
				} ) );
			}
			return suite;

		}
		catch ( Exception e )
		{
			e.printStackTrace( System.err );
			return null;
		}
	}
}
