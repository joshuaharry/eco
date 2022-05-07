use serde::{Deserialize, Serialize};
use std::vec::Vec;

#[derive(Serialize, Deserialize, Debug)]
pub struct CheckOutput<'a> {
    pub argument: &'a str,
    pub includes: &'a str,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Dependency<'a> {
    pub program: &'a str,
    #[serde(borrow, rename = "checkOutput")]
    pub check_output: Option<CheckOutput<'a>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config<'a> {
    pub name: &'a str,
    pub author: &'a str,
    pub license: &'a str,
    pub timeout: i64,
    pub dependencies: Dependencies<'a>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Dependencies<'a> {
    #[serde(borrow)]
    required: Vec<Dependency<'a>>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "uses")]
pub enum Step<'a> {
    Run { name: &'a str, run: &'a str },
    Find { name: &'a str, ecosystem: &'a str },
}

// TODO: Consider transforming these from vectors into more sophisticated trees?
#[derive(Serialize, Deserialize, Debug)]
pub struct Action<'a> {
    #[serde(borrow)]
    pub steps: Vec<Step<'a>>,
    #[serde(borrow)]
    pub cleanup: Vec<Step<'a>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Strategy<'a> {
    #[serde(borrow)]
    pub config: Config<'a>,
    #[serde(borrow)]
    pub action: Action<'a>,
}

#[derive(Debug)]
pub struct Plan<'a> {
    // A list of packages to analyze.
    pub packages: Vec<&'a str>,
    // Instructions of a strategy to execute.
    pub strategy: Strategy<'a>,
}
