# shortname of the secure logon form
SHORTNAME=ciform
TMPFILE := $(shell mktemp)
YUI=/opt/yuicompressor/yuicompressor.jar
#LIBHEX=http://www.hanewin.net/encrypt/rsa/hex.js
#LIBBASE64=http://www.hanewin.net/encrypt/rsa/base64.js
#LIBSHA1=http://pajhome.org.uk/crypt/md5/sha1.js
#LIBRSA=http://www.hanewin.net/encrypt/rsa/rsa.js
LIBHEX=lib/hex.js
LIBBASE64=lib/base64.js
LIBSHA1=lib/sha1.js
LIBRSA=lib/rsa.js

.PHONY: all
all:
	-mkdir target
	cat $(LIBHEX) $(LIBBASE64) $(LIBSHA1) $(LIBRSA) src/$(SHORTNAME).js > $(TMPFILE)
	java -jar $(YUI) --type js $(TMPFILE) > target/lib$(SHORTNAME).js
	@if [ $$? = 0 ]; then \
		rm $(TMPFILE); \
	else \
		echo "Check $(TMPFILE) to track the errors."; \
	fi

.PHONY: clean
clean:

	-rm -f test/keys/key-rsa.pub.js test/keys/protected/key-rsa.pem
	-rm -f target