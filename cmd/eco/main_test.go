package main

import (
	"eco/pkg/args"
	"strings"
	"testing"
)

// A ParseResult holds the information passed to a Gateway struct at the
// top level.
type ParseResult struct {
	Exit  int
	Error string
	Info  string
}

// ParseAnd takes a list of arguments to parse and a CommandMap; it then
// passes the result of parsing to fn before resetting the Root parser.
func ParseAnd(argv []string, cmds CommandMap, fn func(res *ParseResult)) {
	defer Root.Reset()
	res := ParseResult{
		Exit:  -1,
		Error: "",
		Info:  "",
	}
	gateway := Gateway{
		Exit: func(code int) {
			res.Exit = code
		},
		Error: func(err string) {
			res.Error = err
		},
		Info: func(inf string) {
			res.Info = inf
		},
	}
	Run(argv, &gateway, cmds)
	fn(&res)
}

func emptyHandlers() CommandMap {
	return map[*args.ArgumentParser]GatewayHandler{}
}

func TestRunNotEco(t *testing.T) {
	ParseAnd([]string{"not", "real", "command"}, Executors, func(res *ParseResult) {
		if res.Exit != 1 {
			t.Error("Expected to quit with exit 1")
		}
	})
}

func TestEcoHelp(t *testing.T) {
	ParseAnd([]string{"eco"}, Executors, func(res *ParseResult) {
		if res.Exit != 0 {
			t.Error("Expected to quit with exit 0")
		}
		if !strings.Contains(res.Info, Root.Help()) {
			t.Error("Expected root to include help.")
		}
	})
}

func TestEcoVersion(t *testing.T) {
	ParseAnd([]string{"eco", "-v"}, Executors, func(res *ParseResult) {
		if res.Exit != 0 {
			t.Error("Expected to quit with exit 0")
		}
		if !strings.Contains(res.Info, VERSION) {
			t.Errorf("Expected root to include version, got %s\n", res.Info)
		}
	})
}

func TestInvalidCommand(t *testing.T) {
	ParseAnd([]string{"eco", "-h="}, Executors, func(res *ParseResult) {
		if res.Exit != 1 {
			t.Error("Expected to quit with exit 1")
		}
	})
}

func TestEcoVersionAndHelp(t *testing.T) {
	ParseAnd([]string{"eco", "-v", "-h"}, Executors, func(res *ParseResult) {
		if res.Exit != 0 {
			t.Error("Expected to quit with exit 0")
		}
		if !strings.Contains(res.Info, Root.Help()) {
			t.Errorf("Expected root to include help, got %s\n", res.Info)
		}
	})
}
