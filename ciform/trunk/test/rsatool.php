<?php
//
// Ciform
//
// Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
//

require_once "ciform/schemes/rsa.php";


/** If the request contains a parameter with this name, this script will force the generation of a new RSA key pair */
define("CIFORM_RSA_REQUEST_GENKEY","ciform-genkey");


//
// Keypair generation is forced if this parameter is set
//
if ( isset($_REQUEST[CIFORM_RSA_REQUEST_GENKEY]) )
{
	$keySize = isset($_REQUEST['keySize']) ? $_REQUEST['keySize'] : CIFORM_RSA_DEAULT_KEYSIZE;
	$pemFile = isset($_REQUEST['pemFile']) ? $_REQUEST['pemFile'] : CIFORM_RSA_DEFAULT_PEMFILE;
	$jsFile = isset($_REQUEST['jsFile']) ? $_REQUEST['jsFile'] : CIFORM_RSA_DEFAULT_JSFILE;
	$forceGen = isset($_REQUEST['forceGen']) ? $_REQUEST['forceGen'] : TRUE;

	ciform_schemes_rsa_KeyPair::getInstance(NULL, $keySize, $pemFile, $jsFile, $forceGen);
}

?>