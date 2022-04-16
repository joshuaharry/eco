bin/eco:
	go build -o ./bin ./cmd/eco

.PHONY: clean
clean:
	rm -rf bin/eco

.PHONY: test
test:
	go test ./...

# You'll need to have [gow](https://github.com/mitranim/gow) installed for the
# watch commands below.
.PHONY: build-watch
build-watch:
	gow build -o ./bin ./cmd/eco

.PHONY: test-watch
test-watch:
	gow test ./...
