<?php
	set_time_limit(60);	// for tests with long-sized keys
	set_include_path("/opt/PEAR/".PATH_SEPARATOR.get_include_path());
	set_include_path(get_include_path().PATH_SEPARATOR."../src/");
	define("CIFORM_AUTODECRYPT",FALSE);
	define("CIFORM_DEBUG",TRUE);
	require_once("ciform.php");
?><html>
	<head>
		<link rel="stylesheet" href="ciform.css" media="screen">
		<script type="text/javascript" src="../target/libciform.js"></script>
		<script type="text/javascript" src="../src/ciform.js"></script>
		<script type="text/javascript" src="keys/key-rsa.pub.js"></script>
	</head>

	<body>

		<h1>Test page for Ciform</h1>

		<h2>1. Key generation</h2>

		<?php
			$keyPair = ciform_rsa_getKeyPair();
			$pubKey = $keyPair->getPublicKey();
			$math = $keyPair->_math_obj;
		?>

		<p>The key is either read from a file or generated on the fly if no file was found.<br>
		It is served to the client as JSON data :</p>
		<code><?= "var CIFORM_PUBKEY =" . ciform_rsa_pubKey2Json($keyPair) . ";" ?></code>



		<h2>2. Encryption on the client side</h2>

		<?php
			// creating Crypt_RSA object
			//$rsa = new Crypt_RSA;
			$rsa = new Crypt_RSA($pubKey->getKeyLength(),'BCMath');

			$plain_data = isset($_REQUEST['out']) ? ciform_decryptParam($_REQUEST['out'],$keyPair) : "password";

			// encryption (usually using public key)
			$enc_data_base64 = $rsa->encrypt($plain_data, $keyPair->getPublicKey());
			$enc_data_bin = base64_decode($enc_data_base64);
			$enc_data_hex = bin2hex($enc_data_base64);

			// decryption (usually using private key)
			$dec_data = $rsa->decrypt($enc_data_base64, $keyPair->getPrivateKey());
		?>

		<p>The user types in a password, and Javascript encodes it.
		</p>

		<p>On the server side, the message "<span class="txt"><?= $plain_data ?></span>" would be encoded this way :</p>
		<ol>
			<li>Original : <span class="txt"><?= $plain_data ?></span>
			<li>Encrypted (ciphertext in base 64) : <span class="b64"><?= $enc_data_base64 ?></span>
			<li>Decoded : <span class="txt"><?= $dec_data ?></span>

		</ol>
		<p>Extra :</p>
		<ul>
			<li>Original message sha-1 then base64 encoded : <span class="b64"><?= base64_encode(sha1($password,TRUE)) ?></span>
			<li>Ciphertext in binary form (not really printable) : <span class="bin"><?= $enc_data_bin ?></span>
			<li>Ciphertext in hexadecimal form : <span class="hex"><?= $enc_data_hex ?></span>
		</ul>

		<p>On the client side, it's the same, handled in Javascript :</p>
		<form action="test.php" id="myForm">
			<ol>
				<li>The public key in Multi-Precision Integer (MPI), base64-encoded, which is going to be used for encryption : <input type="text" class="b64" id="mpi" size="120"><br>

				<br><br>

				<li>Type your message : <input type="text" class="txt" id="in" size="80"><br><span id="howmuchchars"></span> characters maximum.

				<br><br>

				<li>Encrypt the message on the client side (nothing is transmitted over the network yet) :<br>
					<input type="button" onclick="javascript:test_encrypt();" value="ENCRYPT">
					=&gt; <input type="text" class="b64" name="out" id="out" size="80"> <span id="howlong"></span><br>
					The encoded value also holds meta-data about the exact encoding algorithm.
				<br><br>

				<li>Send the encrypted data to the server : <input type="submit" value="SUBMIT">

				<br><br>

			</ol>
		</form>



		<h2>3. Decrypted on the server side using the same key pair</h2>

		<p>The generated keypair was stored and retrieved for decoding :</p>

		<p>Each parameter of the request is decrypted if required :</p>
		<p><table style="border:solid black 1px; border-collapse:collapse;" width="480px">
		<tr><th>KEY</th><th>VALUE</th><th>DECRYPTED</th></tr>
		<?php
			foreach( $_REQUEST as $key => $val )
			{
				$dec = ciform_decryptParam($val,$keyPair);
				if ( $key == "out" )
				{
					echo "<tr>";
					echo "<td class='code'><b>$key</b></td>";
					echo "<td class='txt'><b><code>" . chunk_split($val,76,"\n") . "</code></b></td>";
					echo "<td class='hex'><b>$dec</b></td>";
					echo "</tr>";
				}
				else
				{
					echo "<tr>";
					echo "<td class='code'>$key</td>";
					echo "<td class='txt'>$val</td>";
					echo "<td class='hex'>$dec</td>";
					echo "</tr>";
				}
			}
		?></table></p>

	<br><br><br>

	</body>

	<!-- Some initialisations -->
	<script type="text/javascript">
	//<!--
		function test_encrypt()
		{
			var cif = new ciform.Ciform(document.getElementById('myForm'),CIFORM['pubKey']);
			var start = new Date();
			var ciphertext = cif.encryptFields([{'in':"in",'out':"out"}],alert);
			var end = new Date();
			//document.getElementById('out').value = ciphertext;
			document.getElementById('howlong').innerHTML = (end.getTime() - start.getTime()) / 1000 + " s";
		}

		var mpi = s2r(b2mpi(CIFORM['pubKey']['pq'])+b2mpi([CIFORM['pubKey']['e']])).replace(/\n/,'');
		document.getElementById('mpi').value = mpi;

		var s = r2s(mpi);
		document.getElementById('howmuchchars').innerHTML = Math.floor((s.charCodeAt(0)*256 + s.charCodeAt(1)+7)/8) - 3;
	//-->
	</script>

</html>