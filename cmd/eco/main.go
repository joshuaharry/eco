package main

import (
	"eco/pkg/args"
	"fmt"
)

const (
	VERSION = "0.0.0"
)

var Cli *args.ArgumentParser = args.MakeParser("eco", "A tool for understanding your software's ecosystem.").AddOption(args.Option{
	Aliases:     []string{"-h", "--help"},
	Description: "Show this help message and exit.",
}).AddOption(args.Option{
	Aliases:     []string{"-v", "--version"},
	Description: "Print the version number and exit.",
})

func main() {
	fmt.Println(Cli.Help())
}
