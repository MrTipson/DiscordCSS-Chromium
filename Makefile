all: clean deps zip

zip: deps
	zip -r extension.zip . -x \*.zip src/firefox-archived/\* .git/\* docs/\* \*.md .gitignore Makefile

deps:
	wget -O src/popup/iro.min.js https://raw.githubusercontent.com/jaames/iro.js/master/dist/iro.min.js

clean:
	rm -f extension.zip
	rm -f src/iro.min.js

.PHONY: all