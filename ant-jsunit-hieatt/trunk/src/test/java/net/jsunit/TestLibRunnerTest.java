package net.jsunit;


import java.io.File;

import junit.framework.TestCase;
import junit.framework.TestResult;
import junit.textui.TestRunner;



public class TestLibRunnerTest extends TestCase implements
        TestLibRunnerParameters
{
	private String urlfail;
	private String urlSuccess1;
	private String urlSuccess2;



	protected void setUp() throws Exception
	{
		System.setProperty( PROP_PROJECT, getClass().getName() );
		System.setProperty( PROP_TESTRUNNER, new File( "/../lib/jsunit/testRunner.html" ).toURI().toString() );
		System.setProperty( PROP_COREJS, new File( "/../lib/jsunit/app/jsUnitCore.js" ).toURI().toString() );
		urlfail = getClass().getResource( "fail.js" ).toString();
		urlSuccess1 = getClass().getResource( "success1.js" ).toString();
		urlSuccess2 = getClass().getResource( "success2.js" ).toString();
	}



	public void testTestStandaloneRun()
	{
		// fails if the test fails
		System.setProperty( TestLibRunnerConfigurationSource.PARAM_TESTPAGE, urlfail );
		TestLibRunner test = new TestLibRunner( new TestLibRunnerConfigurationSource() );
		TestResult result = TestRunner.run( test );
		assertTrue( result.failureCount() > 0 && result.errorCount() == 0 );

		// succeeds if the test succeeds
		System.setProperty( TestLibRunnerConfigurationSource.PARAM_TESTPAGE, urlSuccess1 );
		test = new TestLibRunner( new TestLibRunnerConfigurationSource() );
		result = TestRunner.run( test );
		assertTrue( result.failureCount() == 0 && result.errorCount() == 0 );

		// fails if at least one test fails
		System.setProperty( TestLibRunnerConfigurationSource.PARAM_TESTPAGE, urlfail
		        + File.pathSeparator + urlSuccess1 );
		test = new TestLibRunner( new TestLibRunnerConfigurationSource() );
		result = TestRunner.run( test );
		assertTrue( result.failureCount() > 0 && result.errorCount() == 0 );

		// succeeds if no test fails
		System.setProperty( TestLibRunnerConfigurationSource.PARAM_TESTPAGE, urlSuccess1
		        + File.pathSeparator + urlSuccess2 );
		test = new TestLibRunner( new TestLibRunnerConfigurationSource() );
		result = TestRunner.run( test );
		assertTrue( result.failureCount() == 0 && result.errorCount() == 0 );
	}
}
