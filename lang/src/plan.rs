use serde::{Deserialize, Serialize};
use std::vec::Vec;
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct CheckOutput {
    pub argument: String,
    pub includes: String,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Dependency {
    pub program: String,
    pub check_output: Option<CheckOutput>,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Config {
    pub name: String,
    pub author: String,
    pub license: String,
    pub timeout: f64,
    pub dependencies: Dependencies,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Dependencies {
    required: Vec<Dependency>,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[serde(tag = "uses")]
#[ts(export)]
pub enum Step {
    Run {
        name: String,
        run: String,
        timeout: Option<f64>,
    },
    Find {
        name: String,
        ecosystem: String,
        timeout: Option<f64>,
    },
}

// TODO: Consider transforming these from vectors into more sophisticated trees?
#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Action {
    pub steps: Vec<Step>,
    pub cleanup: Vec<Step>,
}

#[derive(Serialize, Deserialize, Debug, TS)]
#[ts(export)]
pub struct Strategy {
    pub config: Config,
    pub action: Action,
}

#[derive(Debug)]
pub struct Plan {
    // A list of packages to analyze.
    pub packages: Vec<String>,
    // Instructions of a strategy to execute.
    pub strategy: Strategy,
}

/// Execute the contents of a plan in parallel.
pub fn execute_plan(_plan: Plan) {

}
