<?php
//
// Ciform
//
// Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
//

require_once "crypto/ciphers/core.php";
require_once("Crypt/RSA.php");


/** Name of the entry in $_SESSION that will hold the current RSA key pairs */
define("CIFORM_RSA_SESSION_KEYRING","CIFORM_RSA_SESSION_KEYRING");
/** Default size, in bits, of the keys to generate */
define("CIFORM_RSA_DEFAULT_KEYSIZE",768);
/** Path to the .PEM file containing the default key pair */
define("CIFORM_RSA_DEFAULT_PEMFILE","keys/protected/key-rsa.pem");
/** Path to the .json file containing the default public key */
define("CIFORM_RSA_DEFAULT_JSFILE","keys/key-rsa.pub.json");


// TODO : embed the key in the data (e.g. ciform:rsa:keyId:0x12345:0xdd33be2b17813b396d63dd1be9c72e9756bbd8ae5d5555b93a7f4b4fd5a8c80d:salt24325234)

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



/**
 * This class extends Crypt_RSA_KeyPair by adding conversion functions in order to conform to the Ciform protocol
 *
 * @package ciform
 * @subpackage schemes.rsa
 */
class crypto_ciphers_rsa_KeyPair extends Crypt_RSA_KeyPair
{
	/**
	 * Transforms a big integer value into an array of 28 bits integers
	 *
	 * @param string $binValue		The raw, binary string value of the big integer
	 * @param Crypt_RSA_Math_* $math	Optional math wrapper to use to manipulate large integers. Will use the current one if not specified.
	 * @see Crypt_RSA_KeyPair::$_math_obj
	 * @return array The number as an array of 28 bits integers
	 * @access private
	 * @static
	 */
	function bigInt2Array( $binValue, $math=$this->_math_obj )
	{
		$export = array();

		$intValue = $math->bin2int($binValue);
		$szBits = $math->bitLen($intValue);	// total length, in bits

		for ( $b=0 ; $b<$szBits ; )
		{
			$l = min(28,$szBits-$b);
			$export[$b] = $math->subint($intValue, $b, $l);
			$b += $l;
		}

		return $export;
	}



	/**
	 * Exports a RSA public key into an associative array, ready for JSON transformation
	 *
	 * @param Crypt_RSA_KeyPair $keyPair	Optional RSA key pair holding the public key (use this if called from the class context).
	 * @return array			The public key as an associative array
	 * @access private
	 */
	function pubKey2Array( $keyPair=$this )
	{
		$pubKey = $keyPair->getPublicKey();
		$math = $keyPair->_math_obj;
		$p = crypto_ciphers_rsa_KeyPair::bigInt2Array($keyPair->_attrs['p'],$math);
		$q = crypto_ciphers_rsa_KeyPair::bigInt2Array($keyPair->_attrs['q'],$math);
		$e = crypto_ciphers_rsa_KeyPair::bigInt2Array($pubKey->getExponent(),$math);
		$pq = crypto_ciphers_rsa_KeyPair::bigInt2Array($pubKey->getModulus(),$math);
		//$mpi = base64_encode($math->bin2int($pubKey->getModulus())+$math->bin2int($pubKey->getExponent()));

		$export = array(
			'type' =>  "rsa",
			'size' => $pubKey->getKeyLength(),	// size of the key, in bits
			'p' => $p,				// prime factor p, as an array of 28 bits integers
			'q' => $q,				// prime factor q, as an array of 28 bits integers
			'e' => $e,				// public exponent as an array of 28 bits integers
			'pq' => $pq;				// modulus, as an array of 28 bits integers
			//'mpi' => $mpi				// e + modulus, encoded into a base64 MPI string
			);

		return $export;
	}



	/**
	 * Clones an existing key pair by copying its intrisinc fields into this one,
	 *
	 * @param Crypt_RSA_KeyPair $keyPair The key pair to copy
	 * @return $this
	 * FIXME This implementation totally depends on private parts of the superclass :
	 * 	if a field is added or removed, this method can very possibly fail to do its job
	 * @private
	 */
	function copy( $keyPair )
	{
		$this->$_math_obj = $keyPair->$_math_obj;
		$this->$_key_len = $keyPair->$_key_len;
		$this->$_public_key = $keyPair->$_public_key;
		$this->$_private_key = $keyPair->$_private_key;
		$this->$_random_generator = $keyPair->$_random_generator;
		$this->$_attrs = $keyPair->$_attrs;
		return $this;
	}



	/**
	 * This method is overriden to instanciate an object from the same class as the current object
	 * @see Crypt_RSA_KeyPair::fromPEMString
	 * @todo This should be done in the superclass : it should dynamically return a new instance of the current class
	 */
	function &fromPEMString($str, $wrapper_name = 'default', $error_handler = '')
	{
		$keyPair1 = parent::fromPEMString($str,$wrapper_name,$error_handler);
		$keyPair2 = new Crypt_RSA_KeyPair();
		$keyPair2->copy($keyPair1);
		return $keyPair2;
	}



