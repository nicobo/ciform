<?php
//
// Ciform
//
// Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
//

/**
 * Core ciphers for ciform messages.<br>
 *
 * COPYRIGHT NOTICE :<pre>
 *
 * Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
 *
 *</pre>
 *
 * <p>Most of the ciphers here are only partially implemented, since this server-side library doesn't use encryption yet.</p>
 *
 * @package	ciform
 * @subpackage	ciphers
 * @link	http://plugnauth.sourceforge.net/ciform
 * @author Nicolas BONARDELLE <http://nicobo.net/contact>
 */



/**
 * This class specifies the interface of a cipher : both the encoding and the decoding parts.<br>
 *
 * @abstract
 */
class crypto_Cipher
{
	/**
	 * @param string $cleartext	The message to encode
	 * @return string		The encoded message (= ciphertext)
	 * @abstract
	 */
	function encode( $cleartext ) { throw new Exception("This method is not implemented."); }

	/**
	 * @param string $ciphertext	The encoded message to decode
	 * @return string|FALSE		The decoded message or FALSE if this object cannot decode the given ciphertext
	 * @abstract
	 */
	function decode( $ciphertext ) { throw new Exception("This method is not implemented."); }
}

?>