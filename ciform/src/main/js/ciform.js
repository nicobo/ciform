/*!
	Copyright (c) 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
*/

(function( $defined, Crypto, console ) {


/**
 *	@fileoverview
 *
 *	<p>This library provides specifications and basic functions to add encryption to HTML form elements.</p>
 *
 *
 *	<p>Home : <a href="http://ciform.googlecode.com">http://ciform.googlecode.com</a></p>
 *
 *	<p>It does not contain cryptographic functions ; it's more a 'user-friendly' wrapper
 *	around cryptographic functions, dedicated to securing web forms.
 *	</p>
 *
 *	<p>It has 2 layers :<ol>
 *		<li>the {@link Ciform.ciphers} namespace contains the (external) encoders used by Ciform.
 *		 	This is the layer that really deals with the cryptographic functions.<br>
 *		<li>the {@link Ciform} top, 'user' layer contains classes dedicated to encryption of the data
 *			being exchanged between the client and the server.<br>
 *		</ol>
 *	</p>
 *
 *	<h5><b>Example 1 : encrypting password fields</b></h5>
 *
 *	<p>This way you define a simple encryption on all password fields of a form, that will take place when it is submitted.</p>
 *	<code><pre>
 * &lt;HEAD&gt;
 * ...
 * &lt;SCRIPT type="text/javascript"&gt;
 *	// pubKey is defined elsewhere : it is the public key used by the default RSA encoder
 *	var mycipher = new {@link Ciform.Cipher}({'pubKey':pubkey});
 * &lt;/SCRIPT&gt;
 * ...
 * &lt;/HEAD&gt;
 * ...
 * &lt;FORM action="http://myserver/mypage.php" onsubmit="mycipher.encryptForm(this,{'allowTypes':"password"});"&gt;
 * ...
 *	</pre></code>
 *
 *	<h5><b>Example 2 : different types of encryption within the same page</b></h5>
 *
 *	<p>You can use several {@link Ciform.Cipher} objects at the same time.</p>
 *	<code><pre>
 * var toServer1 = new {@link Ciform.Cipher}({'pubKey':pubkey1});
 * // in the following line the server is not the same one, so the public key is different
 * var toServer2 = new {@link Ciform.Cipher}({'pubKey':pubKey2});
 * ...
 * toServer1.encryptForm(document.forms[1]);
 * ...
 * toServer2.encryptField($('#country'));
 *	</pre></code>
 *	</p>
 *
 *	<h5><b>Example 3 : using the same object to encrypt different fields</b></h5>
 *
 *	<code><pre>
 * var ciform = new {@link Ciform.Cipher}({'pubKey':pubkey});
 * ...
 * // encrypts an input field : the encrypted value will replace its current value ; see  {@link Ciform.Cipher#encryptField}
 * ciform.encryptField(document.getElementById('myFieldId'));
 * ...
 * // encrypts the parameters in a URL (and replaces the original value) : {@link Ciform.Cipher#encryptURL}
 * document.getElementById('anAnchor').href = ciform.encryptURL(document.getElementById('anAnchor').href);
 *	</pre></code>
 *
 *	@author <a href="http://nicobo.net/contact">nicobo</a>
 */



//
// NAMESPACE : Ciform.*
//



/**
	@namespace Defines a namespace for this project.
		<p>NOTE : The first letter is in upper case mainly to prevent errors like using 'ciform' to name a variable,
		and because it should also be considered as an Object containing the definitions of this library.<br>
		It is not very clean since other namespaces are named with lower case characters, but there's currently no perfect solution in Javascript.</p>
*/
Ciform = {};



/**
	@namespace This namespace contains the constants required for the client to communicate with the server.<br>

		<p>Data from the server is served as a literal object indexed with some of those constants.<br>
		e.g. <code>{ 'serverURL':"login.php", 'pubKey':{'type':'rsa', 'e':10000,'pq':24} }</code>.</p>

		<p>The normal behavior is to retrieve the protocol from the server and to compare it to the one of this library,
		in order to know if they're compatible.</p>
*/
Ciform.protocol = {};
Ciform.protocol.prototype = new Object();

/**
	Version of the protocol (updated when the protocol changes)
	@type String
*/
Ciform.protocol.VERSION = "0";

/**
	Prefix to use for a ciform 'packet' to decode :
	HTTP request parameters beginning with this String will be considered as 'Ciform-encoded' values.
	@type String
*/
Ciform.protocol.PACKET_PREFIX = "ciform:";



//
// CLASS Field
//



/**
	@class This technical class represents an {@link HTMLElement} to be encrypted and its options.

	<p>Actually, it designates where to read the value from,
	possibly where to write the encoded value into,
	and some options / properties.</p>

	@param {HTMLFormElement} target
		The element to encrypt.<br>
		As an alternative, this parameter can be ignored if the input field is given in the options.
	@param {Object} [options]
		Overrides the properties of this object.
	@constructor
*/
Ciform.Field = function( target, options )
{
	// allows us to refer to 'options' even when only 1 argument was given
	if ( !$defined(options) ) {
		options = target;
	}

	//
	// PUBLIC PART
	//

	/**
		Input field : where to read the text to encode.
		Must have a readable <em>value</em> property.
		@type HTMLElement
	*/
	this.input = target instanceof HTMLElement ? target : options['input'];

	/**
		Output field : the field where to write the encoded text into.
		Must have a writeable <em>value</em> property.
		@default <a href="#input">input</a>
		@type HTMLElement
	*/
	this.output = $defined(options['output']) ? options['output'] : this['input'];

	/**
		<ul>
		<li>If == 1, indicates that this field should be SHA1-encoded before encryption.
		<li>If == 2, meta-data will also be prepended to the result.
		</ul>
		@default 0 (do not use SHA-1 at all)
		@type Integer
	*/
	this.sha1 = $defined(options['sha1']) ? options['sha1'] : 0;

	//
	// PRIVATE PART
	//

	/**
		Takes the value of the encrypted text on encryption.
		@private
	*/
	this._ciphertext = null;

	/**
		Applies the encryption value stored in {@link #_ciphertext} to the output field
		and clears the input field so it is not transmitted in clear if it's different from the output one.
		@private
	*/
	this._commit = function()
	{
		// 1. clears the input value
		// FIXME ? must respect character set and length of the original field
		this['input'].value = "";

		// 2. applies the encrypted value to the output field
		this['output'].value = this._ciphertext;
	};
};
Ciform.Field.prototype = new Object();



//
// NAMESPACE : Ciform.ciphers.*
//



/**
	@namespace This namespace contains a wrapper class for each supported encryption method :
		it's a way to normalize encryption and to provide the upper layer an homogenous API.
		This is the layer that really deals with the cryptographic functions.<br>

		<p>One goal of that layer is to provide a set of functions for encrypting data
		without requiring to know the internals of the choosen cipher.</p>

		<p>All encoders follow the {@link Ciform.ciphers.Encoder} interface.</p>
*/
Ciform.ciphers = {};



/**
	@class An encoder provides a way to encode/encrypt a message.
		Implementations of an encoder must re-define all of the methods of this class.
*/
Ciform.ciphers.Encoder = function(){
};



/**
	The basic way to encode/encrypt a message.

	@param {String} message	The text to encrypt
	@return the encrypted message (ciphertext) : the result depends on the encoder
	@type String
*/
Ciform.ciphers.Encoder.prototype.encode = function( message )
{
	return message;
};



//
// SHA-1 ENCODER
//



/**
	@class Encodes a text into its sha1 sum.
	@param {Object} options overrides the fields of this object.
	@constructor
*/
Ciform.ciphers.SHA1Encoder = function( options )
{

	/**
		If true, meta-data will be prepended to the result of encryption.
		@default false
		@type boolean
	*/
	this.preamble = false;

	this.extend(options);
};
Ciform.ciphers.SHA1Encoder.prototype = new Ciform.ciphers.Encoder();



/**
	@see Ciform.ciphers.Encoder#encode
	@return the sha-1 of the message, base64 encoded, with meta-data about the encoding if {@link #preamble} is true
*/
Ciform.ciphers.SHA1Encoder.prototype.encode = function( message )
{
	console.debug(this,"encode(",message,")");
	return (this['preamble'] ? "sha1:b64:" : "") + Crypto.SHA1.b64_sha1(message);
};



//
// RSA ENCODER
//



/**
	@class Formal description of a public RSA key.
	@constructor
*/
Ciform.ciphers.RSAPublicKey = function()
{
	// NOTE : this code is a formal description ; it is not functional. It is, however, syntaxically correct.

	/** Type of the key : must be "rsa".
	@type String */
	this.type = "rsa";
	/** (not used) Size of the key, in bits
	@type Number */
	this.size = Number;
	/** Public exponent as an array of 28 bits integers
	@type Array(Number) */
	this.e = Array(Number);
	/** (not used) Prime factor p, as an array of 28 bits integers
	@type Array(Number) */
	this.p = Array(Number);
	/** (not used) Prime factor q, as an array of 28 bits integers
	@type Array(Number) */
	this.q = Array(Number);
	/** Modulus, as an array of 28 bits integers
	@type Array(Number) */
	this.pq = Array(Number);
	/** (not used) e + modulus, encoded into a base64 <b>M</b>ulti-<b>P</b>recision <b>I</b>nteger string
	@type Array(Number) */
	this.mpi = Array(Number);
};



/**
	@class This encoder can encrypt a message given a public key.
		The ciphertext may be decrypted only with the corresponding private key.
		@see http://en.wikipedia.org/wiki/RSA
	@param {Object} options	Overrides the fields of this object. Must contain at least 'pubKey'.
	@throws TypeError if the public key was not given or is not correct
	@constructor
*/
Ciform.ciphers.RSAEncoder = function( options )
{
	/**
		<p>The public key used for asymmetric encryption.</p>
		<p>REQUIRED (no default value)</p>
		@type Ciform.ciphers.RSAPublicKey
	*/
	this.pubKey = null;

	/**
		<p>If true, meta-data will be prepended to the result of encryption.</p>
		@type boolean
		@default false : don't put meta-data at the beginning of the ciphertext.
	*/
	this.preamble = false;

	/**
		<p>If true, a random string will be prepended to the text before encryption,
		in order to make the ciphertext different every time, even with the same original text.<br>
		E.g. "1234:my message" : "1234:" is the salt</p>
		<p><b>WARNING</b> : without salt, the same message encoded with the same key will always give the same ciphertext
			(this could be a security issue).</p>
		@type boolean
		@default false : don't put salt at the beginning of the ciphertext.
	*/
	this.salt = false;

	/**
		<p>If true, does not check that the padding scheme is correct (does not apply if salt is added).</p>
		@default false : do check that the padding scheme is correct (does not apply if salt is added).
		@type boolean
	*/
	this.noPadding = false;

	// adds the known options directly to this object
	//this.extend( merge( {'preamble':false,'salt':false,'nopadding':false}, options ) );
	this.extend(options);

	if ( !$defined(this.pubKey) ) {
		throw new TypeError("The public key is required !");
	}

	if ( this.pubKey['type'] != "rsa" ) {
		throw new TypeError("Type of public key must be 'rsa'");
	}

	if ( !this.pubKey['pq'] || !this.pubKey['e'] ) {
		throw new TypeError("Public key is missing a field : both 'pq' and 'e' are required");
	}
};
Ciform.ciphers.RSAEncoder.prototype = new Ciform.ciphers.Encoder();


/** @final @type Integer */
Ciform.ciphers.RSAEncoder.prototype.SALT_MAX = 9999;
/** @final @type Integer */
Ciform.ciphers.RSAEncoder.prototype.SALT_MIN = 1;


/**
	@private
	@type Array[Number]
*/
Ciform.ciphers.RSAEncoder.prototype._getMPI = function()
{
	// this function can be called several times so we don't compute the following each time
	if ( ! this.pubKey['mpi'] )
	{
		this.pubKey['mpi'] = Crypto.Base64.s2r(Crypto.RSA.b2mpi(this.pubKey['pq'])+Crypto.RSA.b2mpi([this.pubKey['e']])).replace(/\n/,'');
	}

	return this.pubKey['mpi'];
};



/**
	@private
	@return a random number between {@link #SALT_MIN} and {@link #SALT_MAX}
	@type Number
*/
Ciform.ciphers.RSAEncoder.prototype._getSalt = function()
{
	return Math.floor(Math.random() * (this.SALT_MAX - this.SALT_MIN + 1) + this.SALT_MIN);
};



/**
	Computes the maximum length the message should be to prevent attacks against RSA without padding.
	@see http://en.wikipedia.org/wiki/RSA#Padding_schemes.

	@return the max. length for a message to be encoded.
		In case salt is added to the ciphertext, the real max. length might be longer,
		because the salt has a variable length
	@type Number
	@see Ciform.ciphers.RSAEncoder#_getSalt
*/
Ciform.ciphers.RSAEncoder.prototype.maxLength = function()
{
	var s = Crypto.Base64.r2s(this._getMPI());
	var l = Math.floor((s.charCodeAt(0)*256 + s.charCodeAt(1)+7)/8);

	var lmax = l - 4;

	if ( this.salt )
	{
		lmax -= new Number(this.SALT_MAX).toString().length;
	}

	console.debug(this,".maxLength()=",lmax);
	return lmax;
};



/**
	@see Ciform.ciphers.Encoder#encode
	@return the ciphertext of the message, encoded with the public RSA key of this encoder, with meta-data about the encoding if this.options['preamble'] is true
	@throws RangeError if the message is too long to be secure for the current public key (ignored if either 'salt' or 'nopadding' is true)
*/
Ciform.ciphers.RSAEncoder.prototype.encode = function( message )
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
	if ( this.salt )
	{
		// some salt to randomize the string
		var salt = this._getSalt();
		console.debug("salt="+salt);
		saltMessage = "salt" + salt + ":" + message;
	}

	var p = saltMessage+String.fromCharCode(1);

	var maxLength = this.maxLength();
	if ( !this.noPadding && !this.salt && p.length > maxLength )
	{
	   throw new RangeError("Plain text length must be less than "+maxLength+" characters");
	}

	var b = Crypto.Hex.s2b(p);

	// rsa-encrypts the result and converts into mpi
	var ciphertext = Crypto.RSA.encrypt(b,exp,mod);

	return (this.preamble ? "rsa:0x" : "") + Crypto.Hex.s2hex(Crypto.Hex.b2s(ciphertext));
};



//
// CHAIN ENCODER
//



/**
	@class This encoder simply combine encoders into a chain.
		For instance, the message will be first hashed through SHA-1, and then encrypted with a RSA key.
	@param {Array[Ciform.ciphers.Encoder]} encoders	A list with the instances of encoders to use (The chain starts with index 0)
*/
Ciform.ciphers.ChainEncoder = function( encoders )
{
	/** @private */
	this.encoders = encoders;
};
Ciform.ciphers.ChainEncoder.prototype = new Ciform.ciphers.Encoder();



Ciform.ciphers.ChainEncoder.prototype.encode = function( message )
{
	var ciphertext = message;

	for ( var e=0 ; e<this.encoders.length ; e++ )
	{
		ciphertext = this.encoders[e].encode(ciphertext);
	}

	return ciphertext;
};



//
// CIFORM 'PACKETIZER'
//



/**
	@class This encoder makes sure the ciphertext will be a ciform packet.
	@see Ciform.protocol
*/
Ciform.ciphers.CiformPacketizer = function() {};
Ciform.ciphers.CiformPacketizer.prototype = new Ciform.ciphers.Encoder();



/**
	Adds {@link Ciform.protocol.PACKET_PREFIX} to the message, if necessary.
*/
Ciform.ciphers.CiformPacketizer.prototype.encode = function( message )
{
	// only if it doesn't start with the prefix already
	return new RegExp("^"+Ciform.protocol.PACKET_PREFIX+"(.*)").test(message) ? message : Ciform.protocol.PACKET_PREFIX + message;
};



//
// CLASS Cipher
//



/**
	@class This class provides a simple way to encrypt different kind of elements (text, form fields, URL).<br>
		It has first to be built with options to define the encryption ;
		then one of its method must be called on the element to encrypt.
	@constructor
	@param {Object} [options](and next arguments)
		Overrides the default properties and functions of this object.<br>
		For instance, provide <code>{'encoder':myencoder,'onerror':function(e,context){dosomething()}}</code>
		to use a custom encoder and a custom error handler.
*/
Ciform.Cipher = function( options )
{
	console.debug("new Ciform.Cipher(",options,")");

	//
	// PROPERTIES DEFINITION
	//

	/**
		The encoder to use on each of the {@link #targets}
		@type Ciform.ciphers.Encoder
		@default A {@link Ciform.ciphers.RSAEncoder} inside a {@link Ciform.ciphers.CiformPacketizer} <b>if at least the <code>pubKey</code> property is provided in the options</b>
	*/
	this.encoder = null;


	//
	// FUNCTIONS DEFINITION
	//

	/**
		A custom error handler that will be called with the error as an argument during encryption operations.<br>

		@param {Error} e the error that happened
		@param {Object} context any information about the context, in the form of an object with properties
		@type function
		@default Default function will log the error and pass it to the upper error handler.
	*/
	this.onerror = function(e,context)
	{
		console.error(context);
		throw e;
	};




	/**
		This function is called just before the encryption of an object starts.<br>
	
		<p>This default implementation does nothing.
		It should be overridden to match specific needs.</p>
	
		@param target		The object that's going to be encrypted
		@param [options]	The parameters of the current context, if any
	*/
	this.onEncryptionStart = function( target, options )
	{
		console.debug(this,".onEncryptionStart(",target,options,")",new Date());
	};



	/**
		This function is called once the encryption of an object has ended.<br>
	
		<p>This default implementation does nothing.
		It should be overridden to match specific needs.</p>
	
		@param target		The object that has just been be encrypted
		@param [options]	The parameters of the current context, if any
	*/
	this.onEncryptionEnd = function( target, options )
	{
		console.debug(this,".onEncryptionEnd(",target,options,")",new Date());
	};



	//
	// INITIALISATION
	//

	// copies the options into this object
	for ( var a=0 ; a<arguments.length ; a++ ) {
		this.extend(arguments[a]);
	}

	// convenient default encoder provided : RSA
	// NOTE : in the end because it requires the 'pubKey' parameter
	if ( !this['encoder'] && this['pubKey'] )
	{
		this['encoder'] = new Ciform.ciphers.ChainEncoder( [
			new Ciform.ciphers.RSAEncoder( merge({'preamble':true,'salt':true},this) ),
			new Ciform.ciphers.CiformPacketizer()
			]
		);
	}

	if ( !this['encoder'] )
	{
		throw new TypeError("The encoder is required !");
	}
};



/**
	Encrypts a text.<br>

	@param {String} text
		The message to encode (will also be made 'ciform-encoded' using a {@link Ciform.ciphers.CiformPacketizer}).<br>
		As an alternative, this parameter can be ignored if the text is given in the options.
	@param {Object} [options]
		An object with the following properties :
		<ul>
		<li><code>&lt;{@link String}&gt; text</code> -
			The text to encrypt
		</ul>
	@return null if the text could not be encrypted
	@type String
*/
Ciform.Cipher.prototype.encryptText = function( text, options )
{
	console.debug(this,".encryptText(",text,options,")");

	// allows us to refer to 'options' even when only 1 argument was given
	if ( !$defined(options) ) {
		options = text;
	}

	var localOptions = merge(this,options);
	var e = localOptions['encoder'];
	var result = null;

	// makes sure the result is 'ciform-encoded' by adding a CiformPacketizer at the end
	if ( !(e instanceof Ciform.ciphers.ChainEncoder) || !(e.encoders[e.encoders.length-1] instanceof Ciform.ciphers.CiformPacketizer) ) {
		e = new Ciform.ciphers.ChainEncoder([localOptions['encoder'],new Ciform.ciphers.CiformPacketizer()]);
	}

	try
	{
		this.onEncryptionStart(text,localOptions);

		result = e.encode(text); // may throw an exception
	}
	catch ( e )
	{
		this.onerror(e,localOptions);
		result = null;
	}
	finally
	{
		this.onEncryptionEnd(text,localOptions);
	}

	return result;
};



/**
	Encrypts an HTML field.<br>

	<p>Example 1 : <code>encryptField(myField);</code></p>
	<p>Example 2 : <code>var result = encryptField(myField,{'commit':false});</code></p>
	<p>Example 3 : <code>var result = encryptField({'field':myField,'commit':false});</code></p>

	@param {HTMLElement|Object} target
		The element to encrypt.<br>
		As an alternative, this parameter can be an 'option' object (see next parameter) : in this case this is the only parameter allowed and all default values will then be applied.
	@param {Object}		[options]
		Optional properties.
	@param {Ciform.Field}	[options.field]
		Same as (replaces) <code>target</code><br />
		If the target field has a CSS class of <code>sha1</code> or <code>ciform-sha1</code>, the {@link Ciform.Field#sha1} property will be forced to 1 or 2 respectively.
	@param {boolean}		[options.commit=true]
		If true, will write ciphertext into the output field.<br>
		If false, will not touch the in and out field, but instead will return the {@link Ciform.Field}
		with the following properties added :
		<ul>
			<li><code>&lt;{@link String}&gt; text</code> -
				The value of the <em>input</em> field at the end of the operation.
			<li><code>&lt;{@link String}&gt; ciphertext</code> -
				The value of the <em>output</em> field at the end of the operation.
		</ul>
		This parameter is usefull for instance to handle atomic operations on several fields at once.
	@return false if there was an error, true or a {@link Ciform.Field} object if not
	@type boolean|Ciform.Field
*/
Ciform.Cipher.prototype.encryptField = function( target, options )
{
	console.debug(this,".encryptField(",target,options,")");

	// allows us to refer to 'options' even when only 1 argument was given
	if ( !$defined(options) ) {
		options = target;
	}

	// NOTE : localOptions inherits at the same time options specific to the field and those more generic ('commit')
	var localOptions = merge( {'commit':true}, new Ciform.Field(target), options );
	var text = localOptions['input'].value;
	var nodOut = localOptions['output'];
	var result = false;

	// takes care of the special CSS classes
	if ( /ciform-sha1/.test(nodOut.className) ) {
		localOptions['sha1'] = 2;
	}
	else if ( /sha1/.test(nodOut.className) ) {	// FIXME : a more accurate filter
		localOptions['sha1'] = 1;
	}

	this.onEncryptionStart(target,localOptions);
	try
	{
		// handles a first level of encoding through sha-1 if asked for it
		if ( localOptions['sha1'] )
		{
			text = new Ciform.ciphers.SHA1Encoder( {'preamble':localOptions['sha1']==2} ).encode(text);
		}

		// then a second level with the registered encoder
		var ciphertext = this.encryptText(text,localOptions); // may throw an exception

		if ( ciphertext != null )
		{
			// records the 'output' value for committing
			localOptions._ciphertext = ciphertext;

			if ( localOptions['commit'] )
			{
				localOptions._commit();
				result = true;
			}
			else
			{
				result = localOptions;
			}
		}
		else
		{
			result = false;
		}
	}
	catch ( e )
	{
		this.onerror(e,localOptions);
		result = false;
	}
	finally
	{
		this.onEncryptionEnd(target,localOptions);
	}

	return result;
}



/**
	Tries its best to encrypt all fields in a single atomic operation.<br>

	<p>If an error occurs during the encryption of any field, no field is encrypted.</p>

	@param {Array} fields An array of {@link Ciform.Field}
	@param {Object} options See {@link #encryptField}
	@see #encryptField
*/
Ciform.Cipher.prototype.encryptFields = function( fields, options )
{
	console.debug(this,".encryptFields(",fields,options,")");

	var done = [];
	var result = false;

	try
	{
		this.onEncryptionStart(fields,options);

		// 1. stores the result of all operations
		for ( var f=0 ; f<fields.length ; f++ )
		{
			// commit = false so the changes are not written, only stored into 'done'
			done[f] = this.encryptField(fields[f],merge(options,{'commit':false}));
			if ( done[f] == false )
			{
				// returns before replacing any value with the ciphertext
				this.onEncryptionEnd(fields,options);
				return false;
			}
		}

		// 2. replaces the values when we're sure all operations went well
		for ( var f=0 ; f<done.length ; f++ )
		{
			done[f]._commit();
		}
		result = true;
	}
	catch ( e )
	{
		this.onerror(e,options);
		result = false;
	}
	finally
	{
		this.onEncryptionEnd(fields,options);
	}

	return result;
};



/**
	Encrypts fields of a form.<br>

	<p>For instance, the following encrypts input fields of type <em>password</em> in a form :</p>
	<pre>encryptForm(myForm,{'allowTypes':["password"]})</pre>

	@param {HTMLFormElement} target
		The form to encrypt.<br>
		As an alternative, this parameter can be ignored if the target is given in the options.
	@param {Object} [options]
		An object with the following properties :
		<ul>
		<li><code>&lt;{@link HTMLFormElement}&gt; form</code> -
			Same as (replaces) <code>target</code> argument.
		<li><code>&lt;{@link Array}&gt; allowTypes</code> -
			If set, this array lists the only 'type' attributes allowed for an &lt;INPUT&gt; tag to be encrypted.
			If not set, all tags are allowed.
		<li><code>&lt;{@link Array}&gt; rejectTypes</code> -
			If set, this array lists the 'type' attributes of the &lt;INPUT&gt; tags not to encrypt.
			If not set, all tags are allowed.
		</ul>
	@return false if there was an error, true if not
	@type boolean
*/
Ciform.Cipher.prototype.encryptForm = function( target, options )
{
	console.debug(this,".encryptForm(",target,options,")");

	// allows us to refer to 'options' even when only 1 argument was given
	if ( !$defined(options) ) {
		options = target;
	}

	// 1. prepares parameters
	var form = target instanceof HTMLFormElement ? target : options['form'];
	var localOptions = merge( {'form':form}, options );
	var fields = new Array();
	fields.extend(localOptions['form'].elements);	// NOTE : HTMLFormElement.elements is not mutable, so we must create a new array from it
	var result = true;

	try
	{
		this.onEncryptionStart(target,localOptions);

		// 2. filter is applied on the form control tag / type
		// NOTE this is only a convenience so the user is not required to write complex rules
		// to select the fields ; *no* more options like those one should be added.
		var oktags = localOptions['allowTypes'];
		var noktags = localOptions['rejectTypes'];
		for ( var f=0 ; f<fields.length ; f++ )
		{
			var el = fields[f];
			// a first level of protection : only regular fields are allowed
			if ( el.tagName.toUpperCase() == "INPUT"
				&& el.type
				&& !["button","submit","image"].containsValue(el.type,true)
				&& !equals("disabled",el.disabled,true)
				&& !equals("readonly",el.readonly,true)	// TODO : check those controls
				)
			{
				// removes any element that does not match the 'allowTypes' filter
				if ( oktags && !oktags.containsValue(el.type,true) )
				{
					fields.splice(f,1);
				}
				// removes any element that does not match the 'rejectTypes' filter
				else if ( noktags && noktags.containsValue(el.type,true) )
				{
					fields.splice(f,1);
				}
			}
			// this field does not conform to the 'regular' behaviour -> removed
			else
			{
				fields.splice(f,1);
			}
		}

		// 3. encrypts the remaining fields
		result = this.encryptFields( fields, localOptions );
	}
	catch ( e )
	{
		this.onerror(e,localOptions);
		result = false;
	}
	finally
	{
		this.onEncryptionEnd(target,localOptions);
	}

	return result;
};



/**
	Encrypts the parameters in an URL.<br>

	@param {String} url The full URL to encrypt (e.g. <code>"http://plugnauth.sf.net/ciform/demo.php?password=mysecret"</code>)
	@param {Object} [options]
		An object with the following properties :
		<ul>
		<li><code>&lt;{@link Array}&lt;{@link String}&gt;&gt; fields</code> -
			The list containing the name of the fields that must be encrypted
			(if not present, all detected fields are encrypted)
		</ul>
	@return The same URL, with the fields encrypted.<br>
		E.g. <code>"http://plugnauth.sf.net/ciform/demo.php?password=mysecret"</code> could become <code>"http://plugnauth.sf.net/ciform/demo.php?password=ciform:rsa:0x2137230230234832423723"</code>
	@type String
*/
Ciform.Cipher.prototype.encryptURL = function( url, options )
{
	console.debug(this,".encryptURL(",url,options,")");

	var cipherurl = url;

	try
	{
		this.onEncryptionStart(url,options);

		// splits the URL into [base,query]
		var query = /([^\?]*)\?(.*)/.exec(url);
		if ( query && query.length >= 3 )
		{
			// reforms the base URL to concatenate the encrypted query to its end later
			cipherurl = query[1] + "?";
			// splits the query string into parameters (separated with a '&')
			var args = query[2].split(/&/);
			for ( var a=0 ; a<args.length ; a++ )
			{
				// splits the current parameter into [key,value]
				var keyval = /([^=]*)=?(.*)/.exec(args[a]);
				if ( keyval[1] )
				{
					var key = keyval[1];
					var val = keyval[2];

					cipherurl += key;

					if ( val )
					{
						// to be encrypted, either no field at all must be specified in the options
						// or this field must be present in the list
						var encryptMe = !options['fields'] || options['fields'][key];
		
						cipherurl += "=" + (encryptMe ? this.encryptText(val) : val);
					}
				}
				if ( a+1<args.length )
				{
					cipherurl += "&";
				}
			}
		}
	}
	catch ( e )
	{
		this.onerror(e,options);
	}
	finally
	{
		this.onEncryptionEnd(url,options);
	}

	return cipherurl;
};



// /**
// 	This function tries to automatically determine the target to encrypt given versatile arguments.<br>
// 
// 	<p>If there is an error during the encryption, none of the field is changed.</p>
// 
// 	@param target
// 		Either a text, a form, a form field or an array of fields to encrypt
// 	@param [options]
// 		Options to pass to the encoding method
// 	@see Ciform.Cipher#encryptForm
// 	@see Ciform.Cipher#encryptField
// 	@see Ciform.Cipher#encryptFields
// 	@see Ciform.Cipher#encryptText
// 	@return The returned value depends on the target (see the definition of the corresponding function)
// 	@throws TypeError if a target could not be determined
// */
// Ciform.Cipher.prototype.encrypt = function( target, options )
// {
// 	console.debug(this,".encrypt(",target,options,")");
// 
// 	if ( target instanceof HTMLFormElement ) {
// 		console.debug("Target is a form");
// 		return this.encryptForm(target,options);
// 	}
// 	else if ( target instanceof Array ) {
// 		console.debug("Target is a field array");
// 		return this.encryptFields(target,options);
// 	}
// 	else if ( target instanceof String ) {
// 		console.debug("Target is a text");
// 		return this.encryptText(target,options);
// 	}
// 	else {
// 		console.debug("Target should be an input field");
// 		return this.encryptField(target,options);
// 	}
// 
// 	currently never happens because unknown targets are passed to #encryptField
// 	throw new TypeError("Target "+target+" is not handled");
// };



//
// CLASS Widget (TODO)
//


// Ciform.Widget = function( options )
// {
// 	/** If true, will show an indication of the progress of the encryption (because it can take some time) */
// 	this.showWait = true;
// 
// 	Ciform.Cipher.apply(this,arguments);
// };
// Ciform.Widget.prototype = new Ciform.Cipher();
// 
// 
// 
// /**
// 	<p>Prints a message in the window's status bar.</p>
// 	@see Ciform.Cipher#onEncryptionStart
// */
// Ciform.Widget.prototype.onEncryptionStart = function( target, options )
// {
// 	Ciform.Cipher.onEncryptionStart.apply(this,arguments);
// 	if ( this.showWait ) {
// 		window.status = "Starting to encode " + target;
// 	}
// };
// 
// 
// 
// /**
// 	<p>Prints a message in the window's status bar.</p>
// 	@see Ciform.Cipher#onEncryptionEnd
// */
// Ciform.Widget.prototype.onEncryptionEnd = function( target, options )
// {
// 	Ciform.Cipher.onEncryptionEnd.apply(this,arguments);
// 	if ( this.showWait ) {
// 		window.status = "Finished encoding " + target;
// 	}
// };



//
// GLOBAL FUNCTIONS
//



// /**
/*			<li>the {@link $ciform} function :<br>
				It is a shortcut to make the creation of Ciform.Cipher objects less verbose.
				It returns a {@link Ciform.Cipher} object that can be used as usual.
			</ul>*/
// 	<p>This utility function provides a compact way to create a {@link Ciform.Cipher} object.</p>
// 
// 	<p>All options to the usual arguments of {@link Ciform.Cipher} are supplied in one 'flat' argument.
// 	This is more compact than the object oriented way, but also less clear...</p>
// 
// 	@param {Object} options Can contain all fields from {@link Ciform.Cipher}, {@link Ciform.ciphers.RSAEncoder}
// 	@return a {Ciform.Cipher} object
// 
// */
// function $ciform( options )
// {
// 	console.debug("$ciform(",options,")");
// 
// 	/**
// 		This array contains {@link Ciform.Field} objects : it defines which form control may be encrypted.
// 		NOTE : this field is <b>replaced</b>, not merged with the current one (if any)
// 		@type Array
// 	*/
// 	this.fields = null;
// 
// 
// 
// 	options = $defined(options) ? options : {};	// so options is always defined
// 
// 	// default encoder
// 	var encoder = options['encoder'];
// 	if ( !$defined(encoder) && $defined(options['pubKey']) ) {
// 		encoder = new Ciform.ciphers.RSAEncoder( merge({'preamble':true,'salt':true},options) );
// 	}
// 
// 	// 1st case : two arguments defined
// 	if ( $defined(target) && $defined(options) )
// 	{
// 		// a. determines the target
// 		var $target = $(target);
// 		var targetOptions = {};
// 
// 		if ( $target instanceof HTMLFormElement ) {
// 			console.debug("Target is a form");
// 			targetOptions = {'form':$target};
// 		}
// 		else if ( Ciform.Target.prototype.isCiformInput($target)  ) {
// 			console.debug("Target is an input field");
// 			targetOptions = {'fields':[$target]};
// 		}
// 		else if ( $target instanceof Array ) {
// 			console.debug("Target is a field array");
// 			targetOptions = {'fields':$target};
// 		}
// 
// 		// b. merges the options correctly before instanciating the object
// 		var targ = new Ciform.Target( merge(options,targetOptions) );
// 		return new Ciform.Cipher( merge(options,{'target':targ}) );
// 	}
// 
// 	// 2nd case : only one argument defined
// 	else if ( $defined(target) )
// 	{
// 		options = target;
// 		return new Ciform.Cipher(options);
// 	}
// 
// 	// 3rd and last case is not quite useful
// 	else
// 	{
// 		return new Ciform.Cipher({});
// 	}
// }

})($defined,Crypto,console);