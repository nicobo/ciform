/**
	@fileoverview

	This library provides specifications and basic functions to add encryption functionalities to an HTML form,
	therefore called "Ciform".

	@requires base64.js (http://www.hanewin.net/encrypt/rsa/base64.js)
	@requires hex.js (http://www.hanewin.net/encrypt/rsa/hex.js)
	@requires sha1.js (http://pajhome.org.uk/crypt/md5/sha1.js)
	@requires rsa.js (http://www.hanewin.net/encrypt/rsa/rsa.js)
	@author cbonar at users dot sf dot net
*/



//
// NAMESPACE : ciform.*
//



/**
	Defines a namespace for this project.
*/
ciform = {};



/**
	This namespace contains the constants required for the client to communicate with the server.<br>

	<p>Data from the server is served as a literal object indexed with some of those constants.<br>
	e.g. <code>{ 'serverURL':"login.php", 'pubKey':{'type':'rsa', 'e':10000,'pq':24} }</code>.</p>

	<p>The normal behavior is to retrieve the protocol from the server and to compare it to the one of this library,
	in order to know if they're compatible.</p>

	<p>FIXME : jsdoc doesn't print this class correctly : look at the source code (sorry)</p>
*/
ciform.protocol = {

	/** Version of the protocol (should be used when the protocol changes) */
	VERSION: 0,

	/**
		Prefix to use for a ciform 'packet' to decode :
		HTTP request parameters beginning with this String will be considered as 'Ciform-encoded' values.
	*/
	PACKET_PREFIX: "ciform:"
};



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



//
// SHA-1 ENCODER
//



/**
	@param {Object} options	Default values :
		<ul><li>'preamble' = false (don't add meta-data in the beginning of the ciphertext)</li></ul>
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
	@class
	<p>Formal description of a public key.</p>

	<p>FIXME : Sorry, jsdoc doesn't print this class correctly : look at the source code</p>
*/
ciform.encoders.PublicKey = {
	/** Type of the key */
	'type': String
};



/**
	@class
	<p>Formal description of a public RSA key.</p>

	<p>FIXME : Sorry, jsdoc doesn't print this class correctly : look at the source code</p>
*/
ciform.encoders.RSAPublicKey = {
	/** Must be "rsa" */
	'type': "rsa",
	/** (not used) Size of the key, in bits */
	'size': Number,
	/** Public exponent as an array of 28 bits integers */
	'e': Array(Number),
	/** (not used) Prime factor p, as an array of 28 bits integers */
	'p':Array(Number),
	/** (not used) Prime factor q, as an array of 28 bits integers */
	'q':Array(Number),
	/** Modulus, as an array of 28 bits integers */
	'pq': Array(Number),
	/** (not used) e + modulus, encoded into a base64 <b>M</b>ulti-<b>P</b>recision <b>I</b>nteger string */
	'mpi': Array(Number)
};



