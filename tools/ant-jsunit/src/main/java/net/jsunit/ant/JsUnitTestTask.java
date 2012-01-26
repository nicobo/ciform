package net.jsunit.ant;


import java.util.List;
import java.util.Vector;

import org.apache.tools.ant.taskdefs.optional.junit.JUnitTest;
import org.apache.tools.ant.types.FileSet;



/**
 * <p>
 * A simple class to represent a JsUnit test.
 * </p>
 * 
 * <p>It is composed of a set of &lt;script&gt; tags, represented by the included {@link FileSet}s.
 * </p>
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class JsUnitTestTask extends JUnitTest
{

	/** Known type for Javascript tags */
	public static final String TYPE_JAVASCRIPT = "text/javascript";

	//
	// INITIALISATION
	//

	/** All resources to include in the test suite page */
	private List filesets = new Vector();

	/** Defaults to {@link #TYPE_JAVASCRIPT} */
	private String type = TYPE_JAVASCRIPT;



	public JsUnitTestTask( String name, boolean haltOnError,
	        boolean haltOnFailure, boolean filtertrace, String type )
	{
		super( name, haltOnError, haltOnFailure, filtertrace );
		setType( type );
	}



	public JsUnitTestTask( String name )
	{
		super( name );
	}



	public JsUnitTestTask()
	{
		super();
	}



	public List getFilesets()
	{
		return filesets;
	}



	public void setFilesets( List filesets )
	{
		this.filesets = filesets;
	}



	//
	// NEW ANT FIELDS
	//

	/** The <tt>type</tt> attribute of the &lt;script&gt; tag to be generated. */
	public String getType()
	{
		return type;
	}



	public void setType( String type )
	{
		this.type = type;
	}



	public void addFileSet( FileSet fs )
	{
		getFilesets().add( fs );
	}
}
