#
# Sorry, this is not a portable Makefile ; use Linux for now or port it to your favorite OS
#

SHORTNAME=ciform
TMPFILE := $(shell mktemp)
TARGET=target
TARGET_LIB=$(TARGET)/lib
TARGET_API=$(TARGET)/api
YUI=/opt/yuicompressor/yuicompressor.jar
JSDOC=/opt/JSDoc/jsdoc.pl
PHPDOC=/opt/PhpDocumentor/phpdoc
#LIBHEX=http://www.hanewin.net/encrypt/rsa/hex.js
#LIBBASE64=http://www.hanewin.net/encrypt/rsa/base64.js
#LIBSHA1=http://pajhome.org.uk/crypt/md5/sha1.js
#LIBRSA=http://www.hanewin.net/encrypt/rsa/rsa.js
#LIBCALLWRAPPER=http://devedge-temp.mozilla.org/toolbox/examples/2003/CCallWrapper/CCallWrapper.js
LIBCORE=src/minilib.js
LIBHEX=lib/hex.js
LIBBASE64=lib/base64.js
LIBSHA1=lib/sha1.js
LIBRSA=lib/rsa.js
#LIBCALLWRAPPER=lib/CCallWrapper.js

.PHONY: all
all:
	-mkdir -p $(TARGET_LIB)
	cat $(LIBCORE) $(LIBHEX) $(LIBBASE64) $(LIBSHA1) $(LIBRSA) src/$(SHORTNAME).js > $(TMPFILE)
	java -jar $(YUI) --type js $(TMPFILE) > $(TARGET_LIB)/lib$(SHORTNAME).js
	@if [ $$? = 0 ]; then \
		rm $(TMPFILE); \
	else \
		echo "Check $(TMPFILE) to track the errors."; \
	fi

.PHONY: clean
clean:

	-rm -f test/keys/key-rsa.pub.js test/keys/protected/key-rsa.pem
	-rm -rf $(TARGET)

.PHONY: doc
doc: jsdoc phpdoc

.PHONY: jsdoc
jsdoc:
	-mkdir -p $(TARGET_API)
	$(JSDOC) -d $(TARGET_API)/js --no-lexical-privates --package-naming --nested-file-naming --logo pix/ciform-flat-48x48.png --project-name Ciform src/*.js

.PHONY: phpdoc
phpdoc:
	-mkdir -p $(TARGET_API)
	$(PHPDOC) --directory src,/opt/PEAR/Crypt --pear --target target/api/php/ --output "HTML:Smarty:PHP" --sourcecode on --title "Ciform PHP API documentation" --parseprivate on

