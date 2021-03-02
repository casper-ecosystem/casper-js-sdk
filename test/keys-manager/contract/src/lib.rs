use casper_contract::{
    contract_api::{account},
    unwrap_or_revert::UnwrapOrRevert
};
use casper_types::{
    account::{
        AccountHash, Weight, ActionType, AddKeyFailure, RemoveKeyFailure, SetThresholdFailure, UpdateKeyFailure
    }
};

mod errors;
mod api;

use errors::Error;
use api::Api;

pub fn execute() {
    let result = match Api::from_args() {
        Api::SetKeyWeight(key, weight) => set_key_weight(key, weight),
        Api::SetDeploymentThreshold(threshold) => set_threshold(ActionType::Deployment, threshold),
        Api::SetKeyManagementThreshold(threshold) => {
            set_threshold(ActionType::KeyManagement, threshold)
        }
        Api::SetAll(deployment_threshold, key_management_threshold, accounts, weights) => {
            for (account, weight) in accounts.iter().zip(weights) {
                set_key_weight(account.clone(), weight).unwrap_or_revert();
            }
            set_threshold(ActionType::KeyManagement, key_management_threshold).unwrap_or_revert();
            set_threshold(ActionType::Deployment, deployment_threshold).unwrap_or_revert();
            Ok(())
        }
    };
    result.unwrap_or_revert()
}

fn set_key_weight(key: AccountHash, weight: Weight) -> Result<(), Error> {
    if weight.value() == 0 {
        remove_key_if_exists(key)
    } else {
        add_or_update_key(key, weight)
    }
} 

fn add_or_update_key(key: AccountHash, weight: Weight) -> Result<(), Error> {
    match account::update_associated_key(key, weight) {
        Ok(()) => Ok(()),
        Err(UpdateKeyFailure::MissingKey) => add_key(key, weight),
        Err(UpdateKeyFailure::PermissionDenied) => Err(Error::PermissionDenied),
        Err(UpdateKeyFailure::ThresholdViolation) => Err(Error::ThresholdViolation),
    }
}

fn add_key(key: AccountHash, weight: Weight) -> Result<(), Error> {
    match account::add_associated_key(key, weight) {
        Ok(()) => Ok(()),
        Err(AddKeyFailure::MaxKeysLimit) => Err(Error::MaxKeysLimit),
        Err(AddKeyFailure::DuplicateKey) => Err(Error::DuplicateKey), // Should never happen.
        Err(AddKeyFailure::PermissionDenied) => Err(Error::PermissionDenied),
    }
}

fn remove_key_if_exists(key: AccountHash) -> Result<(), Error> {
    match account::remove_associated_key(key) {
        Ok(()) => Ok(()),
        Err(RemoveKeyFailure::MissingKey) => Ok(()),
        Err(RemoveKeyFailure::PermissionDenied) => Err(Error::PermissionDenied),
        Err(RemoveKeyFailure::ThresholdViolation) => Err(Error::ThresholdViolation),
    }
}

fn set_threshold(permission_level: ActionType, threshold: Weight) -> Result<(), Error> {
    match account::set_action_threshold(permission_level, threshold) {
        Ok(()) => Ok(()),
        Err(SetThresholdFailure::KeyManagementThreshold) => {
            Err(Error::KeyManagementThresholdError)
        }
        Err(SetThresholdFailure::DeploymentThreshold) => Err(Error::DeploymentThresholdError),
        Err(SetThresholdFailure::PermissionDeniedError) => Err(Error::PermissionDenied),
        Err(SetThresholdFailure::InsufficientTotalWeight) => Err(Error::InsufficientTotalWeight),
    }
}
