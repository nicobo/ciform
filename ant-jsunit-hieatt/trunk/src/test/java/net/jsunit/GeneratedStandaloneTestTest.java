package net.jsunit;


import junit.framework.TestCase;
import junit.framework.TestResult;
import junit.textui.TestRunner;



public class GeneratedStandaloneTestTest extends TestCase
{

	public void testTestStandaloneRun()
	{
		GeneratedStandaloneTest test = new GeneratedStandaloneTest( "A test for a test !" );
		TestResult result = TestRunner.run( test );
		assert (result.failureCount() == 0 && result.errorCount() == 0);
	}

}
