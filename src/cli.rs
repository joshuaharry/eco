use crate::plan::{Plan, Strategy};
use clap::Parser;
use serde_json;
use std::fs::read_to_string;

#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
pub struct Options {
    // Path to the strategy to use
    #[clap(short, long)]
    strategy: String,
    // Path to the packages file to use
    #[clap(short, long)]
    packages: String,
}

pub enum CliError {
    MissingPackageList,
    MissingStrategy,
    InvalidStrategy,
}

pub fn error_message(err: CliError) -> String {
    match err {
        CliError::InvalidStrategy => {
            format!("Could not parse JSON into a valid strategy")
        }
        CliError::MissingStrategy => format!("Could not open strategy file"),
        CliError::MissingPackageList => {
            format!("Could not open package list")
        }
    }
}

fn interpret_plan(plan: Plan) -> Result<(), CliError> {
    println!("{:#?}", plan);
    println!("Write an interpreter!");
    Ok(())
}

impl<'a> Options {
    pub fn execute(self) -> Result<(), CliError> {
        let package_string =
            read_to_string(self.packages).map_err(|_| CliError::MissingPackageList)?;
        let split = package_string.split("\n");
        let packages: Vec<&str> = split.collect();
        let strategy_string =
            read_to_string(self.strategy).map_err(|_| CliError::MissingStrategy)?;
        let strategy: Strategy =
            serde_json::from_str(&strategy_string).map_err(|_| CliError::InvalidStrategy)?;
        let plan = Plan { packages, strategy };
        interpret_plan(plan)?;
        Ok(())
    }
}
