<?php
	require_once("Crypt/RSA.php");

	define("CIFORM_RSA_KEYTYPE","rsa");
	define("CIFORM_RSA_KEYSIZE",768);
	define("CIFORM_RSA_KEYSTORE","keys");
	define("CIFORM_RSA_KEYFILE_PEM",CIFORM_RSA_KEYSTORE."/protected/key-rsa.pem");
	define("CIFORM_RSA_KEYFILE_JS",CIFORM_RSA_KEYSTORE."/key-rsa.pub.json");
	define("CIFORM_RSA_REQUEST_GENKEY","ciform-genkey");



	/**
	 * This class extends Crypt_RSA_KeyPair by adding conversion functions to Javascript and to the Ciform protocol
	 */
	class Ciform_RSA_KeyPair extends Crypt_RSA_KeyPair
	{
		/**
		 * Transforms a big integer value into a JSON array of 28 bits integers
		 *
		 * @param string $binValue		The raw, binary string value of the big integer
		 * @param Crypt_RSA_Math_* $math	Optional math wrapper to use to manipulate large integers. Will use the current one if not specified.
		 * @see Crypt_RSA_KeyPair::$_math_obj
		 * @return string The number as a JSON structure
		 * @access private
		 */
		function bigInt2Json( $binValue, $math=$this->_math_obj )
		{
			$json = "[";
	
			$intValue = $math->bin2int($binValue);
			$szBits = $math->bitLen($intValue);	// total length, in bits
	
			for ( $b=0 ; $b<$szBits ; )
			{
				$l = min(28,$szBits-$b);
				$json .= $math->subint($intValue, $b, $l);
				$b += $l;
				if ( $b<$szBits )
				{
					$json .= ",";
				}
			}
	
			return $json."]";
		}



		/**
		 * Transforms an RSA public key into a JSON structure
		 *
		 * @param Crypt_RSA_KeyPair $keyPair	Optional RSA key pair holding the public key (use this if called from the class context).
		 * @return string The public key as a JSON structure
		 * @access private
		 */
		function pubKey2Json( $keyPair=$this )
		{
			$pubKey = $keyPair->getPublicKey();
			$math = $keyPair->_math_obj;
			$p = Ciform_RSA_KeyPair::bigInt2Json($keyPair->_attrs['p'],$math);
			$q = Ciform_RSA_KeyPair::bigInt2Json($keyPair->_attrs['q'],$math);
			$e = Ciform_RSA_KeyPair::bigInt2Json($pubKey->getExponent(),$math);
			$pq = Ciform_RSA_KeyPair::bigInt2Json($pubKey->getModulus(),$math);
			//$mpi = base64_encode($math->bin2int($pubKey->getModulus())+$math->bin2int($pubKey->getExponent()));
			$json = "{"
				."'type':'".CIFORM_RSA_KEYTYPE."',"
				."'size':".$pubKey->getKeyLength().","	// size of the key, in bits
				."'p':$p,"				// prime factor p, as an array of 28 bits integers
				."'q':$q,"				// prime factor q, as an array of 28 bits integers
				."'e':$e,"				// public exponent as an array of 28 bits integers
				."'pq':$pq}";				// modulus, as an array of 28 bits integers
				//."'mpi':'$mpi'"			// e + modulus, encoded into a base64 MPI string
			return $json;
		}



		/**
		 * Clones an existing key pair by copying its intrisinc fields into this one,
		 *
		 * @param Crypt_RSA_KeyPair $keyPair The key pair to copy
		 * @return $this
		 * @todo This implementation depends totally on the version of the superclass :
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
		function genKeyPair( $keySize, $pemFilename, $jsFilename, $force=FALSE )
		{
			// if the key has been stored to a file, get it from there
			if ( $contents = @file_get_contents($pemFilename) )
			{
				return Ciform_RSA_KeyPair::fromPEMString($contents);
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



	/**
	 * Ciform handler using the RSA cipher
	 */
	class Ciform_RSA
	{
		/**
		 * @return Ciform_RSA_KeyPair the current key pair (or a new one if none defined)
		 */
		function getKeyPair()
		{
			if ( CIFORM_DEBUG ) echo "ciform_rsa_getKeyPair() = ";
			$keyPair = Ciform_RSA_KeyPair::genKeyPair(CIFORM_RSA_KEYSIZE, CIFORM_RSA_KEYFILE_PEM, CIFORM_RSA_KEYFILE_JS);
			if ( CIFORM_DEBUG ) print_r($keyPair);
			return $keyPair;
		}



		/**
		 * @return string the current Ciform protocol
		 */
		function getProtocol()
		{
			if ( CIFORM_DEBUG ) echo "ciform_rsa_getProtocol() = ";
			// FIXME : serverURL must be absolute, so scripts can call it from other servers
			$serverURL = $_SERVER['PHP_SELF'];
			$keyPair = Ciform_RSA::getKeyPair();
			$protocol = "{
				'VERSION':".CIFORM_PROTOCOL_VERSION.",
				'PACKET_PREFIX':'".CIFORM_REQUEST_PREFIX."',
				'serverURL':'".str_replace("'","\\'",$serverURL)."',
				'pubKey':".$keyPair->pubKey2Json()
				."}";
			if ( CIFORM_DEBUG ) print_r($protocol);
			return $protocol;
		}



		/**
		 *
		 */
		function decrypt( $data, $keyPair )
		{
			if ( CIFORM_DEBUG ) echo "ciform_rsa_decrypt($data,keyPair)<br>";
			$privateKey = $keyPair->getPrivateKey();
			// TODO make the math object configurable, because there are big differences between them and to offer better compatibility
			$rsa = new Crypt_RSA($privateKey->getKeyLength(),'BCMath');
			return $rsa->decrypt($data,$privateKey);
		}
	}



	// keypair generation is forced if this parameter is set
	if ( isset($_SESSION[CIFORM_RSA_REQUEST_GENKEY]) )
	{
		$_SESSION[CIFORM_SESSION][CIFORM_SESSION_KEYPAIR] = Ciform_RSA_KeyPair::genKeyPair(CIFORM_RSA_KEYSIZE, CIFORM_RSA_KEYFILE_PEM, CIFORM_RSA_KEYFILE_JS, TRUE);
	}

?>