/**
	@param {ciform.encoders.RSAPublicKey} pubKey	The public key to use for encryption
	@param {Object} options	Default values :
		<ul>
		<li>'preamble' = false (don't add meta-data in the beginning of the ciphertext)
		<li>'salt' = false (don't add salt in the beginning of the ciphertext : WARNING : without salt, the same message encoded with the same key will always give the same ciphertext)
		<li>'checkPadding' = true (check that the padding scheme is correct : does not apply if salt is added)
		</ul>
	@throw TypeError if the public key is not correct
	@constructor
*/
ciform.encoders.RSAEncoder = function( pubKey, options )
{
	/** @private */
	this.options = options ? options : {'preamble':false,'salt':false,'nopadding':false};

	if ( pubKey['type'] == "rsa" )
	{
		if ( pubKey['pq'] && pubKey['e'] )
		{
			/** @private */
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
	Computes the maximum length the message should be to prevent attacks against RSA without padding
	(http://en.wikipedia.org/wiki/RSA#Padding_schemes)

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

	if ( this.options['salt'] )
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
	This encoder makes sure the ciphertext will be a ciform packet.
	@see ciform.protocol
*/
ciform.encoders.CiformEncoder = function() {};



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
	@param {Object} arg1 : (optional) either a fixed target to encrypt or an option object.
	@param {Object} arg2 (and next arguments) : (optional) options :<ul>
		<li>'pubKey' : the {@link ciform.encoders.RSAPublicKey} to use for encryption
		<li>'form' : (optional) a form (or an container object) to work on : the fields to encrypt will be retrieved from it
		<li>'encoder' : (optional) the encoder to use (defaults to ciform.encoders.RSAEncoder)
		<li>'onerror' : (optional) a function that will act as an error handler : ciform errors will be passed to it
		<lI>'showWait' : (optional) whether or not to show a message when the enryption is going on (because it can take time)
		</ul>
		Several arguments like this one can be provided (the latter overrides the sooner).
	@throws Error if at least one of the required options is missing
*/
ciform.Ciform = function( arg1, arg2 )
{
	var firstArg = 0;

	if ( arg1 )
	{
		targetForm = this._getForm($(arg1));
		targetField = this._getField(arg1,'in',arg1['form']);
		targetFields = this._getFields(arg1);
		if ( targetForm ) {
			this['form'] = targetForm;
			firstArg = 1;
		} else if ( targetFields ) {
			this['fields'] = targetFields;
			firstArg = 1;
		} else if ( targetField ) {
			this['fields'] = [targetField];
			firstArg = 1;
		}
	}

	for ( var a=firstArg ; a<arguments.length ; a++ ) {
		this.extend(arguments[a]);
	}

	if ( this['pubKey'] == null ) {
		throw new Error("The public key is required !");
	}

	if ( this['encoder'] == null ) {
		this['encoder'] = new ciform.encoders.ChainEncoder( [new ciform.encoders.RSAEncoder(this['pubKey'],{'preamble':true,'salt':true}), new ciform.encoders.CiformEncoder()] );
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
	if ( this['showWait'] ) {
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
	if ( this['showWait'] ) {
		window.status = "Finished encoding " + target;
	}
};



/**
	Encrypts a text using the current configuration.

	@param {String} text The message to encode as plain text
	@param {Object} options (optional) :<ul>
		<li>'encoder': {ciform.encoder.Encoder} An optional encoder (use the current encoder if not set)
		</ul>
*/
ciform.Ciform.prototype.encryptText = function( text, options )
{
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

	@param {Object} fields	An array with the fields to encrypt.
		Each entry can be either the element itself or a literal object with the following keys :<ul>
			<li>'in' : the name / id of the input field
			<li>'out' (optional) : the name / id of the output field. If not set, the output field is the input field itself.
			<li>'sha1' : this field will be encrypted through SHA-1 before this object encrypts it
			<li>'ciform-sha1' : same as 'sha1' but with informative meta-data (also called 'preamble')
			</ul>
		As an alternative,'sha1' and 'ciform-sha1' options can be set in the 'class' attribute of output fields.
	@param {Object} options (optional)	Global options (to be applied to each field encryption)
	@return false if there was an error, true if not
	@type Boolean
*/
ciform.Ciform.prototype.encryptFields = function( fields, options )
{
	console.debug("encryptFields(",fields,options,")");

	var done = [];

	for ( var f=0 ; f< fields.length ; f++ )
	{
		var localOptions = merge(fields[f],options,this);
		var form = merge(this,options)['form'];
		// gets the nodes from either id, names or nodes directly
		var kIn = fields[f]['in'] ? fields[f]['in'] : fields[f];
		var kOut = fields[f]['out'] ? fields[f]['out'] : kIn;
		var nodIn = form && form[kIn] ? form[kIn] : $(kIn);
		var nodOut = form && form[kOut] ? form[kOut] : $(kOut);
		var text = nodIn.value;

		try
		{
			this.onEncryptionStart(nodIn,options);

			// handles a one-level sha-1 encoding for such fields
			if ( localOptions['sha1'] || /sha1/.test(nodOut.className) ) // FIXME : a more accurate filter
			{
				text = new ciform.encoders.SHA1Encoder().encode(text);
			}
			// same as sha1, but adds meta-data
			else if ( localOptions['ciform-sha1'] || /ciform-sha1/.test(nodOut.className) )
			{
				text = new ciform.encoders.SHA1Encoder({'preamble':true}).encode(text);
			}

			// the encryption is here !
			var ciphertext = this.encryptText(text,localOptions); // may throw an exception

			// records the 'in' and 'out' values for later (out of this loop)
			done.push({'field':nodIn,'value':""});
			done.push({'field':nodOut,'value':ciphertext});
		}
		catch ( e )
		{
			// calls back the error handler if defined
			if ( localOptions['onerror'] )
			{
				localOptions['onerror'].apply(null,[e]);
				return false;
			}
			else
			{
				throw e;
			}
		}
		finally
		{
			this.onEncryptionEnd(nodIn,localOptions);
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
*/
ciform.Ciform.prototype.encryptField = function( field, options )
{
	return this.encryptFields([field],options);
}



/**
	Encrypts fields of a form using the current configuration.<br>
	By default, all fields are encrypted.<br>

	<p>For instance, this encrypts only inputs of type 'password' in a form : cif.encryptForm(myForm,{'tags':"password"})</p>

	@param {String} form The form to encode
	@param {Object} options	(optional) Contains filters to select the fields that should be encrypted :
		<ul>
			<li>'tags' : the list of tag names (or type of input fields) this function is allowed to encrypt.
				If not set, all tags are allowed.
			<li>'fields' : the list of the fields (their name, id or themselves) to encrypt.
				If not set, all fields are allowed to be encrypted.
		</ul>
*/
ciform.Ciform.prototype.encryptForm = function( form, options )
{
	// 1. prepares parameters : instanciates the given elements from ther id, name, ...
	var localOptions = merge(options,this);
	var $form = $(form);
	var oktags = localOptions['tags'];
	var okfields = [];
	for ( var f=0 ; f<localOptions['fields'].length ; f++ ) {
		var node = this._getField( localOptions['fields'][f], 'in', form );
		okfields.push( merge( localOptions['fields'][f], {'in':node} ) );
	}

	// 2. keeps only the fields to be encrypted
	var fields = [];
	for ( var e=0 ; e<$form.length ; e++ )
	{
		var el = $form[e];
		// a filter is applied to the form control type
		if ( !oktags || oktags.containsNoCase(el.tagName) || (el.tagName == "INPUT" && el.type && oktags.containsNoCase(el.type)) )
		{
			// ... and to the field name and id
			for ( var f=0 ; f<okfields.length ; f++ )
			{
				if ( okfields[f]['in'] == el && !fields.contains(el) )
				{
					fields.push(okfields[f]);
				}
			}
		}
	}

	// 3. encrypts
	return this.encryptFields( fields, merge(localOptions,{'form':$form}) );
};



/**
	Encrypts the parameters in an URL.

	@param {String} url The full URL to encrypt (e.g. http://plugnauth.sf.net/ciform/demo.php?password=mysecret)
	@param {Object} options	(optional) Options :<ul>
		<li>'fields' : an array containing the name of the fields that must be encrypted (if not present, all fields are encrypted)
		</ul>
	@return the same URL, with the fields encrypted.
		E.g. http://plugnauth.sf.net/ciform/demo.php?password=mysecret could become http://plugnauth.sf.net/ciform/demo.php?password=ciform:rsa:0x2137230230234832423723
*/
ciform.Ciform.prototype.encryptURL = function( url, options )
{
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
					var encryptMe = !options['fields'];
					if ( !encryptMe )
					{
						for ( var f=0 ; f<options['fields'] ; f++ )
						{
							if ( options['fields'] == keyval[1] )
							{
								encryptMe = true;
								break;
							}
						}
						options['fields'][keyval[1]]
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
	@private
*/
ciform.Ciform.prototype._getForm = function( node )
{
	return node instanceof HTMLFormElement ? node : false;
}



/**
	@private
	@param key	can be either the node itself, its name or id, or an object with a property designating the field
	@param id	the name of the property designating the field if key is a literal object
	@param form	if defined, the form the field belongs to
	@return the corresponding Element or false if not found
*/
ciform.Ciform.prototype._getField = function( key, id, form )
{
	if ( form && form[key] )
	{
		return form[key];
	} else {
		var node = $(key) ? $(key) : key;
		if ( typeof node == "object" && node.isFormInput() ) {
			return node;
		} else if ( $defined(id) && typeof node == "object" ) {
			return node[id] && $(node[id]) ? $(node[id]) : false;
		}
	}
	return false;
}



/**
	@private
*/
ciform.Ciform.prototype._getFields = function( node )
{
	return node instanceof Array ? node : false;
}



/**
	This function tries to automatically determine the target to encrypt given versatile arguments.<br>

	<p>It can be called in three ways :<ul>
		<li>2 arguments : target is the first argument, options the second
		<li>1 argument : can be either the target or options (determined from its type)
		<li>0 argument : target and options will be guessed from the current object
	</ul>
	</p>

	@param arg1	(optional) Either a form, a form field or an list of fields to encrypt / or options
	@param arg2	(optional) Options to pass to the encoding method
	@see ciform.Ciform#encryptForm
	@see ciform.Ciform#encryptField
	@see ciform.Ciform#encryptFields
	@return The returned valued depends on the target (see the definition of the corresponding function)
	@throws SyntaxError if a target could not be determined
*/
ciform.Ciform.prototype.encrypt = function( arg1, arg2 )
{
	var targetForm = false;
	var targetField = false;
	var targetFields = false;

	var options = arg2 ? arg2 : {};

	// 1. determines if the first argument is the target
	if ( arg1 )
	{
		targetForm = this._getForm($(arg1));
		targetField = this._getField($(arg1));
		targetFields = this._getFields(arg1);
	}

	// 2. target couldn't be determined from the first argument : try with the current context
	if ( !targetForm && !targetField && !targetFields )
	{
		options = arg1 ? arg1 : {};
		targetFields = $defined(this['fields']) && this['fields'] instanceof Array ? this['fields'] : false;
		targetField = targetFields && targetFields.length == 1 ? targetFields[0] : false;
		targetForm = $defined(this['form']) && this['form'] instanceof HTMLFormElement ? this['form'] : false;
	}

	// 3. executes the correct encryption method
	if ( targetForm ) {
		return this.encryptForm($(targetForm),options);
	}
	else if ( targetField ) {
		return this.encryptField($(targetField),options);
	}
	else if ( targetFields ) {
		return this.encryptFields(targetFields,options);
	}

	throw new SyntaxError("A target couldn't be determined for encryption from the current context and arguments !");
};



/**
	@return true if this object is a form input (including select and textarea)
	@addon
*/
Object.prototype.isFormInput = function()
{
	return this instanceof HTMLInputElement
		|| this instanceof HTMLSelectElement
		|| this instanceof HTMLTextAreaElement;
};



/**
	A shortcut to encode different sources.<br>

	This function merely does the following :
	<ol>
		<li>detects the type of the target
		<li>instanciates a ciform.Ciform
		<li>calls the appropriate encoding method on the target
	</ol>

	@param target	Either a form, a form field or an URL to encrypt
	@param initOptions	(optional) Options to pass to the constructor of ciform.Ciform and to the encoding method
	@param encodeOptions	(optional) Options to add to options1, to pass to the encoding method (content overrides the one of 'options1')
	@see ciform.Ciform#encryptURL
	@see ciform.Ciform#encryptField
	@see ciform.Ciform#encryptForm
	@return The returned valued depends on the target (see the definition of the corresponding function)
	@member ciform
*/
/*ciform.encrypt = function( target, initOptions, encodeOptions )
{
	var targ = $(target);
	var url = !targ && typeof target == "string" ? target : false;
	var field = targ.value ? targ : false;
	var form = targ ? targ : target;

	var cif = new ciform.Ciform( merge(initOptions,{'url':}) );

	if ( url ) {
		return cif.encryptURL(url,merge(initOptions,encodeOptions));
	}
	else if ( field ) {
		return cif.encryptField(field,merge(initOptions,encodeOptions));
	}
	else {
		return cif.encryptForm(form,merge(initOptions,encodeOptions));
	}
};*/


