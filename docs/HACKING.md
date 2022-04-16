# Developing

To build the project, run:

```sh
go build -o ./bin ./cmd/buddy
```

Unit testing can be as straightforward as:

```sh
go test ./...
```

However, for a nicer development experience, you may want to install a few
tools:

- If you have `make` installed, you can run `make` and `make test` to compile
  and test the project automatically.
- Even better, if you have [gow](https://github.com/mitranim/gow) installed,
  you can use `make build-watch` and `make test-watch` to compile and unit test
  the project whenever you make any changes.
- If you want `gofmt` to run whenever you make a commit, you can install
  [pre-commit](https://pre-commit.com/) and run `pre-commit install` at the
  root of this repository.

# Design Philosophy

- Zero Dependencies: We shouldn't depend on anything other than the `go`
  language and standard library.
  - An exception: If we add support for a database in the future rather than
    flat files, we may want to add a driver for it rather than rolling our own,
    but we'll get there when we get there.
  - Committing development scripts that require external tools like `make` is
    acceptable, but these should always be optional.
- Tracability: Make understanding _what happened_ and _why it happened_ as easy
  as possible.
- Resumability: We're going to have lots of things that break for seemingly
  random reasons. We need to be able to pick up where we left off.
