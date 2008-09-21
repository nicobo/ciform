package net.jsunit.utility;


import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;

import junit.framework.TestCase;



public class SourcePathUtilTest extends TestCase
{

	public void testFilenamesToSourcePathToList()
	{
		List filenames = Arrays.asList( new String[] { "/tmp/toto", "d:\\\\temp\\tutu", "Win32;sep", "Linux:sep" } );

		// a test with Linux's path separator
		String spLinux = SourcePathUtil.filenamesToSourcePath( filenames, ":" );
		assertEquals( filenames, SourcePathUtil.sourcePathToString( spLinux, ":" ) );

		// a test with Windows' path separator
		String spWindows = SourcePathUtil.filenamesToSourcePath( filenames, ";" );
		assertEquals( filenames, SourcePathUtil.sourcePathToString( spWindows, ";" ) );

		// a test with the current OS's path separator
		String spLocal = SourcePathUtil.filenamesToSourcePath( filenames );
		assertEquals( filenames, SourcePathUtil.sourcePathToString( spLocal ) );
	}



	public void testNormalizePath() throws URISyntaxException,
	        UnsupportedEncodingException
	{
		URI tmp_toto = new URI( "file", null, null, -1, "/tmp/toto", null, null );
		URI quote = new URI( "file", null, null, -1, "/tmp/to\"to", null, null );
		URI space = new URI( "file", null, null, -1, "/tmp/to to", null, null );

		try
		{
			assertEquals( tmp_toto, SourcePathUtil.normalizePath( "/tmp/toto" ) );
			assertEquals( tmp_toto, SourcePathUtil.normalizePath( "file:/tmp/toto" ) );
			assertEquals( quote, SourcePathUtil.normalizePath( "/tmp/to\"to" ) );
			assertEquals( quote, SourcePathUtil.normalizePath( "file:/tmp/to%22to" ) );
			assertEquals( space, SourcePathUtil.normalizePath( "/tmp/to to" ) );
			assertEquals( space, SourcePathUtil.normalizePath( "file:/tmp/to%20to" ) );
		}
		catch ( URISyntaxException urise )
		{
			urise.printStackTrace( System.err );
			fail( urise.getMessage() );
		}
	}
}
