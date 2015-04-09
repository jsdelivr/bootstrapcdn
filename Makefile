# Simple Makefile wrappers to support 'make <task>' over 'node make <task>'.
# This is a simple solution to avoid rewriting deployment automation.
###
run:
	node make $@

%:
	node make $@
