<?php
//
// Ciform
//
// Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
//

/**
 * Core decoders/encoders classes for ciform messages.<br>
 *
 * <p>NOTE : In order to keep compatibility with PHP 4, only the basic object oriented features of PHP
 * are used in this script. This may lead programmers familiar with OOP to misunderstand the classes tree sometimes.
 * In particular, some classes are meant to be interfaces, but since there's only one possible extend per class,
 * they were made real classes, and then the tree does not conform exactly to what it would be if multiple
 * inheritance was allowed.</p>
 *
 * @package	ciform
 * @subpackage	ciphers
 * @link	http://plugnauth.sourceforge.net/ciform
 * @author Nicolas BONARDELLE <http://nicobo.net/contact>
 */

require_once "crypto/ciphers/core.php";

// Comment out the following line to enable debug traces from this script
//define("CIFORM_DEBUG",TRUE);
/** The prefix to any Ciform packet */
define("CIFORM_SCHEME_NAME","ciform");
/** The regular expression that extracts the body from any Ciform packet */
define("CIFORM_SCHEME_EXTRACT_BODY",'^'.CIFORM_SCHEME_NAME.':(.*)$');



/**
 * This class specifies the interface of a scheme handler in the Ciform protocol.<br>
 * @abstract
 */
class Ciform_Scheme extends crypto_Cipher
{
	/**
	 * @access private
	 */
	var $name;

	function Ciform_Scheme( $name )
	{
		if ( defined($name) ) {
			$this->name = $name;
		}
	}

	/**
	 * Used to identify this scheme.
	 */
	function getName()
	{
		return $this->name;
	}

	/**
	 * This method provides a representation of this object to send to the client.<br>
	 *
	 * <p>The clients will be provided this representation, which must contain all information
	 * necessary to the correct transmission of encrypted informations to (and from) this server.</p>
	 *
	 * <p>Since it is carried by each scheme, different implementations of the same scheme must return the same kind of data.</p>
	 *
	 * @return array The crucial properties of this object in an array. Defaults to an empty array.
	 */
	function export()
	{
		return array();
	}

	/**
	 * Builds a packet with full scheme from a message.
	 * @param string $packet	The message to pack
	 * @abstract
	 */
	function pack( $packet ) { throw new Exception("This method is not implemented."); }

	/**
	 * @param string $packet	A 'ciphertext', including the full scheme
	 * @return array|FALSE		FALSE if this does not matches this scheme.
	 *				Otherwise, an array containing unpacked informations,
	 *				with at least the body of the given packet indexed on the key <kbd>body</kbd>.
	 * 				For instance,<kbd>rsa:0x21372A02302FD83242A723</kbd> would return array("body"=&gt;<kbd>0x21372A02302FD83242A723</kbd>)
	 * 				if this class handles <kbd>rsa:</kbd> prefixed packets.
	 * @abstract
	 */
	function unpack( $packet ) { throw new Exception("This method is not implemented."); }
}



/**
 * This pseudo-cipher handles the recursive aspects of Ciform's scheme by holding a list of ciphers to use for enc/decoding.<br>
 *
 * <p>As a decoder, it acts like a <b>chain of responsibility</b>, invoking each of its internal decoders
 * in turn until one of them can decode the message.</p>
 *
 * <p>NOTE : The encoder part is not implemented.</p>
 */
class Ciform_CipherChain extends Ciform_Scheme
{
	/**
	 * @var array<crypto_Cipher>
	 * @access private
	 */
	var $ciphers;


	/**
	 * @param array $ciphers	The list of the internal {@link crypto_Cipher}s in this chain
	 */
	function Ciform_CipherChain( $ciphers )
	{
		parent::Ciform_Scheme(NULL);
		$this->ciphers = $ciphers;
	}



	/**
	 * Does one loop in the chain : tries each cipher in turn (lowest index first) on the given ciphertext.<br>
	 *
	 * @return string	The first result not FALSE, or FALSE if no cipher matched
	 * @access private
	 */
	function chainDecode( $packet )
	{
		foreach ( $this->ciphers as $decoder )
		{
			// The first decoder accepting the ciphertext is the good one, we don't need to go further.
			if ( $cleartext = $decoder->decode($packet,$this) )
			{
				return $cleartext;
			}
		}

		// no decoder has accepted the ciphertext
		return FALSE;
	}



