//
// NOTE : The original code is wrapped so that the defined functions don't collide with existing ones.
// See http://michaux.ca/articles/javascript-namespacing.
// See http://msdn.microsoft.com/en-us/library/259s7zc1%28v=vs.85%29.aspx
//

/** @namespace */
Crypto = typeof Crypto != 'undefined' ? Crypto : {};
/** @namespace */
Crypto.Base64 = (function(/*window, undefined, $*/) {

//
// START OF ORIGINAL CODE
//


/* OpenPGP radix-64/base64 string encoding/decoding
 * Copyright 2005 Herbert Hanewinkel, www.haneWIN.de
 * version 1.0, check www.haneWIN.de for the latest version

 * This software is provided as-is, without express or implied warranty.  
 * Permission to use, copy, modify, distribute or sell this software, with or
 * without fee, for any purpose and by any individual or organization, is hereby
 * granted, provided that the above copyright notice and this paragraph appear 
 * in all copies. Distribution as a part of an application or binary must
 * include the above copyright notice in the documentation and/or other materials
 * provided with the application or distribution.
 */

var b64s='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function s2r(t)
{
 var a, c, n;
 var r='', l=0, s=0;
 var tl=t.length;

 for(n=0; n<tl; n++)
 {
  c=t.charCodeAt(n);
  if(s == 0)
  {
   r+=b64s.charAt((c>>2)&63);
   a=(c&3)<<4;
  }
  else if(s==1)
  {
   r+=b64s.charAt((a|(c>>4)&15));
   a=(c&15)<<2;
  }
  else if(s==2)
  {
   r+=b64s.charAt(a|((c>>6)&3));
   l+=1;
   if((l%60)==0) r+="\n";
   r+=b64s.charAt(c&63);
  }
  l+=1;
  if((l%60)==0) r+="\n";

  s+=1;
  if(s==3) s=0;  
 }
 if(s>0)
 {
  r+=b64s.charAt(a);
  l+=1;
  if((l%60)==0) r+="\n";
  r+='=';
  l+=1;
 }
 if(s==1)
 {
  if((l%60)==0) r+="\n";
  r+='=';
 }

 return r;
}

function r2s(t)
{
 var c, n;
 var r='', s=0, a=0;
 var tl=t.length;

 for(n=0; n<tl; n++)
 {
  c=b64s.indexOf(t.charAt(n));
  if(c >= 0)
  {
   if(s) r+=String.fromCharCode(a | (c>>(6-s))&255);
   s=(s+2)&7;
   a=(c<<s)&255;
  }
 }
 return r;
}

//
// END OF ORIGINAL CODE
//

return {
    s2r: s2r,
    r2s: r2s,
};

})(/*window, undefined, $*/);//
// NOTE : The original code is wrapped so that the defined functions don't collide with existing ones.
// See http://michaux.ca/articles/javascript-namespacing.
// See http://msdn.microsoft.com/en-us/library/259s7zc1%28v=vs.85%29.aspx
//

/** @namespace */
Crypto = typeof Crypto != 'undefined' ? Crypto : {};
/** @namespace */
Crypto.Hex = (function(bs,bm) {

//
// START OF ORIGINAL CODE
//


/*
 * conversion functions:
 * - num array to string
 * - string to hex
 */

function s2b(s)
{
 var bn=1, r=[0], rn=0, sn=0, sb=256;
 var bits=s.length*8;

 for(var n=0; n<bits; n++)
 {
  if((sb<<=1) > 255)
  {
   sb=1; var c=s.charCodeAt(sn++);
  }
  if(bn > bm)
  {
   bn=1;
   r[++rn]=0;
  }
  if(c & sb) r[rn]|=bn;
  bn<<=1;
 }
 return r;
}

function b2s(b)
{
 var bn=1, bc=0, r=[0], rb=1, rn=0;
 var bits=b.length*bs;
 var n, rr='';

 for(n=0; n<bits; n++)
 {
  if(b[bc] & bn) r[rn]|=rb;
  if((rb<<=1) > 255)
  {
   rb=1; r[++rn]=0;
  }
  if((bn<<=1) > bm)
  {
   bn=1; bc++;
  }
 }

 while(rn >= 0 && r[rn]==0) rn--;
 for(n=0; n<=rn; n++) rr+=String.fromCharCode(r[n]);
 return rr;
}

function s2hex(s)
{
  var result = '';
  for(var i=0; i<s.length; i++)
  {
    var c = s.charCodeAt(i);
    result += ((c<16) ? "0" : "") + c.toString(16);
  }
  return result;
}

function hex2s(hex)
{
  var r='';
  if(hex.indexOf("0x") == 0 || hex.indexOf("0X") == 0) hex = hex.substr(2);

  if(hex.length%2) hex+='0';

  for(var i = 0; i<hex.length; i += 2)
    r += String.fromCharCode(parseInt(hex.slice(i, i+2), 16));
  return r;
}

//
// END OF ORIGINAL CODE
//

return {
    s2b: s2b,
    b2s: b2s,
    s2hex: s2hex,
    hex2s: hex2s
};

})(bs, bm);//////////////////////////////////////////////////////////////////////////////////
//
// minilib.js
//
// Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
//



