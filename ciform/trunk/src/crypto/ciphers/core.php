<?php
//
// Ciform
//
// Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
//

/**
 * A few common ciphers.<br>
 *
 * COPYRIGHT NOTICE :<pre>
 *
 * Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
 *
 *</pre>
 *
 * <p>Most of the ciphers here are only partially implemented, since this server-side library doesn't use encryption yet.</p>
 *
 * @package	crypto
 * @subpackage	ciphers
 * @link	http://plugnauth.sourceforge.net/ciform
 * @author Nicolas BONARDELLE <http://nicobo.net/contact>
 */

require_once "crypto/Cipher.class.php";

// Comment out the following line to enable debug traces from this script
//define("CRYPTO_DEBUG",TRUE);



/**
 * This cipher transforms an text into its hexadecimal representation
 */
class crypto_ciphers_Base16 extends crypto_Cipher
{
	function decode( $base16msg )
	{
		if ( CRYPTO_DEBUG) { echo print_r($this,TRUE)."->decode($base16msg)"."\n"; }

		return pack("H*",$base16msg);
	}
}



/**
 * Encodes/decodes text into/from a base64 string
 */
class crypto_ciphers_Base64 extends crypto_Cipher
{
	function decode( $base64msg )
	{
		if ( CRYPTO_DEBUG) { echo print_r($this,TRUE)."->decode($base64msg)"."\n"; }

		return base64_decode($base64msg);
	}
}

?>