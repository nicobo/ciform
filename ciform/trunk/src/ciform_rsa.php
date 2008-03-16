<?php
	require_once("Crypt/RSA.php");

	define("CIFORM_RSA_KEYTYPE","rsa");
	define("CIFORM_RSA_KEYSIZE",768);
	define("CIFORM_RSA_KEYSTORE","keys");
	define("CIFORM_RSA_KEYFILE_PEM",CIFORM_RSA_KEYSTORE."/protected/key-rsa.pem");
	define("CIFORM_RSA_KEYFILE_JS",CIFORM_RSA_KEYSTORE."/key-rsa.pub.js");
	define("CIFORM_RSA_REQUEST_GENKEY","ciform-genkey");


	// TODO : include the following functions in a class inheriting from RSA_KeyPair


	/**
		Transforms a big integer value into a JSON array of 28 bits integers
	*/
	function ciform_rsa_bigInt2Json( $math, $binValue )
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



	function ciform_rsa_pubKey2Json( $keyPair )
	{
		$pubKey = $keyPair->getPublicKey();
		$math = $keyPair->_math_obj;
		$p = ciform_rsa_bigInt2Json($math,$keyPair->_attrs['p']);
		$q = ciform_rsa_bigInt2Json($math,$keyPair->_attrs['q']);
		$e = ciform_rsa_bigInt2Json($math,$pubKey->getExponent());
		$pq = ciform_rsa_bigInt2Json($math,$pubKey->getModulus());
		//$mpi = base64_encode($math->bin2int($pubKey->getModulus())+$math->bin2int($pubKey->getExponent()));
		$json = "{"
			."'type':'".CIFORM_RSA_KEYTYPE."'"
			.","
			."'size':".$pubKey->getKeyLength()	// size of the key, in bits
			.","
			."'p':$p"				// prime factor p, as an array of 28 bits integers
			.","
			."'q':$q"				// prime factor q, as an array of 28 bits integers
			.","
			."'e':$e"				// public exponent as an array of 28 bits integers
			.","
			."'pq':$pq"				// modulus, as an array of 28 bits integers ; not required (=p*q)
			//.","
			//."'mpi':'$mpi'"				// e + modulus, encoded into a base64 MPI string
			."}";
		return $json;
	}



	/**
		Uses an existing keypair stored in a file or generates a new one
	*/
	function ciform_rsa_genKeyPair( $keySize, $pemFilename, $jsFilename, $force=FALSE )
	{
		// if the key has been stored to a file, get it from there
		if ( $contents = @file_get_contents($pemFilename) )
		{
			return Crypt_RSA_KeyPair::fromPEMString($contents);
		}

		// else, generate a new key and try to store it to a file
		else
		{
			// generates the key
			$keyPair = new Crypt_RSA_KeyPair($keySize);

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
				$serverURL = $_SERVER['PHP_SELF'];
				$pubKey = ciform_rsa_pubKey2Json($keyPair);
				$jsContents .= "\nvar CIFORM = {'serverURL':'".str_replace("'","\\'",$serverURL)."', 'pubKey':$pubKey};";
				@file_put_contents($jsFilename,$jsContents);
			}

			// returns the newly created key
			return $keyPair;
		}
	}



	function ciform_rsa_getKeyPair()
	{
		if ( CIFORM_DEBUG ) echo "ciform_rsa_getKeyPair() = ";
		$keyPair = ciform_rsa_genKeyPair(CIFORM_RSA_KEYSIZE, CIFORM_RSA_KEYFILE_PEM, CIFORM_RSA_KEYFILE_JS);
		if ( CIFORM_DEBUG ) print_r($keyPair);
		return $keyPair;
	}



	function ciform_rsa_decrypt( $data, $keyPair )
	{
		if ( CIFORM_DEBUG ) echo "ciform_rsa_decrypt($data,keyPair)<br>";
		$privateKey = $keyPair->getPrivateKey();
		$rsa = new Crypt_RSA($privateKey->getKeyLength(),'BCMath');
		return $rsa->decrypt($data,$privateKey);
	}



	// keypair generation is forced if this parameter is set
	if ( isset($_SESSION[CIFORM_RSA_REQUEST_GENKEY]) )
	{
		$_SESSION[CIFORM_SESSION][CIFORM_SESSION_KEYPAIR] = ciform_rsa_genKeyPair(CIFORM_RSA_KEYSIZE, CIFORM_RSA_KEYFILE_PEM, CIFORM_RSA_KEYFILE_JS, TRUE);
	}

?>