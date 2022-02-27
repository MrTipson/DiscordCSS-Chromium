all: clean
	zip -r extension.zip . -x \*.zip src/firefox-archived/\* .git/\* .gitignore Makefile

clean:
	rm -f extension.zip

.PHONY: all