/*!
	Copyright (c) 2008 Nicolas BONARDELLE <http://nicobo.net/contact>
*/


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

