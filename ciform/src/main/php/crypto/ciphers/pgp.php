<?php
	define("CIFORM_KEYTYPE_PGP_RSA","pgp_rsa");
	define("CIFORM_KEYTYPE_PGP_ELGAMAL","pgp_elgamal");



	function ciform_pgp_rsa_pubKey2Json( $pubKey )
	{
		return "{'type':'".CIFORM_KEYTYPE_PGP_RSA."', keyId:'".$pubKey->getKeyId()."' 'mpib64Value':'".$pubKey->getMPIBase64()."'};";
	}
?>