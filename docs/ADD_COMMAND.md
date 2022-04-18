# Adding Commands
If you want to add a new top level command:
- Create a new file in `cmd/eco` with the name of your command (e.g., `find.go`)
- Use `args.MakeParser` to generate a parser and `AddOption` to add the flags
you need.
- Create a new function whose name starts with `Handle` that uses the parsed arguments
to achieve the desired effect (e.g., `HandleFind`).

From here, you can rely on copy-pasting similar code that already exists:
- Append a new `AddCommand` to the `Root` struct in that file.
- Edit the `CommandMap` to include the handler function you just implemented.