	/**
	 * @return string	The result of the call to the {@link crypto_Cipher#decode} method
	 *			of the first decoder in the chain that accepted the ciphertext,
	 *			or the original message if none was found (never returns FALSE)
	 */
	function decode( $packet )
	{
		if ( CIFORM_DEBUG ) echo print_r($this,TRUE)."->decode($packet)"."\n";

		// this outer loop tells to continue while the message is still encoded and handled by one of the decoders
		for ( $message1 = $packet ; $message2 = $this->chainDecode($message1) ; $message1 = $message2  );

		return $message1;
	}
}



/**
 * This class defines a skeleton to write a Ciform enc/decoder.
 * @abstract
 */
class Ciform_Codec extends Ciform_Scheme
{
	/**
	 * @var Ciform_Scheme Used as a default cipher chain
	 * @access private
	 * @see #decode
	 */
	var $chain;

	/**
	 * @var boolean
	 * @access private
	 */
	var $unpackOnly;



	/**
	 * @param boolean $unpackOnly	If TRUE, this codec will not do the final decoding on the packet,
	 * but will rather return the body as is.
	 */
	function Ciform_Codec( $name, $unpackOnly=FALSE )
	{
		parent::Ciform_Scheme($name);
		$this->unpackOnly = $unpackOnly;
	}



	/**
	 * @return crypto_Cipher|FALSE	A cipher able to decode the body of the given packet,
	 *				or FALSE if this scheme does not handle this kind of packet.<br>
	 *				<br>
	 *				Note that the prefered way to check if a codec does handle some packet
	 *				is not to call this method, but rather to compare the result of the {@link unpack} method with FALSE.
	 * @access protected
	 * @abstract
	 */
	function getDecoder( $packet ) { throw new Exception("This method is not implemented."); }



	/**
	 * @todo Describe this method
	 */
	function encode( $text ) { throw new Exception("This method is not implemented."); }



	/**
	 * Decrypts and unpack in chain a Ciform packet.<br>
	 *
	 * <p>There can be several levels of encoding in one ciphertext.<br>
	 * For instance, a message could first be encoded into hexadecimal form, then through RSA.<br>
	 * The decryption would then take place in two steps : first, decoding the RSA message will give the hexadecimal form;
	 * then, transcoding this message to the original charset (e.g. ASCII) will give back the original text.<br>
	 * An object implementing this class is used for each step in this <b>decoding chain</b>.</p>
	 *
	 * @param string $ciphertext		The message to decode
	 * @param Ciform_CipherChain $chain	A decoder that may be used to decrypt inner parts of the ciphertext.<br>
	 *					It should be a {@link Ciform_CipherChain}, but all that is required is that it respects the {@link Ciform_Scheme} interface.<br>
	 *					It may be used to decode some part of the message, e.g. when the decoder allows the body of the message itself to be encoded.<br>
	 *					For instance : with <kbd>rsa:hex:0x1232423248</kbd>, a {@link Ciform_ciphers_RSADecoder} will call the chain on <kbd>hex:0x1232423248</kbd>
	 *					in order to get the raw value to decrypt with a RSA private key.
	 * @return string|FALSE			The decoded message or FALSE if this class cannot decode the given ciphertext.
	 */
	function decode( $packet, $chain=FALSE )
	{
	 	if ( CIFORM_DEBUG ) { echo print_r($this,TRUE),"->decode($packet,<chain>)"."\n"; }

		// uses the internal chain (if any) if the chain was not given as an argument
		$myChain = $chain ? $chain : ($this->chain ? $this->chain : FALSE);

	 	if ( CIFORM_DEBUG ) { echo "myChain=",print_r($myChain,TRUE)."\n"; }

		// 1. First extract the body from the packet
		if ( ($unpacked = $this->unpack($packet)) && isset($unpacked['body']) )
		{
	 		if ( CIFORM_DEBUG ) { echo "unpacked=$unpacked"."\n"; }

			$body = $unpacked['body'];

			// 2. and resursively decode the body if it is itself a packet
			if ( $myChain && $cleartext = $myChain->decode($body) )
			{
	 			if ( CIFORM_DEBUG ) { echo "cleartext=$cleartext"."\n"; }

				$body = $cleartext;
			}

			// 3. finally decode the body using the decoder of this cipher
			if ( $this->unpackOnly )
			{
				return $body;
			}
			else
			{
				// 3.a get a decoder on the given packet
				$decoder = $this->getDecoder($packet);

				if ( CIFORM_DEBUG ) { echo "decoder=".print_r($decoder,TRUE)."\n"; }

				// 3.b then use the decoder to return a decoded text
				return $decoder->decode($body);
			}
		}

	 	if ( CIFORM_DEBUG ) { echo "unpacked=$unpacked"."\n"; }

		// if no decoder was found, this object does not handle this scheme
		return FALSE;
	}
}



