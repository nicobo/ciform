/**
	@fileoverview

	This library provides specifications and basic functions to add encryption functionalities to an HTML form,
	therefore called "Ciform".

	@requires base64.js {@link www.haneWIN.de}
	@requires hex.js {@link www.haneWIN.de}
	@requires sha1.js {@link www.haneWIN.de}
	@requires rsa.js {@link www.haneWIN.de}
*/
// Data from the server is available in a literal object named 'CIFORM'
// e.g. { 'serverURL':"login.php", 'pubKey':{'type':'rsa', 'e':10000,'m':24} }

// TODO : define the Ciform protocol using constants that can change from one server to another
// This protocol would be retrieved from the server (either with a <script src> or using Ajax) so nothing is hard coded

// defines a namespace for this project
ciform = {}; // end of ns:ciform





//
// DEFAULT ENCODER
//



/**
	Implementations of an encoder must re-define all the defined method.
	@constructor
*/
ciform.Encoder = function()
{
}



/**
	The basic way to encode/encrypt a message.

	@param {String} message	The text to encrypt
	@return the encrypted message (ciphertext) : the result depends on the encoder
*/
ciform.Encoder.prototype.encode = function( message )
{
	return message;
}



//
// SHA-1 ENCODER
//



/**
	@param {Object} options	Default values :
		- 'preamble' = false (don't add meta-data in the beginning of the ciphertext)
	@constructor
*/
ciform.SHA1Encoder = function( options )
{
	this.options = options ? options : {'preamble':false};
}
ciform.SHA1Encoder.prototype = new ciform.Encoder();



/**
	@see ciform#Encoder#encode
	@return the sha-1 of the message, base64 encoded, with meta-data about the encoding if this.options['preamble'] is true
*/
ciform.SHA1Encoder.prototype.encode = function( message )
{
	console.debug(this,"encode(",message,")");
	return (this.options['preamble'] ? "sha1:b64:" : "") + b64_sha1(message);
};



//
// RSA ENCODER
//



/**
	@param {Object} pubKey	The public key to use for encryption : a dictionary with the following fields :
		- 'type' : must be 'rsa'
		- 'pq' : modulo of the RSA key
		- 'e' : exponent of the RSA key
		- 'mpi' (optional) : the RSA key as a base64 encoded mutli-precision integer
	@param {Object} options	Default values :
		- 'preamble' = false (don't add meta-data in the beginning of the ciphertext)
		- 'salt' = false (don't add salt in the beginning of the ciphertext : WARNING : without salt, the same message encoded with the same key will always give the same ciphertext)
		- 'checkPadding' = true (check that the padding scheme is correct : does not apply if salt is added)
	@throw TypeError if the public key is not correct
	@constructor
*/
ciform.RSAEncoder = function( pubKey, options )
{
	this.options = options ? options : {'preamble':false,'salt':false,'nopadding':false};

	if ( pubKey['type'] == "rsa" )
	{
		if ( pubKey['pq'] && pubKey['e'] )
		{
			this.pubKey = pubKey;
		}
		else
		{
			throw new TypeError("Public key is missing a field : both 'pq' and 'e' are required");
		}
	}
	else
	{
		throw new TypeError("Type of public key must be 'rsa'");
	}
};
ciform.RSAEncoder.prototype = new ciform.Encoder();



ciform.RSAEncoder.prototype.SALT_MAX = 9999;
ciform.RSAEncoder.prototype.SALT_MIN = 1;



ciform.RSAEncoder.prototype._getMPI = function()
{
	// this function can be called several times so we don't compute the following each time
	if ( ! this.pubKey['mpi'] )
	{
		this.pubKey['mpi'] = s2r(b2mpi(this.pubKey['pq'])+b2mpi([this.pubKey['e']])).replace(/\n/,'');
	}

	return this.pubKey['mpi'];
}



/**
	@return a random number between this.SALT_MIN and this.SALT_MAX
*/
ciform.RSAEncoder.prototype._getSalt = function()
{
	return Math.floor(Math.random() * (this.SALT_MAX - this.SALT_MIN + 1) + this.SALT_MIN);
}



/**
	Computes the maximum length the message should be to prevent attacks against RSA without padding
	(http://en.wikipedia.org/wiki/RSA#Padding_schemes)

	@return the max. length for a message to be encoded.
		In case salt is added to the ciphertext, the real max. length might be longer,
		because the salt has a variable length
	@see ciform.RSAEncoder#_getSalt
*/
ciform.RSAEncoder.prototype.maxLength = function()
{
	var s = r2s(this._getMPI());
	var l = Math.floor((s.charCodeAt(0)*256 + s.charCodeAt(1)+7)/8);

	var lmax = l - 4;

	if ( this.options['salt'] )
	{
		lmax -= new Number(this.SALT_MAX).toString().length;
	}

	console.debug(this,".maxLength()=",lmax);
	return lmax;
}



