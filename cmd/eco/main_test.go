package main

import (
	"eco/pkg/args"
	"strings"
	"testing"
)

func TestRunNotEco(t *testing.T) {
	var exit int
	gateway := Gateway{
		Exit: func(code int) {
			exit = code
		},
		Error: func(_ string) {},
		Info:  func(_ string) {},
	}
	commandMap := map[*args.ArgumentParser]GatewayHandler{}
	Run([]string{"not", "a", "real", "command"}, gateway, commandMap)
	if exit != 1 {
		t.Error("Expected to quit with exit 1")
	}
}

func TestEcoHelp(t *testing.T) {
	exit := 5
	info := ""
	gateway := Gateway{
		Exit: func(code int) {
			exit = code
		},
		Error: func(_ string) {},
		Info: func(inf string) {
			info = inf
		},
	}
	Run([]string{"eco"}, gateway, Executors)
	if exit != 0 {
		t.Error("Expected to quit with exit 0")
	}
	if !strings.Contains(info, Root.Help()) {
		t.Error("Expected root to include help.")
	}
}

func TestEcoVersion(t *testing.T) {
	exit := 5
	info := ""
	gateway := Gateway{
		Exit: func(code int) {
			exit = code
		},
		Error: func(_ string) {},
		Info: func(inf string) {
			info = inf
		},
	}
	Run([]string{"eco", "-v"}, gateway, Executors)
	if exit != 0 {
		t.Error("Expected to quit with exit 0")
	}
	if !strings.Contains(info, VERSION) {
		t.Errorf("Expected root to include version, got %s\n", info)
	}
}
