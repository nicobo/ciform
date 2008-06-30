<?php
//
// Ciform
//
// Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
//

/**
 * This is the PHP server side library for Ciform
 * @package ciform
 */


// TODO : load all files in ciform/schemes
require_once "ciform/schemes/core.php";
require_once "ciform/schemes/rsa.php";



//
// CONSTANTS DEFINITIONS
//


// Comment out the following line to enable debug traces from this script
//define("CIFORM_DEBUG",TRUE);

/** Prefix for the session variables for this library */
define("CIFORM_SESSION","CIFORM");

/**
 * Version number of the Ciform protocol implemented here
 * @type string
 */
define("CIFORM_PROTOCOL_VERSION","0");

/** If the request contains a parameter with this name, this script will print out the Ciform protocol rather than doing decryption */
define("CIFORM_REQUEST_PROTOCOL","protocol");

if ( ! defined("CIFORM_AUTODECRYPT") )
	/** Define this constant to TRUE in caller script to enable transparent decryption of the request */
	define("CIFORM_AUTODECRYPT", TRUE );

/**
 * List of the schemes taken in account for auto decryption.<br>
 *
 * Comment out the schemes you don't use in the following list.<br>
 * Add each (custom) scheme you want to the list to handle more schemes.<br>
 */
define("CIFORM_SCHEMES_DEFAULT",array(
		new Ciform_schemes_Ciform(),
		new Ciform_schemes_Base16(),
		new Ciform_schemes_Base64(),
		new Ciform_schemes_RSA()
	);



//
// CLASS 'ciform_Server'
//



/**
 * This class handles everything about Ciform on the server side.
 */
class ciform_Server
{
	/**
	 * @var Ciform_CipherChain Holds the decoders to use on the request parameters
	 * @access private
	 */
	var $codec;


	function ciform_Server( $schemes )
	{
		// registers all known schemes into a decoder chain
		$this->codec = new Ciform_CipherChain($schemes);
	}



	/**
	 * Decrypts all recognized parameters from the given request
	 *
	 * @param $request	An associative array containing the request parameters (use $_REQUEST)
	 * @return array	A copy of the input array, with values for all handled parameters decrypted
	 */
	function decodeParams( $request )
	{
		$decoded = array();

		// accepts encrypted data from the client
		foreach ( $request as $key => $value )
		{
			$decoded[$key] = $this->codec->decode($value);
		}

		return $decoded;
	}



	/**
	 * @return array the current Ciform protocol
	 */
	function getProtocol()
	{
		// FIXME : serverURL must be absolute, so scripts can call it from other servers
		$serverURL = $_SERVER['PHP_SELF'];

		$schemes = array();
		foreach ( $this->codec->ciphers as $cipher )
		{
			$schemes[$cipher->getName()] = $cipher->getParameters();
		}

		$protocol = array(
			'VERSION' => CIFORM_PROTOCOL_VERSION,
			'PACKET_PREFIX' => CIFORM_REQUEST_PREFIX,
			'serverURL' => str_replace("'","\\'",$serverURL),
			'schemes' => $schemes
			);

		if ( CIFORM_DEBUG ) echo "ciform_rsa_getProtocol() = ".print_r($protocol,TRUE)."<br>";

		return $protocol;
	}

}



//
// CASE 'PROTOCOL' : Called with the CIFORM_REQUEST_PROTOCOL parameter,
// this script is used to print the Ciform protocol parameters
//
if ( isset($_REQUEST[CIFORM_REQUEST_PROTOCOL]) )
{
	header("Content-type: text/plain");

	// instanciates a default Ciform server handler
	$ciform = new ciform_Server(CIFORM_SCHEMES_DEFAULT);

	// if a name was given, use it to name the variable :
	// the result may be used as a full (java)script
	if ( trim($name) != "" ) {
		echo "var $name = " . json_encode($ciform->getProtocol()) . ";";
	}
	// if no name was given, just print the JSON value :
	// the result may be used as an Ajax response
	else {
		echo json_encode($ciform->getProtocol());
	}

	exit;
}



//
// CASE 'AUTODECRYPT' : If set, this script will try to automatically decrypt all parameters of the current $_REQUEST,
// so the decryption phase is transparent to the next server scripts
//
if ( CIFORM_AUTODECRYPT )
{
	// instanciates a default Ciform server handler
	$ciform = new ciform_Server(CIFORM_SCHEMES_DEFAULT);

	// and replaces the request with the unencrypted one
	$_REQUEST = $ciform->decryptParams($_REQUEST);
}

?>