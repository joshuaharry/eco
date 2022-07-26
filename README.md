# eco

## Installation
Run:

```sh
npm install
sh ./build/build.sh
sudo npm install -g .
```

That will place the `eco` CLI onto your `$PATH` for future work.

## Usage
Usage: eco [-h | --help]
           [-n | --no-cleanup]
           [-s | --stratgegy <path>]
           [-d | --log-dir <path>]
           [-f | --file-list <path>]
	   <path> ...

eco - A tool for understanding your software's ecosystem.

Think of eco as an interpreter; you can provide it instructions for
how to fetch some code from the internet and take actions on it, and
it will run those instructions for you in such a way as to make
searching and understanding the results more straightforward. These
instructions are called strategies and are currently configured via
JSON files; you can place them into ~/.eco for your convenience.

If you want to write your own strategies, the types of the JSON files
are specified in `src/language.ts`; they are validated at runtime
using `ajv`.

## Examples

```
eco -s strategies/scotty.json -f js-packages
```

```
eco -n -s strategies/scotty.json -f js-packages
```

```
eco -n -s strategies/scotty.json abs
```

The check in `$HOME/.eco/JavaScript` and `$HOME/.eco/sandbox` for
logfiles and sources.


## DefinitelyTyped

The file `lists/dt-all` contains the list of all the DefinitelyTyped
packages. The utility `split.sh` splits it so that `eco` can be used
to process batches of DefinitelyTyped packages instead of processing
the whole repository as a whole. Example:

```
eco -n -s strategies/scotty.json -f lists/dt-all.1000 -d DT-ALL.1000
```

To detect unsupported features:

```
grep -rl unsupportedCT ~/.eco/sandbox | grep -v contract-base.js
```

To inspect unsupported features:

```
emacs ~/.eco/sandbox/copy/{index.js,index.d.ts}
```
