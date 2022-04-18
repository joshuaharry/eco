package main

import (
	"eco/pkg/args"
)

// Root is the command which hosts all of our other subcommands.
var Root *args.ArgumentParser = args.MakeParser("eco", "A tool for understanding your software's ecosystem.").AddOption(args.Option{
	Aliases:     []string{"-h", "--help"},
	Description: "Show this help message and exit.",
}).AddOption(args.Option{
	Aliases:     []string{"-v", "--version"},
	Description: "Print the version number and exit.",
})

func HandleRoot(gateway Gateway) {

}