/**
	@fileoverview

	This library provides a very minimalistic set of functions to fill some gaps in the core Javascript language.<br>
	It should be replaced with one of the (better) frameworks on the market (jquery, mootools, ...) if size is not a problem.<br>

	@author Nicolas BONARDELLE &lt;<a href="http://nicobo.net/contact">http://nicobo.net/contact</a>&gt;
*/



//
// ELEMENT SELECTION
//



/**
	@return true if the argument is not undefined nor null
	@type boolean
*/
function $defined( name )
{
	return name != null && name != undefined;
}



/**
	Light implementation of the $ function of modern libraries : tries to find a DOM node from a versatile key.<br>

	<p>NOTE : Not quite compatible with jQuery (because it requires something like '#myid').</p>

	@param fieldName the name of the field to find, or the field itself
	@return The DOM node corresponding to the parameters or undefined if not found
	@type Element
*/
function $( fieldName )
{
	return typeof fieldName == "object" ? fieldName : document.getElementById(fieldName);
}



//
// OBJECTS AND COLLECTIONS MANIPULATION
//



/**
	Copies all fields from the given arguments into this object.

	@return this
	@type Object
	@addon
*/
Object.prototype.extend = function()
{
	for ( var a=0 ; a<arguments.length ; a++ )
	{
		if ( typeof arguments[a] == "object" )
		{
			for ( var f in arguments[a] )
			{
				this[f] = arguments[a][f];
			}
		}
	}
	return this;
}



/**
	Creates a new object with the properties of several objects merged together.<br>
	The properties of the latest argument overrides the ones of the previous arguments.

	@return a new object with the properties of all given arguments
	@type Object
*/
function merge()
{
	var merged = new Object();
	Object.extend.apply(merged,arguments);
	return merged;
}



/**
	Compares two objects of any type.

	@param noCase	If both objects are Strings, do a case insensitive comparison
	@return true if the objects are equals, else false
	@type boolean
*/
function equals( o1, o2, noCase )
{
	return (noCase && typeof o1 == "string" && typeof o2 == "string") ? (o1.toUpperCase() == o2.toUpperCase()) : (o1 == o2);
}



/**
    @param value The value to look for
	@param noCase If the value is a String, use a case insensitive test to search this object
	@return true if this array contains the given value (not key)
	@addon
	@type boolean
*/
Array.prototype.containsValue = function( value, noCase )
{
	var notCaseSensitive = noCase ? true : false;

	for ( e in this ) {
		if ( equals(this[e],value,notCaseSensitive) ) {
			return true;
		}
	}

	return false;
}



//
// DHTML UTILITIES
//



/**
	Tests the Element to see if it has the passed in className.
	@see "MooTools" {@link http://docs.mootools.net/Element/Element#Element:hasClass}
*/
HTMLElement.prototype.hasClass = function( className )
{
	return (" "+this.className+" ").indexOf(" "+className+" ") != -1;
}



/**
	Adds the passed in class to the Element, if the Element doesnt already have it.
	@see "MooTools" {@link http://docs.mootools.net/Element/Element#Element:addClass}
*/
HTMLElement.prototype.addClass = function( className )
{
	if ( ! this.hasClass(className) ) {
		this.className = this.className + " " + className;
	}
}



