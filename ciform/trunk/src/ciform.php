<?php
	// constants exportable to included scripts
	define("CIFORM_SESSION","CIFORM");
	define("CIFORM_PROTOCOL_VERSION",0);
	define("CIFORM_REQUEST_PREFIX","ciform:");
	define("CIFORM_SESSION_KEYPAIR","KEYPAIR");	// TODO : move to ciform_rsa.php
	if ( ! defined("CIFORM_DEBUG") ) define("CIFORM_DEBUG",FALSE);

	require_once("ciform_rsa.php");

	// private constants
	define("CIFORM_REQUEST_PROTOCOL","protocol");
	define("CIFORM_KEYTYPE",CIFORM_RSA_KEYTYPE);	// choose the desired encryption module here
	if ( ! defined("CIFORM_AUTODECRYPT") ) define("CIFORM_AUTODECRYPT", TRUE );



	// TODO : embed the key in the data (e.g. ciform:rsa:keyId:0x12345:0xdd33be2b17813b396d63dd1be9c72e9756bbd8ae5d5555b93a7f4b4fd5a8c80d:salt24325234)
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