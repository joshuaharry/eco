package main

import (
	"eco/pkg/args"
	"fmt"
	"os"
)

const (
	VERSION = "0.0.0"
)

// Gateway is a struct of functions meant for printing information to the
// screen and exiting the process.
type Gateway struct {
	Exit  func(int)
	Error func(string)
	Info  func(string)
}

type GatewayHandler = func(gateway *Gateway)

type CommandMap = map[*args.ArgumentParser]GatewayHandler

func Run(argv []string, gateway *Gateway, commandMap CommandMap) {
	cmd, err := Root.Parse(argv)
	if err != nil {
		gateway.Error("Error: " + err.Error() + "\n")
		gateway.Error(cmd.Help())
		gateway.Exit(1)
		return
	}
	commandMap[cmd](gateway)
}

// Our main Gateway implementation that we use for the app.
var TopLevel Gateway = Gateway{
	Exit: os.Exit,
	Error: func(msg string) {
		fmt.Fprintln(os.Stderr, msg)
	},
	Info: func(msg string) {
		fmt.Fprintln(os.Stdout, msg)
	},
}

func main() {
	Run(os.Args, &TopLevel, Executors)
}