/**
	Works like Element:addClass, but removes the class from the Element.
	@see "MooTools" {@link http://docs.mootools.net/Element/Element#Element:removeClass}
*/
HTMLElement.prototype.removeClass = function( className )
{
	if ( this.hasClass(className) ) {
		this.className = (" "+this.className+" ").replace(" "+className+" ","");
	}
}



//
// PATCHES, TRICKS
//



/**
	Utility object dedicated to multi-threading, asynchrone calls, ...
	It should not be used directly.
	@see Object#delay
*/
Thread = {
	/**
		An array used to store function calls to be made in an asynchronous way.
		Use {@link Thread#queue Thread.queue}.push(myfunction)}
	*/
	queue: [],

	/**
		Executes a function stored in the queue.
		@param i the index of the function in the queue
		@return the value returned by the function once executed
	*/
	execute: function( i ) {
		console.log(this);
		return this.queue[i]();
	}
}



/**
	Delays the execution of a function in time.

	@param {int}	delay	delay in milliseconds
	@param {Function} func	The function to execute
	@param arg1		(optional) ... and next args : the arguments to pass to the function when executed
*/
function delay( delay, obj, func, arg1 )
{
	var args = arguments;
	var i = Thread.queue.push( function(){ func.apply(obj,args) } ) - 1;
	setTimeout( "Thread.execute("+i+")", delay );
}



/**
	@see GLOBALS#delay
*/
Object.prototype.delay = function( delay, func, arg1 )
{
	delay(delay,this,func,arg1);
}



/**
	Attempts forcing refreshing an object on the screen.<br>

	<p>This can be usefull for instance when you want an element to be redrawn on the screen
	to show a slight change in a CSS property, but there is an intensive Javascript operation
	going on that takes precedence over graphical redrawing.</p>

	<p><em>WARNING</em> : this operation involves doing a deep copy of the object, which can consume a lot of resources.</p>

	Seen at {@link http://bytes.com/forum/thread612023.html Bytes.com}

	@param {Node} o The object to refresh
*/
function refresh( o )
{
	// performs a deep copy of the object so that no change will be noticeable on the screen
	var b = o.cloneNode(true);
	// the first 'replaceChild' is the operation that should force the web navigator to refresh the object
	o.parentNode.replaceChild(b,o);
	// the second 'replaceChild' ensures that the references to the object will be left unchanged
	b.parentNode.replaceChild(o,b);
}



/**
	@see GLOBALS#refresh
*/
Object.prototype.refresh = function()
{
	refresh(this);
}

//
// NOTE : The original code is wrapped so that the defined functions don't collide with existing ones.
// See http://michaux.ca/articles/javascript-namespacing.
// See http://msdn.microsoft.com/en-us/library/259s7zc1%28v=vs.85%29.aspx
//

