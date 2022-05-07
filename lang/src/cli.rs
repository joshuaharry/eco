use crate::plan::{Plan, Strategy};
use clap::Parser;
use serde_json;
use std::fs::read_to_string;
use std::path::PathBuf;

#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
pub struct Options {
    // Path to the strategy to use
    #[clap(short, long)]
    strategy: PathBuf,
    // Path to the packages file to use
    #[clap(short, long)]
    packages: PathBuf,
}

pub enum CliError {
    MissingPackageList(String),
    MissingStrategy(String),
    InvalidStrategy(String),
}

pub fn error_message(err: CliError) -> String {
    match err {
        CliError::InvalidStrategy(msg) => {
            format!("Could not parse JSON into a valid strategy\n{}", msg)
        }
        CliError::MissingStrategy(msg) => format!("Could not open strategy file\n{}", msg),
        CliError::MissingPackageList(msg) => {
            format!("Could not open package list\n{}", msg)
        }
    }
}

fn execute_plan(plan: Plan) -> Result<(), CliError> {
    println!("{:#?}", plan);
    println!("Write an interpreter!");
    Ok(())
}

impl<'a> Options {
    pub fn execute(self) -> Result<(), CliError> {
        let package_string = read_to_string(self.packages)
            .map_err(|err| CliError::MissingPackageList(err.to_string()))?;
        let split = package_string.split("\n");
        let packages: Vec<&str> = split.collect();
        let strategy_string = read_to_string(self.strategy)
            .map_err(|err| CliError::MissingStrategy(err.to_string()))?;
        let strategy: Strategy = serde_json::from_str(&strategy_string)
            .map_err(|err| CliError::InvalidStrategy(err.to_string()))?;
        let plan = Plan { packages, strategy };
        execute_plan(plan)?;
        Ok(())
    }
}
