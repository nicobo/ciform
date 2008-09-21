package net.jsunit.utility;


import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;



/**
 * Utility class to deal with source paths, as in Java's Classpath.
 * 
 * @see http://java.sun.com/j2se/1.3/docs/tooldocs/win32/classpath.html
 * @see http://ant.apache.org/manual/index.html
 * @author http://nicobo.net/contact?subject=jsunit+ant
 */
public class SourcePathUtil
{

	/**
	 * <p>The best effort to get a well formed URI to a file.</p>
	 * 
	 * <p>If the given path does not have a scheme, makes sure the returned {@link URI} will have the "file:" scheme,
	 * so it can be transformed into a {@link URL}.<br>
	 * Useful to easily manipulate easily filenames given in a source path.</p>
	 * 
	 * @return a URI representing the given path
	 */
	public static URI normalizePath( String path ) throws URISyntaxException
	{
		try
		{
			URI uri = new URI( path );
			if ( uri.getScheme() == null )
			{
				// if the URI is correct but misses the scheme part
				uri = new File( path ).toURI();
			}
			return uri.normalize();
		}
		catch ( URISyntaxException urise )
		{
			// path can be a valid file but still don't fit to URI syntax
			return new File( path ).toURI().normalize();
		}
	}



	/**
	 * Creates a source path from a list of strings (which are supposedly file names).
	 * Takes care of the special cases where the separator would be inside file names too.
	 */
	public static String filenamesToSourcePath( List pathElements,
	        String separator )
	{
		StringBuffer buffer = new StringBuffer();
		for ( Iterator itp = pathElements.iterator(); itp.hasNext(); )
		{
			String pathElement = ((Object) itp.next()).toString();
			buffer.append( pathElement.replaceAll( separator, "\\\\"
			        + separator ) );
			if ( itp.hasNext() )
			{
				buffer.append( separator );
			}
		}
		return buffer.toString();
	}



	/**
	 * Uses {@link File#pathSeparator} as the separator
	 * @see #filenamesToSourcePath(List, String)
	 */
	public static String filenamesToSourcePath( List pathElements )
	{
		return filenamesToSourcePath( pathElements, File.pathSeparator );
	}



	/**
	 * Splits a source path that was encoded with {@link #filenamesToSourcePath(List, String)}
	 * @return The list of filenames / components as {@link String}, unescaped if necessary
	 */
	public static List sourcePathToString( String sourcePath, String separator )
	{
		List list = new Vector();

		// First correctly extracts the path elements
		String[] pathElements = sourcePath.split( "(?<!\\\\)" + separator );
		// Then unescapes the potentials in-separators
		for ( int p = 0; p < pathElements.length; p++ )
		{
			list.add( pathElements[p].replaceAll( "\\\\" + separator, separator ) );
		}

		return list;
	}



	/**
	 * Uses {@link File#pathSeparator} as the separator
	 * @see #sourcePathToString(String, String)
	 */
	public static List sourcePathToString( String sourcePath )
	{
		return sourcePathToString( sourcePath, File.pathSeparator );
	}



	/**
	 * @return a {@link List}&lt;{@link URI}&gt;
	 * @throws URISyntaxException If any of the source path component is not a correct URI
	 * @see {@link #sourcePathToString(String, String)}
	 * @see {@link #normalizePath(String)}
	 */
	public static List sourcePathToURI( String sourcePath, String separator )
	        throws URISyntaxException, UnsupportedEncodingException
	{
		List list = new Vector();

		for ( Iterator its = sourcePathToString( sourcePath, separator ).iterator(); its.hasNext(); )
		{
			String pathElement = (String) its.next();
			if ( pathElement.trim().length() > 0 )
			{
				list.add( normalizePath( pathElement ) );
			}
		}

		return list;
	}



	/**
	 * Uses {@link File#pathSeparator} as the separator
	 * @see #sourcePathToURI(String, String)
	 */
	public static List sourcePathToURI( String sourcePath )
	        throws URISyntaxException, UnsupportedEncodingException
	{
		return sourcePathToURI( sourcePath, File.pathSeparator );
	}

}
