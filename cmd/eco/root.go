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
}
