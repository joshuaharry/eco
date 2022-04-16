package main

import (
	"eco/pkg/args"
	"fmt"
)

func main() {
	parser := args.MakeParser("eco", "A tool for understanding your software's ecosystem.")
	parser.AddOption(args.Option{
		Description: "Show this help message and exit.",
		Aliases:     []string{"-h", "--help"},
	}).AddOption(args.Option{
		Description: "Do something really cool.",
		Arguments:   []string{"path"},
		Aliases:     []string{"-c", "--config"},
	}).AddOption(args.Option{
		Description: "Do something else cool.",
		Arguments:   []string{"path", "test"},
		Aliases:     []string{"-l", "--logic"},
	})
	find := args.MakeParser("find", "Find a library.")
	run := args.MakeParser("run", "Run a command.")
	parser.AddCommand(find).AddCommand(run)
	fmt.Println(parser.Help())
}
