/*!
    Copyright Herbert Hanewinkel, www.haneWIN.de
    Original code : http://www.hanewin.net/encrypt/rsa/hex.js
    About this package : http://ciform.google.com
*/
//
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

})(bs, bm);