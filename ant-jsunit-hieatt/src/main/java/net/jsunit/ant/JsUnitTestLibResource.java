package net.jsunit.ant;


import org.apache.tools.ant.types.resources.selectors.Type.FileDir;



/**
 * TODO : This class describes resources to include in a generated HTML test page
 * 
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class JsUnitTestLibResource extends FileDir
{
	/** Known type for Javascript tags */
	public static final String TYPE_JAVASCRIPT = "text/javascript";

	/** Defaults to {@link #TYPE_JAVASCRIPT} */
	private String type = TYPE_JAVASCRIPT;



	/** The <tt>type</tt> attribute of the &lt;script&gt; tag to be generated. */
	public String getType()
	{
		return type;
	}



	public void setType( String type )
	{
		this.type = type;
	}

}
