<?php
 	ini_set("include_path", ini_get("include_path").PATH_SEPARATOR."/home/cbonar/src/ciform/src" );

	require_once "ciform/schemes/core.php";
?>
    <style>
        .highlight { background-color:yellow; }
    </style>
<?php

	echo "<pre>";

	$s = new Ciform_schemes_Base64();
// 	print_r($s);

	$p = "base64:aGVsbG8=";

// 	echo "<span class='highlight'>"."base64_encode(hello)=".base64_encode('hello')."</span>"."<br>";
// 
// 	echo "<span class='highlight'>"."decode($p)=[".$s->decode($p)."]."</span>"<br>";

	$p2 = "0x6e69636f0a";

	$s2 = new Ciform_schemes_Base16();
// 	print_r($s2);
// 
// 	echo "<span class='highlight'>"."decode($p2)=".$s2->decode($p2)."</span>";

	$p3 = "b64:MHg2ZTY5NjM2ZjBh";

	$s3 = new Ciform_CipherChain( array($s,$s2) );

	echo "<span class='highlight'>"."decode($p3)=".$s3->decode($p3)."</span>";

	echo "</pre>";
?>