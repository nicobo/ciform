/**
	@fileoverview

	This library provides specifications and basic functions to add encryption functionalities to an HTML form,
	therefore called "Ciform".<br>

	<p>It does not contain cryptographic functions ; it's more a 'user-friendly' wrapper
	around cryptographic functions, dedicated to securing web forms.
	</p>

	<p>It works with 2 layers :<ol>
		<li>the 'user' layer is represented by the {@link ciform.Ciform} class :
			the user creates a Ciform object with specific options, and then
			calls one of the encryption methods / functions.
		<li>the {@link ciform.encoders 'encoders' layer} contains wrapper classes
			for each supported encryption method : it's a way to normalize encryption
			and to provide the upper layer an homogenous API. This is the layer that
			really deals with the cryptographic functions.
		</ol>
	</p>

	<p>Most functions work with {@link ciform.Options}.
		Options are just an object with limited properties (also named 'fields' here), and a few utility functions.<br>
		Usually, a first set of options is given to the constructor and acts as the base context of the object.
		Another set of options can be passed to its methods, as a one-time context.<br>
		In general, a function uses only some of the options it was provided, and then passes them on to the next layer / function.<br>
		When default values are set or when there is a special usage of an option, it is specified in the function's documentation.<br>
		Boolean properties default to false, except if stated otherwise.
	</p>

	@requires http://www.hanewin.net/encrypt/rsa/base64.js
	@requires http://www.hanewin.net/encrypt/rsa/hex.js
	@requires http://pajhome.org.uk/crypt/md5/sha1.js
	@requires http://www.hanewin.net/encrypt/rsa/rsa.js
	@author cbonar at users dot sf dot net
*/



//
// NAMESPACE : ciform.*
//



/**
	@class Defines a namespace for this project.
	@constructor
*/
ciform = function(){};



/**
	@class This namespace contains the constants required for the client to communicate with the server.<br>

	<p>Data from the server is served as a literal object indexed with some of those constants.<br>
	e.g. <code>{ 'serverURL':"login.php", 'pubKey':{'type':'rsa', 'e':10000,'pq':24} }</code>.</p>

	<p>The normal behavior is to retrieve the protocol from the server and to compare it to the one of this library,
	in order to know if they're compatible.</p>

	@constructor
*/
ciform.protocol = function()
{
	/** Version of the protocol (should be used when the protocol changes) */
	this.VERSION = 0;

	/**
		Prefix to use for a ciform 'packet' to decode :
		HTTP request parameters beginning with this String will be considered as 'Ciform-encoded' values.
	*/
	this.PACKET_PREFIX = "ciform:";
};



//
// CLASS Options
//



/**
	@class This class handles common parameters in this project.<br>

	<p>Many functions of this namespace make use of a subset of those options,
	so they refer to this class to define the fields they use.<br>
	It should be seen as a flat view of most options used by the classes in this library.</p>

	@param options {Object} properties to add to this object
	@constructor
*/
ciform.Options = function( options )
{
	/**
		The presence of this field limits encryption operations to the form element it represents
		(except of course if it's overridden with further options).<br>
		Fields will be searched in this form if not fully specified.
		@type HTMLFormElement
	*/
	this.form = options['form'];

	/**
		This array contains ciform.Options.Field objects : it defines which form control may be encrypted.
		NOTE : this field is <b>replaced</b>, not merged with the current one (if any)
		@type Array
	*/
	this.fields = options['fields'];

	/** If true, Ciform will show an indication of the progress of the encryption (because it can take some time) */
	this.showWait = options['showWait'];

	/**
		A custom error handler that will be called with the error as an argument
		@type ciform
	*/
	this.onerror = options['onerror'];

	/** The {@link ciform.encoders.Encoder encoder} to use */
	this.encoder = options['encoder'];

	/**
		If set, this array lists the only tag types allowed to be encrypted.
		It can be either a tag name or the value of the 'type' attribute of an &lt;input&gt; tag.
		@type Array
	*/
	this.allowedTags = options['allowedTags'];
};
ciform.Options.prototype = new Object();



/**
	@private
	@param object {any kind of object}
	@return true if the given object is a form input that Ciform accepts
*/
ciform.Options.prototype._isCiformInput = function( object )
{
	return object instanceof HTMLInputElement
		|| object instanceof HTMLSelectElement
		|| object instanceof HTMLTextAreaElement;
};