/** @namespace */
Crypto = typeof Crypto != 'undefined' ? Crypto : {};
/** @namespace */
Crypto.RSA = (function(/*window, undefined, $*/) {

//
// START OF ORIGINAL CODE
//

/* RSA public key encryption/decryption
 * The following functions are (c) 2000 by John M Hanna and are
 * released under the terms of the Gnu Public License.
 * You must freely redistribute them with their source -- see the
 * GPL for details.
 *  -- Latest version found at http://sourceforge.net/projects/shop-js
 *
 * GnuPG multi precision integer (mpi) conversion added
 * 2004 by Herbert Hanewinkel, www.haneWIN.de
 */

// --- Arbitrary Precision Math ---
// badd(a,b), bsub(a,b), bmul(a,b)
// bdiv(a,b), bmod(a,b), bmodexp(xx,y,m)

// set the base... 32bit cpu -> bs=16, 64bit -> bs=32
// bs is the shift, bm is the mask

var bs=28;
var bx2=1<<bs, bm=bx2-1, bx=bx2>>1, bd=bs>>1, bdm=(1<<bd)-1;

var log2=Math.log(2);

function badd(a,b) // binary add
{
 var al=a.length, bl=b.length;

 if(al < bl) return badd(b,a);

 var r=new Array(al);
 var c=0, n=0;

 for(; n<bl; n++)
 {
  c+=a[n]+b[n];
  r[n]=c & bm;
  c>>>=bs;
 }
 for(; n<al; n++)
 {
  c+=a[n];
  r[n]=c & bm;
  c>>>=bs;
 }
 if(c) r[n]=c;
 return r;
}

function bsub(a,b) // binary subtract
{
 var al=a.length, bl=b.length;

 if(bl > al) return [];
 if(bl == al)
 {
  if(b[bl-1] > a[bl-1]) return [];
  if(bl==1) return [a[0]-b[0]];
 }

 var r=new Array(al);
 var c=0;

 for(var n=0; n<bl; n++)
 {
  c+=a[n]-b[n];
  r[n]=c & bm;
  c>>=bs;
 }
 for(;n<al; n++)
 {
  c+=a[n];
  r[n]=c & bm;
  c>>=bs;
 }
 if(c) return [];

 if(r[n-1]) return r;
 while(n>1 && r[n-1]==0) n--;
 return r.slice(0,n);
}

function zeros(n)
{
 var r=new Array(n);

 while(n-->0) r[n]=0;
 return r;
}

function bmul(a,b) // binary multiply
{
 b=b.concat([0]);
 var al=a.length, bl=b.length;
 var n,nn,aa,c,m, g,gg,h,hh,ghh,ghhb;

 var r=zeros(al+bl+1);

 for(n=0; n<al; n++)
 {
  aa=a[n];
  if(aa)
  {
   c=0;
   hh=aa>>bd; h=aa & bdm;
   m=n;
   for(nn=0; nn<bl; nn++, m++)
   {
    g = b[nn]; gg=g>>bd; g=g & bdm;
    // (gg*2^15 + g) * (hh*2^15 + h) = (gghh*2^30 + (ghh+hgg)*2^15 +hg)
    ghh = g * hh + h * gg;
    ghhb= ghh >> bd; ghh &= bdm;
    c += r[m] + h * g + (ghh << bd);
    r[m] = c & bm;
    c = (c >> bs) + gg * hh + ghhb;
   }
  }
 }
 n=r.length;

 if(r[n-1]) return r;
 while(n>1 && r[n-1]==0) n--;
 return r.slice(0,n);
}

function toppart(x,start,len)
{
 var n=0;
 while(start >= 0 && len-->0) n=n*bx2+x[start--];
 return n;
}

// ----------------------------------------------------
// 14.20 Algorithm Multiple-precision division from HAC

function bdiv(x,y)
{
 var n=x.length-1, t=y.length-1, nmt=n-t;

 // trivial cases; x < y
 if(n < t || n==t && (x[n]<y[n] || n>0 && x[n]==y[n] && x[n-1]<y[n-1]))
 {
  this.q=[0]; this.mod=x;
  return this;
 }

 // trivial cases; q < 4
 if(n==t && toppart(x,t,2)/toppart(y,t,2) <4)
 {
  var qq=0, xx;
  for(;;)
  {
   xx=bsub(x,y);
   if(xx.length==0) break;
   x=xx; qq++;
  }
  this.q=[qq]; this.mod=x;
  return this;
 }

 var shift, shift2
 // normalize
 shift2=Math.floor(Math.log(y[t])/log2)+1;
 shift=bs-shift2;
 if(shift)
 {
  x=x.concat(); y=y.concat()
  for(i=t; i>0; i--) y[i]=((y[i]<<shift) & bm) | (y[i-1] >> shift2);
  y[0]=(y[0]<<shift) & bm;
  if(x[n] & ((bm <<shift2) & bm))
  {
   x[++n]=0; nmt++;
  }
  for(i=n; i>0; i--) x[i]=((x[i]<<shift) & bm) | (x[i-1] >> shift2);
  x[0]=(x[0]<<shift) & bm;
 }

 var i, j, x2;
 var q=zeros(nmt+1);
 var y2=zeros(nmt).concat(y);
 for(;;)
 {
  x2=bsub(x,y2);
  if(x2.length==0) break;
  q[nmt]++;
  x=x2;
 }

 var yt=y[t], top=toppart(y,t,2)
 for(i=n; i>t; i--)
 {
  var m=i-t-1;
  if(i >= x.length) q[m]=1;
  else if(x[i] == yt) q[m]=bm;
  else q[m]=Math.floor(toppart(x,i,2)/yt);

  var topx=toppart(x,i,3);
  while(q[m] * top > topx) q[m]--;

  //x-=q[m]*y*b^m
  y2=y2.slice(1);
  x2=bsub(x,bmul([q[m]],y2));
  if(x2.length==0)
  {
   q[m]--;
   x2=bsub(x,bmul([q[m]],y2));
  }
  x=x2;
 }
 // de-normalize
 if(shift)
 {
  for(i=0; i<x.length-1; i++) x[i]=(x[i]>>shift) | ((x[i+1] << shift2) & bm);
  x[x.length-1]>>=shift;
 }
 n = q.length;
 while(n > 1 && q[n-1]==0) n--;
 this.q=q.slice(0,n);
 n = x.length;
 while(n > 1 && x[n-1]==0) n--;
 this.mod=x.slice(0,n);
 return this;
}

function simplemod(i,m) // returns the mod where m < 2^bd
{
 var c=0, v;
 for(var n=i.length-1; n>=0; n--)
 {
  v=i[n];
  c=((v >> bd) + (c<<bd)) % m;
  c=((v & bdm) + (c<<bd)) % m;
 }
 return c;
}

function bmod(p,m) // binary modulo
{
 if(m.length==1)
 {
  if(p.length==1) return [p[0] % m[0]];
  if(m[0] < bdm) return [simplemod(p,m[0])];
 }

 var r=new bdiv(p,m);
 return r.mod;
}

// ------------------------------------------------------
// Barrett's modular reduction from HAC, 14.42, CRC Press

function bmod2(x,m,mu)
{
 var xl=x.length - (m.length << 1);
 if(xl > 0) return bmod2(x.slice(0,xl).concat(bmod2(x.slice(xl),m,mu)),m,mu);

 var ml1=m.length+1, ml2=m.length-1,rr;
 //var q1=x.slice(ml2)
 //var q2=bmul(q1,mu)
 var q3=bmul(x.slice(ml2),mu).slice(ml1);
 var r1=x.slice(0,ml1);
 var r2=bmul(q3,m).slice(0,ml1);
 var r=bsub(r1,r2);
 //var s=('x='+x+'\nm='+m+'\nmu='+mu+'\nq1='+q1+'\nq2='+q2+'\nq3='+q3+'\nr1='+r1+'\nr2='+r2+'\nr='+r); 
 if(r.length==0)
 {
  r1[ml1]=1;
  r=bsub(r1,r2);
 }
 for(var n=0;;n++)
 {
  rr=bsub(r,m);
  if(rr.length==0) break;
  r=rr;
  if(n>=3) return bmod2(r,m,mu);
 }
 return r;
}

function bmodexp(xx,y,m) // binary modular exponentiation
{
 var r=[1], an,a, x=xx.concat();
 var n=m.length*2;
 var mu=new Array(n+1);

 mu[n--]=1;
 for(; n>=0; n--) mu[n]=0; mu=new bdiv(mu,m).q;

 for(n=0; n<y.length; n++)
 {
  for(a=1, an=0; an<bs; an++, a<<=1)
  {
   if(y[n] & a) r=bmod2(bmul(r,x),m,mu);
   x=bmod2(bmul(x,x),m,mu);
  }
 }
 return r;
}

// -----------------------------------------------------
// Compute s**e mod m for RSA public key operation

function RSAencrypt(s, e, m) { return bmodexp(s,e,m); }

// Compute m**d mod p*q for RSA private key operations.

function RSAdecrypt(m, d, p, q, u)
{
 var xp = bmodexp(bmod(m,p), bmod(d,bsub(p,[1])), p);
 var xq = bmodexp(bmod(m,q), bmod(d,bsub(q,[1])), q);

 var t=bsub(xq,xp);
 if(t.length==0)
 {
  t=bsub(xp,xq);
  t=bmod(bmul(t, u), q);
  t=bsub(q,t);
 }
 else
 {
  t=bmod(bmul(t, u), q);
 } 
 return badd(bmul(t,p), xp);
}

// -----------------------------------------------------------------
// conversion functions: num array <-> multi precision integer (mpi)
// mpi: 2 octets with length in bits + octets in big endian order

function mpi2b(s)
{
 var bn=1, r=[0], rn=0, sb=256;
 var c, sn=s.length;
 if(sn < 2)
 {
    alert('string too short, not a MPI');
    return 0;
 }

 var len=(sn-2)*8;
 var bits=s.charCodeAt(0)*256+s.charCodeAt(1);
 if(bits > len || bits < len-8) 
 {
    alert('not a MPI, bits='+bits+",len="+len);
    return 0;
 }

 for(var n=0; n<len; n++)
 {
  if((sb<<=1) > 255)
  {
   sb=1; c=s.charCodeAt(--sn);
  }
  if(bn > bm)
  {
   bn=1;
   r[++rn]=0;
  }
  if(c & sb) r[rn]|=bn;
  bn<<=1;
 }
 return r;
}

function b2mpi(b)
{
 var bn=1, bc=0, r=[0], rb=1, rn=0;
 var bits=b.length*bs;
 var n, rr='';

 for(n=0; n<bits; n++)
 {
  if(b[bc] & bn) r[rn]|=rb;
  if((rb<<=1) > 255)
  {
   rb=1; r[++rn]=0;
  }
  if((bn<<=1) > bm)
  {
   bn=1; bc++;
  }
 }

 while(rn && r[rn]==0) rn--;

 bn=256;
 for(bits=8; bits>0; bits--) if(r[rn] & (bn>>=1)) break;
 bits+=rn*8;

 rr+=String.fromCharCode(bits/256)+String.fromCharCode(bits%256);
 if(bits) for(n=rn; n>=0; n--) rr+=String.fromCharCode(r[n]);
 return rr;
}

//
// END OF ORIGINAL CODE
//

return {
    b2mpi: b2mpi,
    encrypt: RSAencrypt,
    decrypt: RSAdecrypt
};

})(/*window, undefined, $*/);//
// NOTE : The original code is wrapped so that the defined functions don't collide with existing ones.
// See http://michaux.ca/articles/javascript-namespacing.
// See http://msdn.microsoft.com/en-us/library/259s7zc1%28v=vs.85%29.aspx
//

