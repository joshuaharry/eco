package args

import (
	"strings"
	"testing"
)

func TestOptionCreation(t *testing.T) {
	x := MakeParser("check", "This is a test")
	desc := "This is a test."
	oldOpt := Option{
		Description: desc,
		Arguments:   []string{"test"},
		Aliases:     []string{"-t", "--test"},
	}
	x.AddOption(oldOpt)
	opt := x.GetOption("-t")
	if opt.Description != desc {
		t.Error("Expected getting option to return the correct value")
	}
}

func TestOptionChaining(t *testing.T) {
	x := MakeParser("check", "This is a test")
	x.AddOption(Option{
		Description: "config",
		Aliases:     []string{"-c", "--config"},
	}).AddOption(Option{
		Description: "test",
		Aliases:     []string{"-t", "--test"},
	})
	if x.GetOption("-c").Description != "config" {
		t.Error("Expected to get config")
	}
	if x.GetOption("-t").Description != "test" {
		t.Error("Expected to get test")
	}
}

func TestNoOption(t *testing.T) {
	x := MakeParser("check", "This is a test")
	opt := x.GetOption("-c")
	if opt != nil {
		t.Error("Expected nil opt")
	}
}

func TestArgumentCreation(t *testing.T) {
	x := MakeParser("eco", "This is a test")
	y := MakeParser("test", "This is another test.")
	x.AddCommand(y)
	cmd := x.GetCommand("test")
	if cmd != y {
		t.Error("Expected to get the commmand we just added")
	}
}

func TestNoArgument(t *testing.T) {
	x := MakeParser("eco", "This is a test")
	cmd := x.GetCommand("test")
	if cmd != nil {
		t.Error("Expected nil command")
	}
}

func TestParentCreation(t *testing.T) {
	x := MakeParser("eco", "This is a test")
	y := MakeParser("test", "This is another test.")
	x.AddCommand(y)
	cmd := x.GetCommand("test")
	parent := cmd.Parents[0]
	if parent != "eco" {
		t.Errorf("Expected parent to be eco, got %s\n", parent)
	}
}

func TestNestedParents(t *testing.T) {
	eco := MakeParser("eco", "Root of the tree.")
	check := MakeParser("check", "Next command.")
	test := MakeParser("test", "This is what this subcommand is supposed to do.")
	eco.AddCommand(check)
	check.AddCommand(test)
	help := test.Help()
	if !strings.Contains(help, "eco check test") {
		t.Errorf("Expected\n%s\n\nto contain eco check test", help)
	}
}

func TestAddingMultipleCommands(t *testing.T) {
	eco := MakeParser("eco", "Root of the tree.")
	check := MakeParser("check", "Next command.")
	test := MakeParser("test", "Another command.")
	eco.AddCommand(check).AddCommand(test)
	if eco.GetCommand("check") != check {
		t.Error("Expected to get check.")
	}
	if eco.GetCommand("test") != test {
		t.Error("Expected to get test.")
	}
}

func TestHelpCommand(t *testing.T) {
	helpAliases := []string{"-h", "--help"}
	coolArgs := []string{"path"}
	coolAliases := []string{"-c", "--config"}
	alsoCoolArgs := []string{"path", "test"}
	alsoCoolAliases := []string{"-l", "--logic"}
	eco := "eco"
	desc := "A tool for understanding your software's ecosystem."
	help := "Show this help message and exit."
	cool := "Do something really cool."
	alsoCool := "Do something else cool."
	findName := "find"
	findDesc := "Find a library."
	runName := "run"
	runDesc := "Run a command."
	parser := MakeParser(eco, desc)
	search := append(helpAliases, coolArgs...)
	search = append(search, coolAliases...)
	search = append(search, alsoCoolArgs...)
	search = append(search, alsoCoolAliases...)
	search = append(search, eco, desc, help, cool, alsoCool, findName, findDesc, runName, runDesc)
	parser.AddOption(Option{
		Description: help,
		Aliases:     helpAliases,
	}).AddOption(Option{
		Description: cool,
		Arguments:   coolArgs,
		Aliases:     coolAliases,
	}).AddOption(Option{
		Description: alsoCool,
		Arguments:   alsoCoolArgs,
		Aliases:     alsoCoolAliases,
	})
	find := MakeParser(findName, findDesc)
	run := MakeParser(runName, runDesc)
	parser.AddCommand(find).AddCommand(run)
	helpStr := parser.Help()
	for _, el := range search {
		if !strings.Contains(helpStr, el) {
			t.Errorf("Expected %s\n\n to contain %s", helpStr, el)
		}
	}
}

func TestValuesBeforeParsing(t *testing.T) {
	eco := MakeParser("eco", "A command.").AddOption(Option{
		Description: "Decide whether or not to use colors.",
		Aliases:     []string{"-c", "--color"},
		Arguments:   []string{"on"},
	})
	colors := eco.GetOption("-c")
	if colors.Seen {
		t.Error("Expected colors not to be seen")
	}
}

func TestSimpleParsing(t *testing.T) {
	eco := MakeParser("eco", "A command.").AddOption(Option{
		Description: "Decide whether or not to use colors.",
		Aliases:     []string{"-c", "--color"},
		Arguments:   []string{"on"},
	})
	err := eco.Parse([]string{"eco", "-c", "off"})
	if err != nil {
		t.Error(err)
	}
	color := eco.GetOption("-c")
	if !color.Seen {
		t.Error("Expected color to be seen")
	}
	if color.Value[0] != "off" {
		t.Error("Expected value to be off")
	}
}

func TestOutOfBounds(t *testing.T) {
	eco := MakeParser("eco", "A command.").AddOption(Option{
		Description: "Decide whether or not to use colors.",
		Aliases:     []string{"-c", "--config"},
		Arguments:   []string{"path", "extra", "check"},
	})
	err := eco.Parse([]string{"eco", "-c"})
	msg := err.Error()
	if msg != "option -c needs 3 arguments, got 0" {
		t.Errorf("Bad error message: %s\n", msg)
	}
}

func TestOutOfBoundsMoreComplex(t *testing.T) {
	eco := MakeParser("eco", "A command.").AddOption(Option{
		Description: "Decide whether or not to use colors.",
		Aliases:     []string{"-c", "--config"},
		Arguments:   []string{"path", "extra", "check", "thirty", "two"},
	})
	err := eco.Parse([]string{"eco", "-c", "a", "b"})
	msg := err.Error()
	if msg != "option -c needs 5 arguments, got 2" {
		t.Errorf("Bad error message: %s\n", msg)
	}
}

func TestLongParsing(t *testing.T) {
	eco := MakeParser("eco", "A command.").AddOption(Option{
		Description: "Decide whether or not to use colors.",
		Aliases:     []string{"-c", "--color"},
		Arguments:   []string{"on"},
	})
	eco.Parse([]string{"eco", "--color", "hello"})
	color := eco.GetOption("-c")
	if !color.Seen {
		t.Error("Expected color to be seen")
	}
	if color.Value[0] != "hello" {
		t.Error("Expected value to be hello")
	}
}

// func TestEqualsParsing(t *testing.T) {
// 	eco := MakeParser("eco", "A command.").AddOption(Option{
// 		Description: "Decide whether or not to use colors.",
// 		Aliases:     []string{"-c", "--color"},
// 		Arguments:   []string{"on"},
// 	})
// 	eco.Parse([]string{"eco", "-c=off"})
// 	color := eco.GetOption("-c")
// 	if !color.Seen {
// 		t.Error("Expected color to be seen")
// 	}
// 	if color.Value[0] != "off" {
// 		t.Error("Expected value to be off")
// 	}
// }
