# Everyone can read your password ! #

To understand what Ciform is made for, you first need to know one thing : when you submit a form on a website whose URL starts with "http://" (not "https://"), the data is sent through the Internet **as clear text** most of the time (if you know this already you can skip to the next chapter).

That means that anybody "looking" at the data you send will see it in clear, including passwords<sup>*</sup>.

Let me explain : when you submit a form on the web, the data is sent from your machine to the website. But it does not go straight to it : it goes through a whole route of machines over the Internet until it reaches the server of the web site you're surfing on. For instance, it could first go to your Internet access provider's gateway, then to the first router computer, then to another one, etc. up to the website's server.

It's [relatively easy](http://www.google.fr/search?q=packet+sniffer) to intercept the _packets_ of data during this routing phase and read your data inside.

This is an important security issue of the Internet architecture which is not always well understood by newcomers.

As a remedy to this kind of problem, the "HTTPS" protocol was invented. With HTTPS, the data is transmitted through a secure channel between your computer and the website, so nobody else can read it <sup>**</sup>.

However, HTTPS is still not so widely used, especially on free hosts, for different reasons (certificate cost, high processor and bandwidth consumption, …).


<sup>*</sup> Even if passwords are usually hidden on the screen, they are sent in clear like any other field when the form is submitted

<sup>**</sup> Actually, the data is still transmitted through the same route, but is encrypted, making it impossible for others to read your data inside


# What is Ciform ? #

Ciform aims to be the "poor's replacement for HTTPS" : it encrypts web form fields before you submit them, so your data is not sent as clear text through the Internet.

To do that, it requires :

**1. A Javascript-enabled web browser**

For users, this just means to have a recent version of a web browser with Javascript enabled (see [Faq](Faq.md)).

For web admins : the client-side part of Ciform (a Javascript library) will encrypt the fields given a set of options.

**2. A Ciform-enabled web site**

For web admins : the server-side part of Ciform provides a set of functions in different languages for integration with existing forms and decryption of the submitted data.

Users might appreciate to recognize a site where Ciform is enabled : a common style is provided by default to decorate 'ci'-forms.


# Where do I start ? #

You could check [the demo](Demo.md) first, to see Ciform at work.

If you are a user seeking for privacy, you could ask the webmaster of the website(s) to add Ciform, or better : to provide HTTPS access.

If you are a webmaster / web developer, you should read [the manual](Manual.md) to learn how to add Ciform to a website.