/**
	This is the preferred way to access the form element carried by this object.

	Tries :<ol>
		<li>$(this[key])
		<li>$(key)
		<li>$(this.form)
		</ol>

	@param key	(optional) the key of the form in this object
	@return the form element or null if the argument doesn't match a form
	@type HTMLFormElement
*/
ciform.Options.prototype.getForm = function( key )
{
	var form = null;

	if ( $defined(key) )
	{
		form = $(this[key]) ? $(this[key]) : $(key);
	}
	else if ( $defined(this.form) )
	{
		form = $(this.form);
	}

	return form instanceof HTMLFormElement ? form : null;
}



/**
	Retrieves the form control which name/id is the value of the given key.<br>

	<p>Will look into the form defined in this object, if any.</p>

	<p>This is the preferred way to access a form control carried by this object.</p>

	@param key	the key of the field in this object. The corresponding value may be an id, name or the field itself.
	@param index	the index of the field in the 'fields' property ; if not set, will search directly in this object
	@return the corresponding element or null if not found
	@type HTMLElement
*/
ciform.Options.prototype.getField = function( key, index )
{
	var fieldName = $defined(this.fields) && this.fields[key] && $defined(index) ? this.fields[key][index] : this[key];
	var form = $(this.form);

	if ( form && form[fieldName] )
	{
		return form[fieldName];
	}
	else
	{
		var field = $(fieldName);
		return this._isCiformInput(field) ? field : null;
	}
}



//
// NAMESPACE : ciform.encoders.*
//



/**
	This namespace contains the encoders used by Ciform.<br>

	<p>All encoders must respect the interface defined as {@link ciform.encoders.Encoder}.</p>
*/
ciform.encoders = {};



/**
	@class An encoder provides a way to encode/encrypt a message.
		Implementations of an encoder must re-define all of the methods of this class.
	@constructor
*/
ciform.encoders.Encoder = function(){};



/**
	The basic way to encode/encrypt a message.

	@param {String} message	The text to encrypt
	@return the encrypted message (ciphertext) : the result depends on the encoder
	@type String
*/
ciform.encoders.Encoder.prototype.encode = function( message )
{
	return message;
};



/**
	@class This class presents options specific to encoders.
	See each encoders' definition to know which subset of these options they support.
	
	@param options {Object} properties to add to this object
	@constructor
*/
ciform.encoders.Options = function( options )
{
	// calls the constructor of the superclass
	ciform.Options.apply(this,arguments);

	/**
		The public key used for asymmetric encryption
		@type ciform.encoders.PublicKey
	*/
	this.pubKey = options['pubKey'];

	/**
		If true, meta-data will be prepended to the result of encryption.
		@type boolean
	*/
	this.preamble = options['preamble'];

	/**
		If true, a random string will be prepended to the text before encryption,
		in order to make the ciphertext different every time, even with the same original text.<br>
		E.g. "1234:my message" : "1234:" is the salt
		@type boolean
	*/
	this.salt = options['salt'];

	/**
		If true, does not check that the padding scheme is correct (does not apply if salt is added).
		@type boolean
	*/
	this.noPadding = options['noPadding'];
}
ciform.encoders.Options.prototype = new ciform.Options({});



/**
	@class This class gathers all options that can be applied to a field.

	@param options {Object} properties to add to this object
	@constructor
*/
ciform.Options.Field = function( options )
{
	// calls the constructor of the superclass
	ciform.encoders.Options.apply(this,arguments);

	/** Input field : where to read the text to encode */
	this.name = options['in'];

	/** Output field : the name / id of the field where to write the encoded text */
	this.out = options['out'];

	/**
		<ul>
		<li>If == 1, this field will be SHA1-encoded before encryption.
		<li>If == 2, meta-data will be prepended to the result.
		</ul>
		@type number
	*/
	this.sha1 = options['sha1'];
};
ciform.Options.Field.prototype = new ciform.encoders.Options({});



//
// SHA-1 ENCODER
//



/**
	@class Encodes a text into its sha1 sum.
	@param {ciform.encoders.Options} options
		Handled parameters and their default values :
		<ul>
		<li>{@link ciform.encoders.Options#preamble preamble} = false
		</ul>
	@constructor
*/
ciform.encoders.SHA1Encoder = function( options )
{
	this.extend(options);
};
ciform.encoders.SHA1Encoder.prototype = new ciform.encoders.Encoder();



