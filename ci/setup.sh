#!/usr/bin/env bash

function main() {
    echo "Starting $(basename $0)"
    # arg vars
    local GH_BRANCH=${1:-'dev'}
    # non-arg vars
    local ROOT_DIR
    local TEST_ASSET_DIR
    local TMP_DIR
    local BIN_DIR
    local CONFIG_DIR
    local GH_REPO
    local GH_REPO_URL
    local REMOTE_NODE_URL

    # set non-arg vars
    ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"
    TEST_ASSET_DIR="$ROOT_DIR/ci/test-assets"
    TMP_DIR='/tmp/casper-js-sdk-ci'
    BIN_DIR="$TMP_DIR/bin"
    CONFIG_DIR="$TMP_DIR/config/1_0_0"
    GH_REPO='casper-node'
    GH_REPO_URL='https://github.com/casper-network/casper-node.git'
    REMOTE_NODE_URL="https://s3.us-east-2.amazonaws.com/nctl.casperlabs.io/$GH_BRANCH/casper-node" 

    # working dir
    if [ -d "$TMP_DIR" ]; then
        echo "Temp Dir $TMP_DIR exists. Removing."
        rm -rf "$TMP_DIR"
        echo "... recreating $TMP_DIR"
        mkdir -p "$TMP_DIR"
    else
        echo "... creating $TMP_DIR"
        mkdir -p "$TMP_DIR"
    fi

    mkdir -p "$BIN_DIR"
    mkdir -p "$CONFIG_DIR" 

    # mv static assets
    cp -a "$TEST_ASSET_DIR/." "$CONFIG_DIR/"

    # pull down casper-node to created dir
    pushd "$TMP_DIR" > /dev/null
    git clone -b "$GH_BRANCH" "$GH_REPO_URL" &> /dev/null
    pushd "$GH_REPO" > /dev/null
    # get the tomls
    make resources/local/chainspec.toml
    cp './resources/local/chainspec.toml' "$CONFIG_DIR"
    cp './resources/local/config.toml' "$CONFIG_DIR"
    popd > /dev/null

    # pull down the node
    # note: this is driven by the branch=''
    pushd "$BIN_DIR"
    curl -LJO "$REMOTE_NODE_URL"
    chmod +x 'casper-node'
    popd > /dev/null

    # don't need the git repo anymore
    rm -rf "$TMP_DIR/$GH_REPO"
    popd > /dev/null
}

# ----------------------------------------------------------------
# ENTRY POINT
# ----------------------------------------------------------------

unset GH_BRANCH

for ARGUMENT in "$@"
do
    KEY=$(echo "$ARGUMENT" | cut -f1 -d=)
    VALUE=$(echo "$ARGUMENT" | cut -f2 -d=)
    case "$KEY" in
        branch) GH_BRANCH=${VALUE} ;;
        *)
    esac
done

main "$GH_BRANCH"