/**
 * A simple scheme packer/unpacker based on a regular expression.<br>
 *
 * <p>Such a simple scheme unpacker could be used "as is" if the operation only consist to remove a part of the packet (a prefix for instance).<br>
 * This is sometimes usefull to unmark a packet or remove unused information from a message.</p>
 *
 * <p>NOTE : The unpacker part is not implemented.</p>
 */
class Ciform_SimpleScheme extends Ciform_Codec
{
	/**
	 * @var string
	 * @access private
	 */
	var $regex;



	/**
	 * @param string $regex		The regular expression to use to extract the message body from packets.
	 *				It will be passed as the first argument to {@link preg_match}.
	 *				It must isolate the message into its first capturing group (<kbd>$matches[1]</kbd>).
	 * @param boolean $unpackOnly	See Ciform_Codec#Ciform_Codec()
	 */
	function Ciform_SimpleScheme( $name, $regex, $unpackOnly=FALSE )
	{
		parent::Ciform_Codec($name,$unpackOnly);
		$this->regex = $regex;
	}



	/**
	 * Extracts the body of the message using its registered regular expression
	 */
	function unpack( $packet )
	{
	 	if ( CIFORM_DEBUG ) { echo print_r($this,TRUE)."->unpack($packet)"."\n"; }

		if ( preg_match($this->regex,$packet,$matches) )
		{
	 		if ( CIFORM_DEBUG ) { echo "matches=".print_r($matches,TRUE)."\n"; }

			return array( 'body' => $matches[1] );
		}

	 	if ( CIFORM_DEBUG ) { echo "preg_match(".$this->regex.",$packet,$matches)=".preg_match($this->regex,$packet,$matches)."\n"; }

		return FALSE;
	}
}



/**
 * A simple decoder that removes salt from a message.
 *
 * <p>Salt is used to add randomness to a message : it can be removed safely.</p>
 */
class Ciform_schemes_Salt extends Ciform_SimpleScheme
{
	/**
	 * Only this constructor needs to be defined, in order to pass the superclass
	 * the right regex to extract the salt from the message.
	 */
	function Ciform_schemes_Salt()
	{
		parent::Ciform_SimpleScheme("salt",'/^salt[^:]*:(.*)$/i');
	}
}



/**
 * This decoder transforms an hexadecimal string into its binary representation.
 */
class Ciform_schemes_Base16 extends Ciform_SimpleScheme
{
	/**
	 * @param boolean $unpackOnly	If FALSE, the {@link decode()} method will not decode the ciphertext,
	 *				but just return the hexadecimal encoded value without the <kbd>hex:</kbd> preamble
	 */
	function Ciform_schemes_Base16( $unpackOnly=FALSE )
	{
		parent::Ciform_SimpleScheme("base16",'/^(?:hex:|0x)(.*)$/i',$unpackOnly);
	}

	function getDecoder( $packet )
	{
		if ( CIFORM_DEBUG ) { echo print_r($this,TRUE)."->getDecoder($packet)"."\n"; }

		if ( $this->unpack($packet) )
		{
			return new crypto_ciphers_Base16();
		}

		return FALSE;
	}
}



/**
 * Decodes base64 encoded texts
 */
class Ciform_schemes_Base64 extends Ciform_SimpleScheme
{
	/**
	 * @param boolean $unpackOnly	If FALSE, the {@link #decode} method will not decode the ciphertext,
	 *				but just return the base64 encoded value without the <kbd>base64:</kbd> preamble
	 */
	function Ciform_schemes_Base64( $unpackOnly=FALSE )
	{
		parent::Ciform_SimpleScheme("base64",'/^(?:base64|b64):(.*)$/i',$unpackOnly);
	}

	function getDecoder( $packet )
	{
		if ( CIFORM_DEBUG ) { echo print_r($this,TRUE)."->getDecoder($packet)"."\n"; }

		if ( $this->unpack($packet) )
		{
			return new crypto_ciphers_Base64();
		}

		return FALSE;
	}
}



/**
 * Simply unpacks a ciform packet
 */
class Ciform_schemes_Ciform extends Ciform_SimpleScheme
{
	function Ciform_schemes_Ciform()
	{
		parent::Ciform_SimpleScheme(CIFORM_SCHEME_NAME,CIFORM_SCHEME_EXTRACT_BODY,TRUE);
	}
}

?>