/**
	@see ciform.encoders.Encoder#encode
	@return the sha-1 of the message, base64 encoded, with meta-data about the encoding if this.options.preamble is true
*/
ciform.encoders.SHA1Encoder.prototype.encode = function( message )
{
	console.debug(this,"encode(",message,")");
	return (this['preamble'] ? "sha1:b64:" : "") + b64_sha1(message);
};



//
// RSA ENCODER
//



/**
	@class Formal description of a public RSA key.
	@constructor
*/
ciform.encoders.RSAPublicKey = function()
{
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
		@see http://en.wikipedia.org/wiki/RSA.
	@param {ciform.encoders.Options} options	Handled fields and their default values :
		<ul>
		<li>{@link ciform.encoders.Options#pubKey} : no default value (required)
		<li>{@link ciform.encoders.Options#preamble preamble} = false (don't add meta-data in the beginning of the ciphertext)
		<li>{@link ciform.encoders.Options#salt salt} = false (don't add salt in the beginning of the ciphertext : WARNING : without salt, the same message encoded with the same key will always give the same ciphertext)
		<li>{@link ciform.encoders.Options#noPadding noPadding} = false (check that the padding scheme is correct : does not apply if salt is added)
		</ul>
	@throw TypeError if the public key is not correct
	@constructor
*/
ciform.encoders.RSAEncoder = function( options )
{
	// adds the known options directly to this object
	this.extend( merge( {'preamble':false,'salt':false,'nopadding':false}, options ) );

	if ( this.pubKey['type'] != "rsa" ) {
		throw new TypeError("Type of public key must be 'rsa'");
	}

	if ( !this.pubKey['pq'] || !this.pubKey['e'] ) {
		throw new TypeError("Public key is missing a field : both 'pq' and 'e' are required");
	}
};
ciform.encoders.RSAEncoder.prototype = new ciform.encoders.Encoder();


/** @final @type Integer */
ciform.encoders.RSAEncoder.prototype.SALT_MAX = 9999;
/** @final @type Integer */
ciform.encoders.RSAEncoder.prototype.SALT_MIN = 1;


/**
	@private
	@type Array[Number]
*/
ciform.encoders.RSAEncoder.prototype._getMPI = function()
{
	// this function can be called several times so we don't compute the following each time
	if ( ! this.pubKey['mpi'] )
	{
		this.pubKey['mpi'] = s2r(b2mpi(this.pubKey['pq'])+b2mpi([this.pubKey['e']])).replace(/\n/,'');
	}

	return this.pubKey['mpi'];
};



/**
	@private
	@return a random number between this.SALT_MIN and this.SALT_MAX
	@type Number
*/
ciform.encoders.RSAEncoder.prototype._getSalt = function()
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
	@see ciform.encoders.RSAEncoder#_getSalt
*/
ciform.encoders.RSAEncoder.prototype.maxLength = function()
{
	var s = r2s(this._getMPI());
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
	@see ciform.encoders.Encoder#encode
	@return the ciphertext of the message, encoded with the public RSA key of this encoder, with meta-data about the encoding if this.options['preamble'] is true
	@throws RangeError if the message is too long to be secure for the current public key (ignored if either 'salt' or 'nopadding' is true)
*/
ciform.encoders.RSAEncoder.prototype.encode = function( message )
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

	var b = s2b(p);

	// rsa-encrypts the result and converts into mpi
	var ciphertext = RSAencrypt(b,exp,mod);

	return (this.preamble ? "rsa:0x" : "") + s2hex(b2s(ciphertext));
};



//
// CHAIN ENCODER
//



/**
	@class This encoder simply combine encoders into a chain.
		For instance, the message will be first hashed through SHA-1, and then encrypted with a RSA key.
	@param {Array[ciform.encoders.Encoder]} encoders	A list with the instances of encoders to use (The chain starts with index 0)
*/
ciform.encoders.ChainEncoder = function( encoders )
{
	/** @private */
	this.encoders = encoders;
};
ciform.encoders.ChainEncoder.prototype = new ciform.encoders.Encoder();



ciform.encoders.ChainEncoder.prototype.encode = function( message )
{
	var ciphertext = message;

	for ( var e=0 ; e<this.encoders.length ; e++ )
	{
		ciphertext = this.encoders[e].encode(ciphertext);
	}

	return ciphertext;
};



//
// CIFORM ENCODER
//



/**
	@class This encoder makes sure the ciphertext will be a ciform packet.
	@see ciform.protocol
*/
ciform.encoders.CiformEncoder = function() {};
ciform.encoders.CiformEncoder.prototype = new ciform.encoders.Encoder();



/**
	Adds {@link ciform.protocol#PACKET_PREFIX} to the message, if necessary.
*/
ciform.encoders.CiformEncoder.prototype.encode = function( message )
{
	// only if it doesn't start with the prefix already
	return new RegExp("^"+ciform.protocol.PACKET_PREFIX+"(.*)").test(message) ? message : ciform.protocol.PACKET_PREFIX + message;
};



//
// CIFORM CLASS
//



/**
	@class
		This class handles encryption of a form's fields (and parameters of an HTTP request)
	@constructor
	@param {ciform.encoders.Options} options (optional) (and next arguments) (optional)
		Those options are kept as the 'context' of this object and will be passed to the encoder and most of the other operations.<br>
		Several arguments like this one can be provided (the latter overrides the sooner).<br>
		Required fields :<ul>
			<li>{@link ciform.encoders.Options#pubKey pubKey} : the {@link ciform.encoders.RSAPublicKey} to use for encryption
			</ul>
		Default values (other fields are undefined) :
		<ul>
		<li>{@link ciform.Options#encoder encoder} = a {@link ciform.encoders.RSAEncoder}
		<li>{@link ciform.Options#showWait showWait} = false
		</ul>
	@throws TypeError if the arguments are not correct (a required field is missing, ...)
*/
ciform.Ciform = function( options )
{
	console.debug("new ciform.Ciform(",options,")");

	// copies the options into this object
	for ( var a=0 ; a<arguments.length ; a++ ) {
		this.extend(arguments[a]);
	}

	if ( !$defined(this.pubKey) ) {
		throw new TypeError("The public key is required !");
	}

	if ( !$defined(this.encoder) ) {
		this['encoder'] = new ciform.encoders.ChainEncoder( [
			new ciform.encoders.RSAEncoder( merge(options,{'preamble':true,'salt':true}) ),
			new ciform.encoders.CiformEncoder()
			] );
	}
};



/**
	This function is called just before the encryption of an object starts.<br>

	<p>This default implementation just prints a message in the window's status bar.
	It should be overridden to match specific needs.</p>

	@param target	The object that's going to be encrypted
	@param options	(optional) The parameters of the current context, if any
*/
ciform.Ciform.prototype.onEncryptionStart = function( target, options )
{
	console.debug(this,".onEncryptionStart(",target,options,")");
	if ( this.showWait ) {
		window.status = "Starting to encode " + target;
	}
};



/**
	This function is called once the encryption of an object has ended.<br>

	<p>This default implementation just prints a message in the window's status bar.
	It should be overridden to match specific needs.</p>

	@param target	The object that has just been be encrypted
	@param options	(optional) The parameters of the current context, if any
*/
ciform.Ciform.prototype.onEncryptionEnd = function( target, options )
{
	console.debug(this,".onEncryptionEnd(",target,options,")");
	if ( this.showWait ) {
		window.status = "Finished encoding " + target;
	}
};



/**
	Encrypts a text using the current configuration.

	@param {String} text The message to encode
	@param {ciform.encoders.Options} options (optional) Default values :<ul>
		<li>{@link ciform.Options#encoder encoder} {ciform.encoders.Encoder} An optional encoder (use the current encoder if not set)
		</ul>
	@type String
*/
ciform.Ciform.prototype.encryptText = function( text, options )
{
	console.debug(this,".encryptText(",text,options,")");
	var localOptions = merge(this,options);
	var e = localOptions['encoder'];
	// makes sure the result is 'ciform-encoded' by adding a CiformEncoder to the end
	if ( !(e instanceof ciform.encoders.ChainEncoder) || !(e.encoders[e.encoders.length-1] instanceof ciform.encoders.CiformEncoder) ) {
		e = new ciform.encoders.ChainEncoder([encoder,new ciform.encoders.CiformEncoder()]);
	}
	return e.encode(text); // may throw an exception
};



/**
	Encrypts HTML fields.<br>

	<p>If there is an error during the encryption, none of the field is changed.</p>

	@param {Array} fields
		An array with the fields to encrypt.
		Each entry can be either the element itself or a {@link ciform.Options.Field} taking the following default values :<ul>
			<li>{@link ciform.Options.Field#out out} = the input field itself
			</ul>
		As an alternative,'sha1' or 'ciform-sha1' css classes can be set in the 'class' attribute of output fields,
		in order to set the 'sha1' to 1 or 2 respectively.
	@param {ciform.encoders.Options} options (optional)
		Global options (to be applied to each field encryption)
	@return false if there was an error, true if not
	@type boolean
*/
ciform.Ciform.prototype.encryptFields = function( fields, options )
{
	console.debug(this,".encryptFields(",fields,options,")");

	var done = [];

	for ( var f=0 ; f< fields.length ; f++ )
	{
		// makes sure there is an input and an output field
		var kIn = fields[f]['in'] ? fields[f]['in'] : fields[f];
		var kOut = fields[f]['out'] ? fields[f]['out'] : kIn;

		// gets the nodes from either id, names or nodes directly
		var fieldOptions = new ciform.Options.Field( merge( this, options, fields[f], {'in':kIn,'out':kOut} ) );
		var nodIn = fieldOptions.getField('in');
		var nodOut = fieldOptions.getField('out');

		// takes care of the special classes
		if ( /ciform-sha1/.test(nodOut.className) ) {
			fieldOptions.sha1 = 2;
		}
		else if ( /sha1/.test(nodOut.className) ) {	// FIXME : a more accurate filter
			fieldOptions.sha1 = 1;
		}

		var text = nodIn.value;

		try
		{
			this.onEncryptionStart(nodIn,fieldOptions);

			// handles a one-level sha-1 encoding for such fields
			if ( fieldOptions.sha1 )
			{
				text = new ciform.encoders.SHA1Encoder( {'preamble':fieldOptions.sha1==2} ).encode(text);
			}

			// the encryption...
			var ciphertext = this.encryptText(text,fieldOptions); // may throw an exception

			// records the 'in' and 'out' values for later (out of this loop)
			done.push({'field':nodIn,'value':""});
			done.push({'field':nodOut,'value':ciphertext});
		}
		catch ( e )
		{
			// calls back the error handler if defined
			if ( fieldOptions.onerror )
			{
				fieldOptions.onerror.apply(this,[e]);
				return false;
			}
			else
			{
				throw e;
			}
		}
		finally
		{
			this.onEncryptionEnd(nodIn,fieldOptions);
		}
	} // iterating over fields is over

	// fields to be encrypted are replaced with something else
	// because they're not supposed to be transmitted in clear
	// FIXME ? must respect character set and length of the original field
	// transaction-like : if an error was catched before, this block would not be reached
	for ( var f=0 ; f<done.length ; f++ )
	{
		done[f]['field'].value = done[f]['value'];
	}

	return true;
};



/**
	A simple shortcut when there's only one field to encrypt.
	@see ciform.Ciform#encryptFields
	@type boolean
*/
ciform.Ciform.prototype.encryptField = function( field, options )
{
	console.debug(this,".encryptField(",field,options,")");
	return this.encryptFields([field],options);
}



/**
	Encrypts fields of a form using the current configuration.<br>
	By default, all fields are encrypted.<br>

	<p>For instance, the following encrypts inputs of type 'password' in a form : cif.encryptForm(myForm,{'allowedTags':"password"})</p>

	@param {HTMLFormElement} form
		The form to encode
	@param {ciform.encoders.Options} options (optional)
		Particular options used here :<ul>
			<li>{@link ciform.Options#allowedTags allowedTags} If not set, all tags are allowed.
			<li>{@link ciform.Options#fields fields} If not set, all fields are allowed to be encrypted.
			<li>{@link ciform.Options#form form} This property is set with the first argument to this function
			</ul>
	@return false if there was an error, true if not
	@type boolean
*/
ciform.Ciform.prototype.encryptForm = function( form, options )
{
	console.debug(this,".encryptForm(",form,options,")");

	// 1. prepares parameters : instanciates the given elements from ther id, name, ...
	var localOptions = new ciform.encoders.Options(options,this);
	var $form = $(form) ? $(form) : localOptions.getForm();

	// 2. if no field is given, we add all the input controls of the form
	if ( ! localOptions.fields )
	{
		localOptions.fields = [];
		for ( var e=0 ; e<$form.length ; e++ )
		{
			localOptions.fields.push( $form[e] );
		}
	}

	// 3. a filter is applied to the form control tag / type
	var oktags = localOptions.allowedTags;
	if ( oktags )
	{
		for ( var f=0 ; f<localOptions.fields.length ; f++ )
		{
			var el = localOptions.getField('in',f);
			if ( !oktags.containsNoCase(el.tagName) &&
				!(el.tagName.toUpperCase() == "INPUT" && el.type && oktags.containsNoCase(el.type)) )
			{
				// removes any element that does not match the filter
				localOptions.fields.splice(f,1);
			}
		}
	}

	// 4. encrypts the remaining fields
	return this.encryptFields( localOptions.fields, merge(localOptions,{'form':$form}) );
};



/**
	Encrypts the parameters in an URL.

	@param {String} url The full URL to encrypt (e.g. http://plugnauth.sf.net/ciform/demo.php?password=mysecret)
	@param {ciform.encoders.Options} options (optional)
		Particular case :<ul>
		<li>{@link ciform.Options#fields fields} : must be an Array of String containing the name of the fields that must be encrypted
			(if not present, all detected fields are encrypted)
		</ul>
	@return the same URL, with the fields encrypted.
		E.g. http://plugnauth.sf.net/ciform/demo.php?password=mysecret could become http://plugnauth.sf.net/ciform/demo.php?password=ciform:rsa:0x2137230230234832423723
	@type String
*/
ciform.Ciform.prototype.encryptURL = function( url, options )
{
	console.debug(this,".encryptURL(",url,options,")");

	var cipherurl = url;

	var query = /([^\?]*)\?(.*)/.exec(url);
	if ( query && query.length >= 3 )
	{
		cipherurl = query[1] + "?";
		var args = query[2].split(/&/);
		for ( var a=0 ; a<args.length ; a++ )
		{
			var keyval = /([^=]*)=?(.*)/.exec(args[a]);
			if ( keyval[1] )
			{
				cipherurl += keyval[1];

				if ( keyval[2] )
				{
					// to be encrypted, either no field at all must be specified in the options
					// or this field must be present in the list
					var encryptMe = !options.fields;
					if ( !encryptMe )
					{
						for ( var f=0 ; f<options.fields ; f++ )
						{
							if ( options.fields == keyval[1] )
							{
								encryptMe = true;
								break;
							}
						}
						options.fields[keyval[1]]
					}
	
					cipherurl += "=" + (encryptMe ? this.encryptText(keyval[2]) : keyval[2]);
				}
			}
			if ( a+1<args.length )
			{
				cipherurl += "&";
			}
		}
	}

	return cipherurl;
};



/**
	This function tries to automatically determine the target to encrypt given versatile arguments.<br>

	@param target
		Either a form, a form field or an array of fields to encrypt
	@param arg2	(optional)
		Options to pass to the encoding method
	@see ciform.Ciform#encryptForm
	@see ciform.Ciform#encryptField
	@see ciform.Ciform#encryptFields
	@see ciform.Ciform#encryptText
	@return The returned value depends on the target (see the definition of the corresponding function)
	@throws SyntaxError if a target could not be determined
*/
ciform.Ciform.prototype.encrypt = function( target, options )
{
	console.debug(this,".encrypt(",target,options,")");

	if ( !$defined(target) && !$defined(options) ) {
		console.debug("No target : trying with an internal form");
		return this.encryptForm( new ciform.Options(this).getForm(), this );
	}
	if ( target instanceof HTMLFormElement ) {
		console.debug("Target is a form");
		return this.encryptForm(target,options);
	}
	else if ( ciform.Options.prototype._isCiformInput(target)  ) {
		console.debug("Target is an input field");
		return this.encryptField(target,options);
	}
	else if ( target instanceof Array ) {
		console.debug("Target is a field array");
		return this.encryptFields(target,options);
	}
	else if ( target instanceof String ) {
		console.debug("Target is a text");
		return this.encryptText(target,options);
	}

	throw new SyntaxError("A target couldn't be determined for encryption from the current context and arguments !");
};



//
// GLOBAL FUNCTIONS
//



function $ciform( target, options )
{
	console.debug("$ciform(",target,options,")");

	if ( target )
	{
		var $target = $(target);
		var targetOptions = {};

		if ( $target instanceof HTMLFormElement ) {
			console.debug("Target is a form");
			targetOptions = {'form':$target};
		}
		else if ( ciform.Options.prototype._isCiformInput($target)  ) {
			console.debug("Target is an input field");
			targetOptions = {'fields':[$target]};
		}
		else if ( $target instanceof Array ) {
			console.debug("Target is a field array");
			targetOptions = {'fields':$target};
		}

		return new ciform.Ciform(merge(options,targetOptions));
	}

	// return null ?
}




