(function(c,b,a){Ciform={};Ciform.protocol={};Ciform.protocol.prototype=new Object();Ciform.protocol.VERSION="0";Ciform.protocol.PACKET_PREFIX="ciform:";Ciform.Field=function(e,d){if(!c(d)){d=e}this.input=e instanceof HTMLElement?e:d.input;this.output=c(d.output)?d.output:this["input"];this.sha1=c(d.sha1)?d.sha1:0;this._ciphertext=null;this._commit=function(){this["input"].value="";this["output"].value=this._ciphertext}};Ciform.Field.prototype=new Object();Ciform.ciphers={};Ciform.ciphers.Encoder=function(){};Ciform.ciphers.Encoder.prototype.encode=function(d){return d};Ciform.ciphers.SHA1Encoder=function(d){this.preamble=false;this.extend(d)};Ciform.ciphers.SHA1Encoder.prototype=new Ciform.ciphers.Encoder();Ciform.ciphers.SHA1Encoder.prototype.encode=function(d){a.debug(this,"encode(",d,")");return(this["preamble"]?"sha1:b64:":"")+b.SHA1.b64_sha1(d)};Ciform.ciphers.RSAPublicKey=function(){this.type="rsa";this.size=Number;this.e=Array(Number);this.p=Array(Number);this.q=Array(Number);this.pq=Array(Number);this.mpi=Array(Number)};Ciform.ciphers.RSAEncoder=function(d){this.pubKey=null;this.preamble=false;this.salt=false;this.noPadding=false;this.extend(d);if(!c(this.pubKey)){throw new TypeError("The public key is required !")}if(this.pubKey.type!="rsa"){throw new TypeError("Type of public key must be 'rsa'")}if(!this.pubKey.pq||!this.pubKey.e){throw new TypeError("Public key is missing a field : both 'pq' and 'e' are required")}};Ciform.ciphers.RSAEncoder.prototype=new Ciform.ciphers.Encoder();Ciform.ciphers.RSAEncoder.prototype.SALT_MAX=9999;Ciform.ciphers.RSAEncoder.prototype.SALT_MIN=1;Ciform.ciphers.RSAEncoder.prototype._getMPI=function(){if(!this.pubKey.mpi){this.pubKey.mpi=b.Base64.s2r(b.RSA.b2mpi(this.pubKey.pq)+b.RSA.b2mpi([this.pubKey.e])).replace(/\n/,"")}return this.pubKey.mpi};Ciform.ciphers.RSAEncoder.prototype._getSalt=function(){return Math.floor(Math.random()*(this.SALT_MAX-this.SALT_MIN+1)+this.SALT_MIN)};Ciform.ciphers.RSAEncoder.prototype.maxLength=function(){var e=b.Base64.r2s(this._getMPI());var d=Math.floor((e.charCodeAt(0)*256+e.charCodeAt(1)+7)/8);var f=d-4;if(this.salt){f-=new Number(this.SALT_MAX).toString().length}a.debug(this,".maxLength()=",f);return f};Ciform.ciphers.RSAEncoder.prototype.encode=function(l){a.debug(this,"encode(",l,")");var j=new Array();var h=new Array();j=this.pubKey.pq;h=this.pubKey.e;var g=l;if(this.salt){var i=this._getSalt();a.debug("salt="+i);g="salt"+i+":"+l}var d=g+String.fromCharCode(1);var e=this.maxLength();if(!this.noPadding&&!this.salt&&d.length>e){throw new RangeError("Plain text length must be less than "+e+" characters")}var k=b.Hex.s2b(d);var f=b.RSA.encrypt(k,h,j);return(this.preamble?"rsa:0x":"")+b.Hex.s2hex(b.Hex.b2s(f))};Ciform.ciphers.ChainEncoder=function(d){this.encoders=d};Ciform.ciphers.ChainEncoder.prototype=new Ciform.ciphers.Encoder();Ciform.ciphers.ChainEncoder.prototype.encode=function(d){var f=d;for(var g=0;g<this.encoders.length;g++){f=this.encoders[g].encode(f)}return f};Ciform.ciphers.CiformPacketizer=function(){};Ciform.ciphers.CiformPacketizer.prototype=new Ciform.ciphers.Encoder();Ciform.ciphers.CiformPacketizer.prototype.encode=function(d){return new RegExp("^"+Ciform.protocol.PACKET_PREFIX+"(.*)").test(d)?d:Ciform.protocol.PACKET_PREFIX+d};Ciform.Cipher=function(e){a.debug("new Ciform.Cipher(",e,")");this.encoder=null;this.onerror=function(g,f){a.error(f);throw g};this.onEncryptionStart=function(g,f){a.debug(this,".onEncryptionStart(",g,f,")",new Date())};this.onEncryptionEnd=function(g,f){a.debug(this,".onEncryptionEnd(",g,f,")",new Date())};for(var d=0;d<arguments.length;d++){this.extend(arguments[d])}if(!this["encoder"]&&this["pubKey"]){this["encoder"]=new Ciform.ciphers.ChainEncoder([new Ciform.ciphers.RSAEncoder(merge({preamble:true,salt:true},this)),new Ciform.ciphers.CiformPacketizer()])}if(!this["encoder"]){throw new TypeError("The encoder is required !")}};Ciform.Cipher.prototype.encryptText=function(i,f){a.debug(this,".encryptText(",i,f,")");if(!c(f)){f=i}var g=merge(this,f);var h=g.encoder;var d=null;if(!(h instanceof Ciform.ciphers.ChainEncoder)||!(h.encoders[h.encoders.length-1] instanceof Ciform.ciphers.CiformPacketizer)){h=new Ciform.ciphers.ChainEncoder([g.encoder,new Ciform.ciphers.CiformPacketizer()])}try{this.onEncryptionStart(i,g);d=h.encode(i)}catch(h){this.onerror(h,g);d=null}finally{this.onEncryptionEnd(i,g)}return d};Ciform.Cipher.prototype.encryptField=function(k,f){a.debug(this,".encryptField(",k,f,")");if(!c(f)){f=k}var i=merge({commit:true},new Ciform.Field(k),f);var l=i.input.value;var g=i.output;var d=false;if(/ciform-sha1/.test(g.className)){i.sha1=2}else{if(/sha1/.test(g.className)){i.sha1=1}}this.onEncryptionStart(k,i);try{if(i.sha1){l=new Ciform.ciphers.SHA1Encoder({preamble:i.sha1==2}).encode(l)}var h=this.encryptText(l,i);if(h!=null){i._ciphertext=h;if(i.commit){i._commit();d=true}else{d=i}}else{d=false}}catch(j){this.onerror(j,i);d=false}finally{this.onEncryptionEnd(k,i)}return d};Ciform.Cipher.prototype.encryptFields=function(g,i){a.debug(this,".encryptFields(",g,i,")");var h=[];var d=false;try{this.onEncryptionStart(g,i);for(var j=0;j<g.length;j++){h[j]=this.encryptField(g[j],merge(i,{commit:false}));if(h[j]==false){this.onEncryptionEnd(g,i);return false}}for(var j=0;j<h.length;j++){h[j]._commit()}d=true}catch(k){this.onerror(k,i);d=false}finally{this.onEncryptionEnd(g,i)}return d};Ciform.Cipher.prototype.encryptForm=function(m,o){a.debug(this,".encryptForm(",m,o,")");if(!c(o)){o=m}var d=m instanceof HTMLFormElement?m:o.form;var i=merge({form:d},o);var j=new Array();j.extend(i.form.elements);var p=true;try{this.onEncryptionStart(m,i);var n=i.allowTypes;var h=i.rejectTypes;for(var k=0;k<j.length;k++){var g=j[k];if(g.tagName.toUpperCase()=="INPUT"&&g.type&&!["button","submit","image"].containsValue(g.type,true)&&!equals("disabled",g.disabled,true)&&!equals("readonly",g.readonly,true)){if(n&&!n.containsValue(g.type,true)){j.splice(k,1)}else{if(h&&h.containsValue(g.type,true)){j.splice(k,1)}}}else{j.splice(k,1)}}p=this.encryptFields(j,i)}catch(l){this.onerror(l,i);p=false}finally{this.onEncryptionEnd(m,i)}return p};Ciform.Cipher.prototype.encryptURL=function(d,o){a.debug(this,".encryptURL(",d,o,")");var f=d;try{this.onEncryptionStart(d,o);var j=/([^\?]*)\?(.*)/.exec(d);if(j&&j.length>=3){f=j[1]+"?";var i=j[2].split(/&/);for(var l=0;l<i.length;l++){var k=/([^=]*)=?(.*)/.exec(i[l]);if(k[1]){var n=k[1];var g=k[2];f+=n;if(g){var m=!o.fields||o.fields[n];f+="="+(m?this.encryptText(g):g)}}if(l+1<i.length){f+="&"}}}}catch(h){this.onerror(h,o)}finally{this.onEncryptionEnd(d,o)}return f}})($defined,Crypto,console);