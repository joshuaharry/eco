package main

import (
	"eco/pkg/args"
	"fmt"
	"os"
)

const (
	VERSION = "0.0.0"
)

// Gateway is a struct of functions pointers meant for printing information to
// the screen and exiting the process. These actions are inherintly difficult
// to test, so we abstract them into this type such that the test suite can
// swap out a functional implementation.
type Gateway struct {
	Exit  func(int)
	Error func(string)
	Info  func(string)
}

type GatewayHandler = func(gateway *Gateway)

type CommandMap = map[*args.ArgumentParser]GatewayHandler

// Run manages processing the command line arguments into the data various
// chunks of code other portions of the application need to run successfully.
func Run(argv []string, gateway *Gateway, commandMap CommandMap) {
	cmd, err := Root.Parse(argv)
	if err != nil {
		gateway.Error("Error: " + err.Error() + "\n\n" + cmd.Help())
		gateway.Exit(1)
		return
	}
	commandMap[cmd](gateway)
}

// TopLevel provides a side-effectful handlers that do things like printing to
// standard out and quitting the currently running process. Fortunately, these
// are simple enough to verify by inspection.
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
