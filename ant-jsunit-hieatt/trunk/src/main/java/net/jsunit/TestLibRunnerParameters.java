package net.jsunit;


/**
 * Describes the system properties recognised by {@link TestLibRunner}.
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public interface TestLibRunnerParameters
{
	/** Name of the property pointing to the JsUnit core library's file */
	public static final String PROP_COREJS = "jsunit.coreJs";
	/** Name of the property pointing to the JsUnit's <tt>testRunner.html</tt> file */
	public static final String PROP_TESTRUNNER = "jsunit.testRunner";
	/** Property name defining the Javascript files to include in the test page (path-like). */
	public static final String PROP_JAVASCRIPTS = "jsunit.in.javascripts";
	/** Property name defining the name of the project to use as the title of the generated page */
	public static final String PROP_PROJECT = "jsunit.in.project";
}
