/**
	@fileoverview

	This library provides a very minimalistic set of functions to fill some gaps in the core Javascript language.<br>
	It should be compatible with most current market's libraries, so that if size would not be a problem it could easily be replaced/enhanced with one of them.<br>

	@author cbonar at users dot sf dot net
*/



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
	@see #equals
	@type boolean
*/
function equalsNoCase( o1, o2 )
{
	return equals(o1,o2,true);
}



/**
	@param noCase If the value is a String, use a case insensitive test to search this object
	@return true if this array contains the given value (not key)
	@addon
	@type boolean
*/
Array.prototype.contains = function( value, noCase )
{
	var notCaseSensitive = noCase ? true : false;

	for ( e in this ) {
		if ( equals(this[e],value,notCaseSensitive) ) {
			return true;
		}
	}

	return false;
}



/**
	@see Array#contains
	@see #equalsNoCase
	@addon
	@type boolean
*/
Array.prototype.containsNoCase = function( value )
{
	return this.contains(value,true);
}