/** @namespace */
Crypto = typeof Crypto != 'undefined' ? Crypto : {};
/** @namespace */
Crypto.SHA1 = (function(/*window, undefined, $*/) {

//
// START OF ORIGINAL CODE
//


/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

//
// END OF ORIGINAL CODE
//

return {
    hex_sha:hex_sha1,
    b64_sha1:b64_sha1,
    str_sha1:str_sha1,
    hex_hmac_sha1:hex_hmac_sha1,
    b64_hmac_sha1:b64_hmac_sha1,
    str_hmac_sha1:str_hmac_sha1
};

})(/*window, undefined, $*/);//////////////////////////////////////////////////////////////////////////////////
//
// ciform.js
//
// Copyright © 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
//

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
 * &lt;FORM action="http://myserver/mypage.php" onsubmit="javascript:mycipher.encryptForm(this,{'allowTypes':"password"});"&gt;
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

	@requires http://www.hanewin.net/encrypt/rsa/base64.js
	@requires http://www.hanewin.net/encrypt/rsa/hex.js
	@requires http://pajhome.org.uk/crypt/md5/sha1.js
	@requires http://www.hanewin.net/encrypt/rsa/rsa.js
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
	@param {Object} options (optional)
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
		Defaults to {@link #in}.
		@type HTMLElement
	*/
	this.output = $defined(options['output']) ? options['output'] : this['input'];

	/**
		<ul>
		<li>If == 1, indicates that this field should be SHA1-encoded before encryption.
		<li>If == 2, meta-data will also be prepended to the result.
		</ul>
		DEFAULT : 0 (do not use SHA-1 at all)
		@type Integer
	*/
	this.sha1 = $defined(options['sha1']) ? options['sha1'] : 0;

	//
	// PRIVATE PART
	//

	/**
		@private
		Takes the value of the encrypted text on encryption.
	*/
	this._ciphertext = null;

	/**
		@private
		Applies the encryption value stored in {@link #_ciphertext} to the output field
		and clears the input field so it is not transmitted in clear if it's different from the output one.
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
		<p>DEFAULT : false</p>
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
		@see http://en.wikipedia.org/wiki/RSA.
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
		<p>DEFAULT : false : don't add meta-data in the beginning of the ciphertext.</p>
		@type boolean
	*/
	this.preamble = false;

	/**
		<p>If true, a random string will be prepended to the text before encryption,
		in order to make the ciphertext different every time, even with the same original text.<br>
		E.g. "1234:my message" : "1234:" is the salt</p>
		<p>DEFAULT : false : don't add salt in the beginning of the ciphertext</p>
		<p><b>WARNING</b> : without salt, the same message encoded with the same key will always give the same ciphertext
			(this could be a security issue).</p>
		@type boolean
	*/
	this.salt = false;

	/**
		<p>If true, does not check that the padding scheme is correct (does not apply if salt is added).</p>
		<p>DEFAULT : false : do check that the padding scheme is correct (does not apply if salt is added).</p>
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
	@return a random number between this.SALT_MIN and this.SALT_MAX
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
	Adds {@link Ciform.protocol#PACKET_PREFIX} to the message, if necessary.
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
	@param {Object} options (optional) (and next arguments)
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
		<p>The encoder to use on each of the {@link #targets}</p>
		<p>Default : a {@link Ciform.ciphers.RSAEncoder} inside a {@link Ciform.ciphers.CiformPacketizer} <b>if at least the <code>pubKey</code> property is provided in the options</b></p>
		@type Ciform.ciphers.Encoder
	*/
	this.encoder = null;


	//
	// FUNCTIONS DEFINITION
	//

	/**
		A custom error handler that will be called with the error as an argument during encryption operations.<br>

		<p>Default function will log the error and pass it to the upper error handler.</p>

		@param {Error} e the error that happened
		@param {Object} context any information about the context, in the form of an object with properties
		@type function
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
	
		@param target	The object that's going to be encrypted
		@param options	(optional) The parameters of the current context, if any
	*/
	this.onEncryptionStart = function( target, options )
	{
		console.debug(this,".onEncryptionStart(",target,options,")",new Date());
	};



	/**
		This function is called once the encryption of an object has ended.<br>
	
		<p>This default implementation does nothing.
		It should be overridden to match specific needs.</p>
	
		@param target	The object that has just been be encrypted
		@param options	(optional) The parameters of the current context, if any
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
	@param {Object} options (optional)
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

	@param {HTMLElement} target
		The element to encrypt.<br>
		As an alternative, this parameter can be ignored if the element is given in the options.
	@param {Object} options (optional)
		An object with the following properties :
		As a convenience, this may be the field itself, all default options will then be applied.
		<ul>
		<li><code>&lt;{@link Ciform.Field}&gt; field</code> -
			Same as (replaces) <code>target</code>.<br>
		<li><code>&lt;{@link boolean}&gt; commit</code> -
			If true, will write ciphertext into the output field.<br>
			If false, will not touch the in and out field, but instead will return the {@link Ciform.Field}
			with the following properties added :
			<ul>
				<li><code>&lt;{@link String}&gt; text</code> -
					The value of the <em>input</em> field at the end of the operation.
				<li><code>&lt;{@link String}&gt; ciphertext</code> -
					The value of the <em>output</em> field at the end of the operation.
			</ul>
			Defaults to true.<br>
			This parameter is usefull to handle transactional operations on several fields at once.
		</ul>
		As an alternative,<code>sha1</code> or <code>ciform-sha1</code> css classes can be set
		in the <code>class</code> attribute of output fields, in order to set the {@link Ciform.Field#sha1} property to 1 or 2 respectively.
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

	// NOTE : localOptions inherit both options specific to the field and those more generic ('commit')
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

	<p>For instance, the following encrypts input fields of type <em>password</em> in a form :
	<pre>encryptForm(myForm,{'allowTypes':["password"]})</pre></p>

	@param {HTMLFormElement} target
		The form to encrypt.<br>
		As an alternative, this parameter can be ignored if the target is given in the options.
	@param {Object} options (optional)
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
	@param {Object} options (optional)
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
// 	@param options	(optional)
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