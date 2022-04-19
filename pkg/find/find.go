package find

import (
	"fmt"
	"os"
)

// A Request provides the information required to find a library on the
// internet and download it.
type Request struct {
	// ID represents the name of the library.
	ID string
	// Language describes the ecosystem in which the library sits.
	Language string
}

// Respond handles a Find request by searching for libraries on the internet
// and emitting proper failures as necessary.
func Respond(req *Request) (string, error) {
	return "Write me!", nil
}

// Execute handles a Find request by invoking respond, printing the information
// it finds to the console, and exiting. It is intended to be used via the CLI
// as opposed to within a strategy.
func Execute(req *Request) {
	res, err := Respond(req)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
	fmt.Println(res)
}
