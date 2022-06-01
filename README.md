# eco

## Installation
Run:

```sh
npm install
sh ./build/build.sh
npm install -g .
```

That will place the `eco` CLI onto your `$PATH` for future work.

## Usage
Usage: eco [-h][--help][-s | --stratgegy <path>]
                       [-f | --file-list <path>]

eco - A tool for understanding your software's ecosystem.

Think of eco as an interpreter; you can provide it instructions for how to
fetch some code from the internet and take actions on it, and it will run those
instructions for you in such a way as to to make searching and understanding the
results more straightforward. These instructions are called strategies and are
currently configured via JSON files; you can place them into ~/.eco for your
convenience.
