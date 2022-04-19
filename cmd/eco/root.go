package main

import (
	"eco/pkg/args"
)

var Find *args.ArgumentParser = args.MakeParser("find", "Find the source code of a library on the internet.").AddOption(args.Option{
	Aliases:     []string{"-h", "--help"},
	Description: "Show this help message and exit.",
}).AddOption(args.Option{
	Aliases:     []string{"-n", "--name"},
	Arguments:   []string{"id"},
	Description: "The name of the library you would like to find.",
}).AddOption(args.Option{
	Aliases:     []string{"-l", "--language"},
	Arguments:   []string{"name"},
	Description: "The language in which to search for the library.",
})

func HandleFind(gateway *Gateway) {
	gateway.Info(Find.Help())
}

// Root is the command which hosts all of our other subcommands.
var Root *args.ArgumentParser = args.MakeParser("eco", "A tool for understanding your software's ecosystem.").AddOption(args.Option{
	Aliases:     []string{"-h", "--help"},
	Description: "Show this help message and exit.",
}).AddOption(args.Option{
	Aliases:     []string{"-v", "--version"},
	Description: "Print the version number and exit.",
}).AddCommand(Find)

func HandleRoot(gateway *Gateway) {
	version := Root.Option("-v")
	help := Root.Option("-h")
	if version.Seen && !help.Seen {
		gateway.Info(VERSION)
		gateway.Exit(0)
		return
	}
	gateway.Info(Root.Help())
	gateway.Exit(0)
}

var Executors CommandMap = map[*args.ArgumentParser]GatewayHandler{
	Root: HandleRoot,
	Find: HandleFind,
}
