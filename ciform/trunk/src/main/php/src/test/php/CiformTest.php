<html>
<head>
	<title>Ciform basic non-regression tests</title>
</head>
<body><pre>
<?php
	ini_set("include_path", ini_get("include_path").PATH_SEPARATOR."/home/cbonar/src/ciform/src" );
	require_once 'PHPUnit/Framework.php';
	require_once "ciform/schemes/core.php";


	class CiformTest extends PHPUnit_Framework_TestCase
	{
	    protected function setUp()
	    {
		$this->p = "base64:aGVsbG8=";
		$this->p2 = "0x6e69636f";
		$this->p3 = "b64:MHg2ZTY5NjM2ZjBh";
	    }

	    public function testBase64()
	    {
		$s = new Ciform_schemes_Base64();

		$this->assertEquals("hello", $s->decode($this->p));
	    }

	    public function testBase16()
	    {
		$s = new Ciform_schemes_Base16();

		$this->assertEquals("nico", $s->decode($this->p2));
	    }

	    public function testChain()
	    {
		$s = new Ciform_CipherChain( array(
			new Ciform_schemes_Base16(),
			new Ciform_schemes_Base64()
			) );

		$this->assertEquals("nico\n", $s->decode($this->p3));
	    }
	}
?>