	/**
	 * Uses an existing key pair stored in a file or generates a new one.
	 *
	 * If the PEM file exist, the key pair will be read from it. If it doesn't, the key pair will be generated.<br>
	 * Upon generation of a new key pair, both a PEM and a Javascript file will be created if they don't exist already.
	 *
	 * @param int $keySize		Size of the key to generate, in bits
	 * @param string $pemFilename	Name of the file where a PEM formated keypair may be found / stored
	 * @param string $jsFilename	Name of the file where to store the key upon generation as a Javascript script
	 * @param boolean $force	Forces generation of both the PEM and the Javascript file. If false, the files will not be overwritten if they exist already.
	 * @access private
	 * @static
	 */
	function getInstance( $keyId, $keySize, $pemFilename, $jsFilename, $force=FALSE )
	{
		// first of all, if the key is in the current session, retrieve it
		if ( isset($keyId) && isset($_SESSION[CIFORM_RSA_SESSION_KEYRING][$keyId]) )
		{
			return $_SESSION[CIFORM_RSA_SESSION_KEYRING][$keyId];
		}

		// second chance : if the key has been stored to a file, get it from there
		if ( $contents = @file_get_contents($pemFilename) )
		{
			return crypto_ciphers_rsa_KeyPair::fromPEMString($contents);
		}

		// else, generate a new key and try to store it to a file
		else
		{
			// generates the key
			$keyPair = new Ciform_RSA_KeyPair($keySize);

			// stores as PEM
			if ( $force || !@file_exists($pemFilename) )
			{
				@mkdir(dirname($pemFilename),0777,TRUE);
				@file_put_contents($pemFilename,$keyPair->toPEMString());
			}

			// store some Javascript variables, including the public key
			// FIXME : if file_put_contents fails, no notification but the file is never written
			if ( $force || !@file_exists($jsFilename) )
			{
				@mkdir(dirname($jsFilename),0777,TRUE);
				// FIXME : serverURL must be absolute, so scripts can call it from other servers
				//$serverURL = $_SERVER['PHP_SELF'];
				$pubKey = $keyPair->pubKey2Json();
				//$jsContents = "\nvar CIFORM = {'serverURL':'".str_replace("'","\\'",$serverURL)."', 'pubKey':$pubKey};";
				@file_put_contents($jsFilename,$pubKey);
			}

			// returns the newly created key
			return $keyPair;
		}
	}
}



class crypto_ciphers_RSA extends crypto_Cipher
{
	var $keyPair;
	var $cipher;


	function crypto_ciphers_RSA( $keyPair )
	{
		if ( CIFORM_DEBUG ) echo "new crypto_ciphers_RSA()<br>";

		$this->keyPair = $keyPair;

		// TODO make the math object configurable, because there are big differences between them and to offer better compatibility
		$this->cipher = new Crypt_RSA($this->getPrivateKey->getKeyLength(),'BCMath');

		if ( CIFORM_DEBUG ) echo "keyPair=".print_r($keyPair,TRUE)."<br>";
	}


	function &getInstance( $keyId, $keySize=CIFORM_RSA_KEYSIZE, $pemFile=CIFORM_RSA_KEYFILE_PEM, $jsFile=CIFORM_RSA_KEYFILE_JS, $forceGen=FALSE )
	{
		return new crypto_ciphers_RSA( crypto_ciphers_rsa_KeyPair::getInstance($keyId,$keySize,$pemFile,$jsFile,$forceGen) );
	}


	function decode( $ciphertext )
	{
		if ( CIFORM_DEBUG ) echo print_r($this,TRUE)."->decode($ciphertext)<br>";

		return $rsa->decrypt( $ciphertext, $keyPair->getPrivateKey() );
	}
}



/**
 * Ciform handler using the RSA cipher
 */
class Ciform_schemes_RSA extends Ciform_SimpleScheme
{
	var $keyId;
	var $keySize;
	var $pemFile;
	var $jsFile;
	var $forceGen;


	function Ciform_schemes_RSA( $keyId=NULL, $keySize=CIFORM_RSA_KEYSIZE, $pemFile=CIFORM_RSA_KEYFILE_PEM, $jsFile=CIFORM_RSA_KEYFILE_JS, $forceGen=FALSE )
	{
		parent::Ciform_SimpleScheme("rsa",'/^rsa:(.*)(:.+)?$/i');
		$this->keyId = $keyId;
		$this->keySize = $keySize;
		$this->pemFile = $pemFile;
		$this->jsFile = $jsFile;
		$this->forceGen = $forceGen;
	}


	function export()
	{
		return array( 'pubKey' => $this->getKeyPair()->pubKey2Array() );
	}


	function getDecoder( $packet )
	{
		if ( CIFORM_DEBUG ) { echo print_r($this,TRUE)."->getDecoder($packet)"."\n"; }

		if ( $this->unpack($packet) )
		{
			return crypto_ciphers_RSA::getInstance( $this->keyId, $this->keySize, $this->pemFile, $this->jsFile, $this->forceGen );
		}

		return FALSE;
	}
}

?>