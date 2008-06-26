<?php
	/**
	 * Core decoders for ciform messages
	 *
	 * @package ciform
	 * @subpackage ciphers
	 */

	// constants exportable to included scripts
	define("CIFORM_SESSION","CIFORM");
	define("CIFORM_PROTOCOL_VERSION",0);
	/**
	 * This prefix just means that the corresponding message can be handled by this library.
	 * @see {@link Depacketizer}
	 * @static
	 * @final
	 */
	define("CIFORM_REQUEST_PREFIX","ciform:");
	define("CIFORM_PACKET_EXTRACT_MESSAGE",'^'.CIFORM_REQUEST_PREFIX.'(.*)$');
	define("CIFORM_SESSION_KEYPAIR","KEYPAIR");	// TODO : move to ciform_rsa.php
	if ( ! defined("CIFORM_DEBUG") ) define("CIFORM_DEBUG",FALSE);

	require_once("ciform_rsa.php");

	// private constants
	define("CIFORM_REQUEST_PROTOCOL","protocol");
	define("CIFORM_KEYTYPE",CIFORM_RSA_KEYTYPE);	// choose the desired encryption module here
	if ( ! defined("CIFORM_AUTODECRYPT") ) define("CIFORM_AUTODECRYPT", TRUE );



	/**
	 * This class defines the interface of a scheme in the Ciform protocol.<br>
	 */
	class Scheme
	{
		/**
		 * @return the body of the given packet, or FALSE if this does not matches this scheme.
		 * For instance,<code>rsa:0x21372A02302FD83242A723</code> would return <code>0x21372A02302FD83242A723</code>
		 * if this class handles <code>rsa:</code> prefixed packets.
		 */
		function getBody( $packet ) { return FALSE; }
	}



	/**
	 * This class defines the interface decoders have to implement in order to decrypt in chain Ciform messages.<br>
	 *
	 * <p>There can be several levels of encoding in one ciphertext.<br>
	 * For instance, a message could first be encoded into hexadecimal form, then through RSA.<br>
	 * The decryption would then take place in two steps : first, decoding the RSA message will give the hexadecimal form;
	 * then, transcoding this message to the original charset (e.g. ASCII) will give back the original text.<br>
	 *
	 * An object implementing this class is used for each step in this <em>decoding chain</em>.</p>
	 *
	 * @abstract
	 */
	class ChainDecoder extends Scheme
	{
//		/**
//		 * @param string $ciphertext	The message to decode
//		 * @return boolean		TRUE if this decoder can handle the given message, FALSE if not.
//		 * @abstract
//		 */
//		function canDecode( $ciphertext ) { return FALSE };

		/**
		 * {@link ::canDecode()} must be called before to call this method.
		 *
		 * @param string $ciphertext	The message to decode
		 * @param ChainDecoder $chain	The chain decoder to invoke next.<br>
		 *				It must <b>not</b> be used when the decoder cannot handle the ciphertext (in this case, it must return FALSE).<br>
		 *				It may be used to decode the rest of the message, when the decoder allows the body of the message to be encoded itself.<br>
		 *				For instance : with <code>rsa:hex:0x1232423248</code>, a {@link RSADecoder} will call the chain on <code>hex:0x1232423248</code>
		 *				in order to get the raw value to decrypt with a RSA private key.
		 * @return string|FALSE		The decoded message or FALSE if an error happened.
		 * @abstract
		 */
		function decode( $ciphertext, $chain ) { return FALSE; }
	}



	/**
	 * This decoder acts like a <em>chain of responsibility</em> : it invokes each of its internal decoders
	 * in turn until one of them can decode the message.<br>
	 *
	 * <p>Its role is not to be a single link in the chain, but to make the chain start.
	 * However, it respects the {@link ChainDecoder} interface.</p>
	 */
	class ChainDecoderChain extends ChainDecoder
	{
		/** @access private */
		var $decoders;

		/**
		 * @param array $decoders	The list of the internal decoders of this chain
		 */
		function ChainDecoderChain( $decoders )
		{
			$this->$decoders = $decoders;
		}

		function canDecode( $ciphertext )
		{
			foreach ( $this->$decoders as $decoder )
			{
				if ( $decoder->canDecode($ciphertext) ) {
					return TRUE;
				}
			}

			return FALSE;
		}

		/**
		 * NOTE : the $chain parameter is not used here
		 * @return TRUE if at least one decoder in the chain could decode some part of the ciphertext, FALSE else
		 */
		function decode( $ciphertext, $chain )
		{
			if ( ! $this->canDecode($ciphertext) ) {
				return FALSE;
			}

			$message = $ciphertext;

			// this outer loop tells to continue while the message is still encoded and handled by one of the decoders
			while ( $this->canDecode($message) )
			{
				// this inner loop tells to try each decoder in turn
				foreach ( $this->$decoders as $decoder )
				{
					if ( $decoder->canDecode($message) ) {
						$message = $decoder->decode($message,$this);
						// The first decoder accepting the ciphertext is the good one, we don't need to go further.
						// This break is not necessary since there is no real priority order in the chain,
						// but it helps to show the logic of the loop.
						break;
					}
				}
			}

			return $message;
		}
	}



	/**
	 * A simple de-packetizer of (for instance) "ciform:" prepended messages.<br>
	 *
	 * <p>Such a simple decoder could exist just to unmark a packet or remove unused information from a message.</p>
	 */
	class Depacketizer extends ChainDecoder
	{
		/**
		 * @var array Matches of the last message passed to {@link ::canDecode()}
		 * @access private
		 */
		var $matches;

		/**
		 * @var string
		 * @access private
		 */
		var $regex;

		/**
		 * @param string $regex	The regular expression to use to extract core the message from packets.
		 *	It will be passed as the first argument to {@link eregi}.
		 *	It must isolate the message into its first capturing group (<code>$matches[1]</code>).
		 * Defaults to {@link CIFORM_PACKET_EXTRACT_MESSAGE}
		 */
		function Depacketizer( $regex=CIFORM_PACKET_EXTRACT_MESSAGE )
		{
			$this->$regex = $regex;
		}

		/** @return TRUE if the the ciphertext matches the regular expression, giving at least one result */
		function canDecode( $ciphertext )
		{
			return eregi($this->$regex,$message,$this->$matches) > 0;
		}

		/** Extracts the core message using its regular expression, and calls the chain to return a totally decoded message */
		function decode( $ciphertext, $chain )
		{
			if ( defined($this->$matches) )
			{
				$cleartext = $chain->decode($matches[1]);
				delete $this->$matches;
				return $cleartext;
			}

			// canDecode() *must* be called before decode()
			return FALSE;
		}
	}



	/**
	 * A simple decoder that removes salt from a message.
	 * Salt is used to add randomness to a message : it can be removed safely
	 */
	class Desalter extends Depacketizer
	{
		/**
		 * Only this constructor needs to be defined, in order to pass the superclass
		 * the right regex to extract the salt from the message.
		 */
		function Desalter()
		{
			parent::Depacketizer('^salt[^:]*:(.*)$');
		}
	}



	/**
	 * This decoder transforms an hexadecimal string into its binary representation
	 */
	class HexDecoder extends Depacketizer
	{
		function HexDecoder()
		{
			parent::Depacketizer('^(?:hex:|0x)(.*)$');
		}

		function decode( $ciphertext, $chain )
		{
			// first step : let the base class extract the wanted message
			$message = parent::decode($ciphertext,$chain);

			if ( $message )
			{
				// second step : do hexadecimal-to-text conversion
				return pack("H*",$message);
			}

			return FALSE;
		}
	}



	/**
	 * Decodes base64 encoded texts
	 */
	class Base64Decoder extends Depacketizer
	{
		function Base64Decoder()
		{
			parent::Depacketizer('^(?:base64|b64):(.*)$');
		}

		function decode( $ciphertext, $chain )
		{
			// first step : let the base class extract the wanted message
			$message = parent::decode($ciphertext,$chain);

			if ( $message )
			{
				// second step : pass the message to the available decoders to get the raw value to work on
				$cleartext = $chain->decode($message);

				// final step : do hexadecimal-to-text conversion
				return pack("H*",$cleartext);
			if ( $base == 64 )
			{
				// we're already in the right radix, don't go further
				// (same can be done with other bases too, but right now we only need this one)
				return $tmpData;
			}
			$newData = base64_decode($tmpData);
			}

			return FALSE;
		}
	}



	// TODO : embed the key in the data (e.g. ciform:rsa:keyId:0x12345:0xdd33be2b17813b396d63dd1be9c72e9756bbd8ae5d5555b93a7f4b4fd5a8c80d:salt24325234)
	// TODO : use the responsibility chain to rewrite this function
	function ciform_decode( $data, $keyPair, $base=1 )
	{
		if ( CIFORM_DEBUG ) echo "ciform_decrypt($data,keyPair,$base)<br>";

		// $newData is going to be decoded by one of the following filters
		// then, it'll be encoded to the destination base
		$newData = $data;

		// this flag means this parameter is handled by this library
		if ( eregi('^'.CIFORM_REQUEST_PREFIX.'(.*)$',$data,$matches) > 0 )
		{
			$newData = ciform_decode($matches[1],$keyPair);
		}

		// this is just salt that adds randomness to the string : it can be removed safely
		else if ( eregi('^salt[^:]*:(.*)$',$data,$matches) > 0 )
		{
			$newData = ciform_decode($matches[1],$keyPair);
		}

		// this is an hexadecimal string
		else if ( eregi('^(hex:|0x)(.*)$',$data,$matches) > 0 )
		{
			$tmpData = ciform_decode($matches[2],$keyPair);
			$newData = pack("H*",$tmpData);
		}

		// this a base64 encoded string
		else if ( eregi('^(base64|b64):(.*)$',$data,$matches) > 0 )
		{
			$tmpData = ciform_decode($matches[2],$keyPair);
			if ( $base == 64 )
			{
				// we're already in the right radix, don't go further
				// (same can be done with other bases too, but right now we only need this one)
				return $tmpData;
			}
			$newData = base64_decode($tmpData);
		}

		// this is an encrypted message
		else if ( eregi('^'.CIFORM_KEYTYPE.':(.*)(:.+)?$',$data,$matches) > 0 )
		{
			$tmpData = ciform_decode($matches[1],$keyPair,64);

			// decrypts the data using the configured module
			$func = "ciform_".CIFORM_KEYTYPE."_decrypt";
			$newData = ciform_decode( $func($tmpData,$keyPair), $keyPair );
		}

		// FIXME : do better recursion : each case should return ciform_decode($tmpData) except if no encoding is detected (which then ends the recursion)
		// FIXME : put each case in a different 'decoder' class

		// encodes the data into the desired base
		switch( $base )
		{
			case 64:
				return base64_encode($newData);
			default:
				return $newData;
		}
	}



	function ciform_decryptParam( $data, $keyPair )
	{
		if ( gettype($data) == "string" && eregi('^'.CIFORM_REQUEST_PREFIX.'(.*)$',$data,$matches) > 0 )
		{
			return ciform_decode($matches[1],$keyPair);
		}
		return $data;
	}



	function ciform_decryptParams( $request, $keyPair )
	{
		$decoded = array();

		// accepts encrypted data from the client
		foreach ( $request as $key => $value )
		{
			$newValue = ciform_decryptParam($value,$keyPair);
			$decoded[$key] = $newValue;
		}

		return $decoded;
	}



	// returns the protocol of this script
	if ( isset($_REQUEST[CIFORM_REQUEST_PROTOCOL]) )
	{
		$func = "ciform_".CIFORM_KEYTYPE."_getProtocol";
		$name = $_REQUEST[CIFORM_REQUEST_PROTOCOL];
		header("Content-type: text/plain");
		// if a name was given, use it to name the variable :
		// the result may be used as a full (java)script
		if ( trim($name) != "" ) {
			echo "var $name = " . $func() . ";";
		}
		// if no name was given, just print the JSON value :
		// the result may be used as an Ajax response
		else {
			echo $func();
		}
		exit;
	}



	// makes sure the key is accessible
	// TODO : instanciate the given crypto class,
	// which stores itself the key and all other specific data
	// then, move the following code to the correct sub-script
	if ( !isset($_SESSION[CIFORM_SESSION]) )
	{
		$_SESSION[CIFORM_SESSION] = array();
	}
	if ( !isset($_SESSION[CIFORM_SESSION][CIFORM_SESSION_KEYPAIR]) )
	{
		// the encryption module's name is given by the defined key type
		$func = "ciform_".CIFORM_KEYTYPE."_getKeyPair";
		$_SESSION[CIFORM_SESSION][CIFORM_SESSION_KEYPAIR] = $func();
	}



	if ( CIFORM_AUTODECRYPT )
	{
		$_REQUEST = ciform_decryptParams($_REQUEST,$_SESSION[CIFORM_SESSION][CIFORM_SESSION_KEYPAIR]);
	}
?>