/**
	@see ciform.Encoder#encode
	@return the ciphertext of the message, encoded with the public RSA key of this encoder, with meta-data about the encoding if this.options['preamble'] is true
	@throws RangeError if the message is too long to be secure for the current public key (ignored if either 'salt' or 'nopadding' is true)
*/
ciform.RSAEncoder.prototype.encode = function( message )
{
	console.debug(this,"encode(",message,")");

	var mod=new Array();
	var exp=new Array();

	//var s = r2s(this._getMPI());
	//var l = Math.floor((s.charCodeAt(0)*256 + s.charCodeAt(1)+7)/8);

	//mod = mpi2b(s.substr(0,l+2));
	//exp = mpi2b(s.substr(l+2));

	mod = this.pubKey['pq'];
	exp = this.pubKey['e'];

	var saltMessage = message;
	if ( this.options['salt'] )
	{
		// some salt to randomize the string
		var salt = this._getSalt();
		console.debug("salt="+salt);
		saltMessage = "salt" + salt + ":" + message;
	}

	var p = saltMessage+String.fromCharCode(1);

	var maxLength = this.maxLength();
	if ( !this.options['nopadding'] && !this.options['salt'] && p.length > maxLength )
	{
	   throw new RangeError("Plain text length must be less than "+maxLength+" characters");
	}

	var b = s2b(p);

	// rsa-encrypts the result and converts into mpi
	var ciphertext = RSAencrypt(b,exp,mod);

	return (this.options['preamble'] ? "rsa:0x" : "") + s2hex(b2s(ciphertext));
};



//
// CHAIN ENCODER
//



/**
	This encoder simply combine encoders in a chain.
	For instance, the message will be first hashed through SHA-1, and then encrypted with a RSA key.
	@param {Array[ciform.Encoder]} encoders	A list with the instances of encoders to use (The chain starts with index 0)
*/
ciform.ChainEncoder = function( encoders )
{
	this.encoders = encoders;
};
ciform.ChainEncoder.prototype = new ciform.Encoder();



ciform.ChainEncoder.prototype.encode = function( message )
{
	var ciphertext = message;

	for ( var e=0 ; e<this.encoders.length ; e++ )
	{
		ciphertext = this.encoders[e].encode(ciphertext);
	}

	return ciphertext;
}



//
// CIFORM HANDLER
//



ciform.Ciform = function( form, pubKey )
{
	this.form = form;
	this.pubKey = pubKey;
}



/**
	This function should be called when the 'onsubmit' event happens.
	Its job is to encrypt 'input' fiels into 'output' fields.

	@param {Object} fields	An array with the inputs and outputs, like [ {'inputName1':'outputName1'}, {'inputName2':'outputName2'}, ... ].
			It can be either the DOM nodes, their id or name (in the latter, the second parameter must be set).
			Input and output can be the same : the input value will be replaced with the ciphertext.
	@param {HTMLFormElement} form	The object containing the fields (optional)
*/
ciform.Ciform.prototype.encryptFields = function( fields, onError )
{
	console.debug("encryptFields(",fields,onError,")");

	var done = [];

	for ( var f=0 ; f< fields.length ; f++ )
	{
		/*ciform.encryptFields([
			{'in':"f1",'out':"f2",'encoding':["hex","rsa","base64","sha1"]},
			{'in':"f3"},
			"f4"
			]);
		}*/
		// gets the nodes from either id, names or nodes
		var kIn = fields[f]['in'] ? fields[f]['in'] : fields[f];
		var kOut = fields[f]['out'] ? fields[f]['out'] : kIn;
		var nodIn = this.form ? this.form[kIn] : document.getElementById(kIn) ? document.getElementById(kIn) : kIn;
		var nodOut = this.form ? this.form[kOut] : document.getElementById(kOut) ? document.getElementById(kOut) : kOut;

		//var message = nodIn.value;

		var encoders = [];
		// takes care of one-level sha-1 encoding for such fields
		if ( /sha1/.test(nodOut.className) ) // FIXME : a more accurate filter
		{
			//message = b64_sha1(nodIn.value);
			if ( /ciform-sha1/.test(nodOut.className) )
			{
				// for this class we add meta-data
				// NOTE : message must not contain the ":" separator so it can be extracted later
				//message = "salt" + salt + ":b64:sha1:" + message;
				encoders.push( new ciform.SHA1Encoder({'preamble':true}) );
			}
			// fields to be encrypted are replaced with something else
			// because they're not supposed to be transmitted in clear
			// FIXME ? must respect character set and length of the original field
			//input_replacement = "";
			else
			{
				encoders.push( new ciform.SHA1Encoder() );
			}
		}
		encoders.push( new ciform.RSAEncoder(this.pubKey,{'preamble':true,'salt':true}) );
		var encoder = new ciform.ChainEncoder(encoders);

		// encrypts the output field using the server's public key
		//var key = CIFORM[CIFORM_ID_PUBKEY];
		//var ciphertext = "ciform:rsa:0x" + ciform_encryptMessage(message,key);

		try
		{
			var ciphertext = "ciform:" + encoder.encode(nodIn.value);
			done.push({'field':nodOut,'value':ciphertext});
			done.push({'field':nodIn,'value':""});
		}
		catch ( e )
		{
			// calls back the error handler if defined
			if ( onError )
			{
				onError.apply(null,[e]);
				return false;
			}
			else
			{
				throw e;
			}
		}
		/*// if everything went fine, stores the replacement values for later
		if ( ciphertext.length && ciphertext.length > 0 )
		{
			// TODO : lighter formalism : don't need to use formal object here
			done.push({'field':nodOut,'value':ciphertext});
			if ( input_replacement != null )
			{
				done.push({'field':input,'value':input_replacement});
			}
		}
		else
		{
			// could happen if the text's length doesn't fit with the key's length
			return false;
		}*/
	} // iterating over fields is over

	// replaces the values of the fiels (in the end, so that nothing is done if there's any error)
	for ( var f=0 ; f<done.length ; f++ )
	{
		done[f]['field'].value = done[f]['value'];
	}

	return true;
};
