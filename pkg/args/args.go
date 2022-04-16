package args

import (
	"strings"
)

// An ArgError represents a parsing error.
type ArgError struct {
}

// Error returns a string describing what went wrong with the argument parsing.
func (err ArgError) Error() string {
	return ""
}

// An Option represents a CLI option.
type Option struct {
	// Description explains the purpose of this option.
	Description string
	// Arguments is a list of strings naming the arguments this option has.
	Arguments []string
	// Aliases describes the things a user can type to access this option
	// (e.g., '-c' or '--c')
	Aliases []string
	// Seen represents whether we have have seen this option in the CLI
	// or not.
	Seen bool
	// Value represents the default value (or values) of this option.
	Value []string
}

// An ArgumentParser handles parsing a slice of strings into CLI options.
type ArgumentParser struct {
	// Name describes the name of the current parser.
	Name string
	// Description explains the purpose of this particular argument.
	Description string
	// Parents describe the subcommands that came before the current one.
	// These strings are mostly used for help messages.
	Parents []string
	// Options describes the list of options which correspond to this argument
	// parser.
	Options []*Option
	// Commands is a list of other ArgumentParser structs that correspond to
	// subcommands a user could take.
	Commands []*ArgumentParser
	// aliasMap connects CLI aliases to the position of various options.
	aliasMap map[string]int
	// commandMap connects subcommands to the position of various arguments.
	commandMap map[string]int
}

// MakeParser constructs an ArgumentParser with reasonable initialized defaults.
func MakeParser(name string, description string) *ArgumentParser {
	return &ArgumentParser{
		Name:        name,
		Description: description,
		Parents:     []string{},
		Options:     []*Option{},
		Commands:    []*ArgumentParser{},
		aliasMap:    map[string]int{},
		commandMap:  map[string]int{},
	}
}

// AddOption adds an Option to an argument parser.
func (arg *ArgumentParser) AddOption(opt Option) *ArgumentParser {
	idx := len(arg.Options)
	for _, alias := range opt.Aliases {
		arg.aliasMap[alias] = idx
	}
	arg.Options = append(arg.Options, &opt)
	return arg
}

// GetOption retrieves an Option from an argument parser.
func (arg *ArgumentParser) GetOption(alias string) *Option {
	return arg.Options[arg.aliasMap[alias]]
}

// AddCommand adds a subcommand to the argument parser.
func (arg *ArgumentParser) AddCommand(cmd *ArgumentParser) *ArgumentParser {
	idx := len(arg.Commands)
	toPrepend := append(arg.Parents, arg.Name)
	cmd.Parents = append(toPrepend, cmd.Parents...)
	for _, subcmd := range cmd.Commands {
		subcmd.Parents = append(cmd.Parents, subcmd.Parents...)
	}
	arg.commandMap[cmd.Name] = idx
	arg.Commands = append(arg.Commands, cmd)
	return arg
}

// GetCommand retrieves a command from the argument parser.
func (arg *ArgumentParser) GetCommand(name string) *ArgumentParser {
	return arg.Commands[arg.commandMap[name]]
}

const (
	// Arbitrary padding between options and their outputs.
	PRINT_PADDING = 4
)

// Help returns a help message associated with the current ArgumentParser.
func (arg *ArgumentParser) Help() string {

	// Build strings showing the aliases and arguments of every option.
	// In order to line up the strings nicely, we need to know the length
	// of the longest one, so we compute that while collecting our final
	// output.
	maxLenOpts := 0
	hasCommands := len(arg.Commands) > 0
	hasOptions := len(arg.Options) > 0

	optHelp := []string{}
	if hasOptions {
		for _, opt := range arg.Options {
			helpStr := strings.Join(opt.Aliases, ", ")
			argLen := len(opt.Arguments)
			if argLen > 0 {
				helpStr += " "
				for i, arg := range opt.Arguments {
					helpStr += "<" + arg + ">"
					if i != argLen-1 {
						helpStr += " "
					}
				}
			}
			optHelp = append(optHelp, helpStr)
			helpStrLen := len(helpStr)
			if helpStrLen > maxLenOpts {
				maxLenOpts = helpStrLen
			}
		}
	}

	// Scan through the options to determine the longest command; yet again,
	// we need this information for padding.
	maxLenCmds := 0
	if hasCommands {
		for _, cmd := range arg.Commands {
			cmdNameLen := len(cmd.Name)
			if cmdNameLen > maxLenCmds {
				maxLenCmds = cmdNameLen
			}
		}
	}

	out := ``

	out += "Usage: " + strings.Join(arg.Parents, " ") + " " + arg.Name
	if hasOptions {
		out += " [OPTIONS]"
	}
	if hasCommands {
		out += " COMMAND"
	}
	out += "\n\n" + arg.Description
	if hasOptions {
		out += "\n\nOptions:\n"
		for i, opt := range arg.Options {
			out += "  " + optHelp[i] + strings.Repeat(" ", maxLenOpts+PRINT_PADDING-len(optHelp[i])) + opt.Description + "\n"
		}
	}
	if hasCommands {
		out += "\nCommands:\n"
		for _, cmd := range arg.Commands {
			out += "  " + cmd.Name + strings.Repeat(" ", maxLenCmds+PRINT_PADDING-len(cmd.Name)) + cmd.Description + "\n"
		}
	}

	return out
}
