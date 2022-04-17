package args

import (
	"fmt"
	"strings"
)

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
	// Values represents the values associated with this option.
	Values []string
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

// OptionNamed retrieves an Option from an argument parser by the name of its
// alias.
func (arg *ArgumentParser) OptionNamed(alias string) *Option {
	el, ok := arg.aliasMap[alias]
	if !ok {
		return nil
	}
	return arg.Options[el]
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

// CommandNamed retrieves a command from the argument parser by its name.
func (arg *ArgumentParser) CommandNamed(name string) *ArgumentParser {
	el, ok := arg.commandMap[name]
	if !ok {
		return nil
	}
	return arg.Commands[el]
}

// Parse recursively updates the Parser with information passed from a slice of
// strings; the slice will be os.Args in most cases, but we give the choice to the
// caller to facilitate simpler testing.
func (parser *ArgumentParser) Parse(args []string) (*ArgumentParser, error) {
	argLen := len(args)
	// os.Args *starts* with the name of the command, so skip the first element.
	for i := 1; i < argLen; {
		arg := args[i]

		// The simplest case: We've got a new subcommand. Hooray! Recurse.
		cmd := parser.CommandNamed(arg)
		if cmd != nil {
			return cmd.Parse(args[i:])
		}

		// Now we have to handle options, which gets tricky because of = parsing.
		opt := parser.OptionNamed(arg)

		// Try to extract the name and arguments out of an option with an '='
		// sign inside of it.
		var name string
		var equalsArgs []string
		if opt == nil && arg[0] == '-' && strings.Contains(arg, "=") {
			res := strings.Split(arg, "=")
			name = res[0]
			opt = parser.OptionNamed(name)
			// Only create the extra slice when we have successfully found an '='
			// option.
			if opt != nil {
				equalsArgs = strings.Split(res[1], ",")
			}
		}

		// We've tried to get a command, and we've tried every possible way to get
		// an option. Neither worked. Uh-oh: Our parser can't handle this element!
		// Bail out early.
		if opt == nil {
			return nil, fmt.Errorf("unexpected %s", arg)
		}

		opt.Seen = true
		optArgLen := len(opt.Arguments)
		equalsArgsLen := len(equalsArgs)

		// At this point, there are but four possiblities:
		// 1. We used an '=' option, but there are too many/too few arguments.
		// 2. We used a space option, but there aren't enough arguments.
		// 3. We used an '=' option and everything is great.
		// 4. We used a space option and everything is great.

		if equalsArgsLen == 0 {
			// Parse options of the form -[alias] <arg1> <arg2> <arg3> ... <argn>
			// All extra options get treated as arguments to this option.
			if i+optArgLen > argLen {
				return nil, fmt.Errorf("option %s needs %d arguments, got %d", arg, optArgLen, argLen-i-1)
			}
			for j := 0; j < len(opt.Arguments); j++ {
				// Careful trickery with i++ - we need to *mutate our
				// position in the loop* while adding all the options.
				i++
				opt.Values = append(opt.Values, args[i])
			}
		} else {
			// Parse options of the form -[alias]=<arg1>,<arg2>,<arg3>...<argn>
			// Now it is possible to have too many options.
			optArgLen := len(opt.Arguments)
			if optArgLen != equalsArgsLen {
				return nil, fmt.Errorf("option %s needs %d arguments, got %d", name, optArgLen, equalsArgsLen)
			}
			opt.Values = append(opt.Values, equalsArgs...)
		}
		i++
	}
	return parser, nil
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
