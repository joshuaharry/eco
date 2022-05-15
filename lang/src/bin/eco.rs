use clap::Parser;
use eco::cli;
use std::process;

fn main() {
    let opts = cli::Options::parse();
    match opts.to_plan() {
        Ok(_) => (),
        Err(err) => {
            let msg = cli::error_message(err);
            println!("{}", msg);
            process::exit(1);
        }
    }
    process::exit(0)
}
