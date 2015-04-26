# Introduction #

This article explains everything you need to integrate Ciform in your web site / application.


# Get Ciform #

Ciform is available as different artifacts depending on your needs :
  * **a unique Javascript file** : `libciform.js`. Only one file to include in your HTML. No further dependency required.
  * **several Javascript files** : `hex.js`, `base64.js`, `sha1.js`, `rsa.js`, `ciform.js`. If you have specific needs and wish to replace part of the dependent libraries. You will need to include each of them in your HTML.
  * **minified versions** : same as previous but their name ends with "`-min.js`". They contain compressed Javascript code and therefore are not human-readable. Use for production sites.

You may get them using one of the following way :

## Download from Google Code ##

Simply download the file you need from [the downloads section](http://code.google.com/p/ciform/downloads).

## With Maven or Ivy ##

Not yet.

# Install Ciform #

## Client side overview ##

First you will have to include the javascript library in the web page served to the client :

```
<script type="text/javascript" src="/js/libciform.js"></script>
```

Then you will have to initialize Ciform with code similar to the following snippet :

```
<script type="text/javascript">
    // defines a public RSA key in a form that Javascript can handle
    var myKey = {type:'rsa', size:768, p:[37236049,101016772,159282282,175757624,13024433,250498477,84607479,59966049,22498627,132597430,110924424,205232890,182507213,1044302], q:[107105531,186247335,15521988,62026032,158753359,206244312,50260951,80974433,210269537,225192697,68222441,99922802,211387762,867338], e:[65537], pq:[160070251,12494788,234241229,42365211,94290208,134162236,244093543,74703011,240555106,131172205,88099880,17392319,71011601,227180618,186191532,166269392,147618953,23626137,184395548,183496469,162940002,117707274,143317218,151429299,185738169,204772714,62991596,3374]};
    // creates a 'Ciform.Cipher' object to work with
    myCipher = new Ciform.Cipher({pubKey:myKey});
</script>
```

Or you could use the provided server-side script to initialize it for you :
```
<!-- Defines a public cryptographic key with default parameters as a global Javascript variable named 'myKey' and initializes a Cipher as variable 'myCipher' -->
<script type="text/javascript" src="/lib/ciform/ciform.php?action=genKey&keyVar=myKey&action=genCipher&cipherVar=myCipher"></script>
```

Finally, to trigger encryption, you would use code like this where you need to :
```
<FORM action="http://myserver/mypage.php" onsubmit="myCipher.encryptForm(this,{allowTypes:['password']});">
...
```

Ciform is independent from any javascript framework and lets you call the encryption function where and when you want (see [Javascript API](http://wiki.ciform.googlecode.com/hg/api/js/files.html) for details).

## Server side overview ##

On the server side, the easiest way to go is to let the API do all the work : just include the required dependencies and the fields identified as 'ciform-ed' will automatically be decrypted.

For instance, in PHP :

```
// makes sure required libraries are in the path (optional but recommended)
set_include_path("/opt/PEAR/".PATH_SEPARATOR.get_include_path().PATH_SEPARATOR."/opt/ciform/");
// imports the front script and automatically decrypts query fields
require_once("ciform.php");

..

// the fields in the HTTP request are automatically available in clear
echo "<p>Your password is " . $_REQUEST['myPassword'] . "</p>";
```

# Examples #

_TODO_