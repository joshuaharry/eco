package main

import (
	"eco/pkg/args"
	"eco/pkg/find"
)

// Find handles the "find" subcommand in our CLI.
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

// InvokeFindHandler tries to marshal the options provided via the CLI into a
// find.Request that it passes to the handle for further processing. When it
// fails to do so, it quits the program with informative error messages.
func InvokeFindHandler(gateway *Gateway, handle func(*find.Request)) {
	help := Find.Option("-h")
	if help.Seen {
		gateway.Info(Find.Help())
		gateway.Exit(0)
		return
	}
	name := Find.Option("-n")
	if !name.Seen {
		gateway.Error("Error: To find a library, you must specify its name." + "\n\n" + Find.Help())
		gateway.Exit(1)
		return
	}
	lang := Find.Option("-l")
	if !lang.Seen {
		gateway.Error("Error: To find a library, you must specify the language ecosystem to which it belongs." + "\n\n" + Find.Help())
		gateway.Exit(1)
		return
	}
	req := find.Request{
		ID:       name.Values[0],
		Language: lang.Values[0],
	}
	handle(&req)
}

func HandleFind(gateway *Gateway) {
	InvokeFindHandler(gateway, find.Execute)
}

// Root is the command which hosts all of our other subcommands.
var Root *args.ArgumentParser = args.MakeParser("eco", "A tool for understanding your software's ecosystem.").AddOption(args.Option{
	Aliases:     []string{"-h", "--help"},
	Description: "Show this help message and exit.",
}).AddOption(args.Option{
	Aliases:     []string{"-v", "--version"},
	Description: "Print the version number and exit.",
}).AddCommand(Find)

// HandleRoot handles logging version and help information when requested.
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

// Executors provides a map between the different parsers and their handlers.
// It is intended to be modified as more commands are added to the CLI.
var Executors CommandMap = map[*args.ArgumentParser]GatewayHandler{
	Root: HandleRoot,
	Find: HandleFind,
}
