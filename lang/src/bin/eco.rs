use eco::cli;
use clap::Parser;
use std::process;

fn main() {
    let opts = cli::Options::parse();
    match opts.execute() {
        Ok(()) => (),
        Err(err) => {
            let msg = cli::error_message(err);
            println!("{}", msg);
            process::exit(1);
        }
    }
    process::exit(0)
}
