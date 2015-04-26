## Should I use Ciform over HTTPS ? ##

No you should not : if the form's page is accessed through HTTPS, then the data is already securely submitted.

Ciform can be seen as a light replacement for HTTPS when it is not available, but it is not as much secure and only provides encryption (not authentication).

Of course, it will still work if you do Ciform over HTTPS...

## What if the navigator does not support Javascript ? ##

If Javascript is not available, the form will still be accessible, but the data will be submitted unencrypted, like if Ciform never existed.

This is also true when Javascript is disabled through the navigator's preferences.

# Common error messages #

## oktags.containsValue is not a function ##

Check that you pass an array to the Javascript encryption functions :

`myCipher.encryptForm(this,{allowTypes:['password']});`

not :

`myCipher.encryptForm(this,{allowTypes:'password'});`