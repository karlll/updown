COMMIT  := $(shell git rev-parse --short HEAD)
VERSION := $(shell bun -e "console.log(require('./package.json').version)")
DEFINES := --define 'BUILD_COMMIT="$(COMMIT)"' --define 'BUILD_VERSION="$(VERSION)"'

.DEFAULT_GOAL := dist

.PHONY: dist standalone standalone-linux-x64 standalone-linux-arm64 standalone-darwin-x64 standalone-darwin-arm64 standalone-windows clean

dist:
	bun build src/index.ts --target=bun --minify $(DEFINES) --outdir=dist

standalone:
	bun build src/index.ts --compile --minify $(DEFINES) --outfile=dist/updown

standalone-linux-x64:
	bun build src/index.ts --compile --minify $(DEFINES) --target=bun-linux-x64 --outfile=dist/updown-linux-x64

standalone-linux-arm64:
	bun build src/index.ts --compile --minify $(DEFINES) --target=bun-linux-arm64 --outfile=dist/updown-linux-arm64

standalone-darwin-x64:
	bun build src/index.ts --compile --minify $(DEFINES) --target=bun-darwin-x64 --outfile=dist/updown-darwin-x64

standalone-darwin-arm64:
	bun build src/index.ts --compile --minify $(DEFINES) --target=bun-darwin-arm64 --outfile=dist/updown-darwin-arm64

standalone-windows:
	bun build src/index.ts --compile --minify $(DEFINES) --target=bun-windows-x64 --outfile=dist/updown-windows-x64.exe

clean:
	rm -rf dist
