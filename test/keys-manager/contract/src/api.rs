use casper_contract::{contract_api::runtime};
use casper_types::{
    account::{AccountHash, Weight},
};

use crate::errors::Error;

pub const ARG_ACTION: &str = "action";
pub const ARG_ACCOUNT: &str = "account";
pub const ARG_WEIGHT: &str = "weight";
pub const ARG_DEPLOYMENT_THRESHOLD: &str = "deployment_threshold";
pub const ARG_KEY_MANAGEMENT_THRESHOLD: &str = "key_management_threshold";
pub const ARG_ACCOUNTS: &str = "accounts";
pub const ARG_WEIGHTS: &str = "weights";

pub const SET_KEY_WEIGHT: &str = "set_key_weight";
pub const SET_DEPLOYMENT_THRESHOLD: &str = "set_deployment_threshold";
pub const SET_KEY_MANAGEMENT_THRESHOLD: &str = "set_key_management_threshold";
pub const SET_ALL: &str = "set_all";

pub enum Api {
    SetKeyWeight(AccountHash, Weight),
    SetDeploymentThreshold(Weight),
    SetKeyManagementThreshold(Weight),
    SetAll(Weight, Weight, Vec<AccountHash>, Vec<Weight>)
}

fn get_action_arg() -> String {
    runtime::get_named_arg(ARG_ACTION)
}

fn get_account_arg() -> AccountHash {
    runtime::get_named_arg(ARG_ACCOUNT)
}

fn get_weight_arg() -> u8 {
    runtime::get_named_arg(ARG_WEIGHT)
}


impl Api {
    pub fn from_args() -> Api {
        let method_name: String = get_action_arg();
        match method_name.as_str() {
            SET_KEY_WEIGHT => {
                let account = get_account_arg();
                let weight: u8 = get_weight_arg();
                Api::SetKeyWeight(account, Weight::new(weight))
            }
            SET_DEPLOYMENT_THRESHOLD => {
                let threshold: u8 = get_weight_arg();
                Api::SetDeploymentThreshold(Weight::new(threshold))
            }
            SET_KEY_MANAGEMENT_THRESHOLD => {
                let threshold: u8 = get_weight_arg();
                Api::SetKeyManagementThreshold(Weight::new(threshold))
            }
            SET_ALL => {
                Api::SetAll(
                    Weight::new(runtime::get_named_arg(ARG_DEPLOYMENT_THRESHOLD)),
                    Weight::new(runtime::get_named_arg(ARG_KEY_MANAGEMENT_THRESHOLD)),
                    runtime::get_named_arg(ARG_ACCOUNTS),
                    runtime::get_named_arg(ARG_WEIGHTS),
                )
            }
            _ => runtime::revert(Error::UnknownApiCommand),
        }
    }
}