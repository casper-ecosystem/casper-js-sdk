#!/usr/bin/env node

module.exports = {
  start_a_single_node: function() {
    // modules used later
    const fs = require('fs');
    const { spawn } = require('child_process');

    //paths
    const tmp_dir = '/tmp/casper-js-sdk-ci';
    const casper_bin = tmp_dir + '/bin/casper-node';
    const config_toml = tmp_dir + '/config/1_0_0/config.toml';

    // check if directory exists
    if (fs.existsSync(tmp_dir)) {
      console.log('Temp Directory exists: ' + tmp_dir);
    } else {
      console.log('Directory not found.');
      process.exitCode = 1;
    }

    // setup the log files to write to
    const stdout_file = fs.createWriteStream(tmp_dir + '/stdout.log', {
      flags: 'a'
    });
    const stderr_file = fs.createWriteStream(tmp_dir + '/stderr.log', {
      flags: 'a'
    });

    // start the casper-node process
    const casper_node = spawn(casper_bin, ['validator', config_toml]);

    // log casper-node to temp dir for local use
    casper_node.stdout.pipe(stdout_file);
    casper_node.stderr.pipe(stderr_file);

    // log the error & close to console
    casper_node.on('error', error => {
      console.log(`error: ${error.message}`);
    });

    casper_node.on('close', code => {
      console.log(`child process exited with code ${code}`);
    });

    // sleeps 180 seconds so genesis completes, update later to verify that
    console.log(`sleeping 180s to allow node to complete genesis...`);
    sleep(180000);
    return casper_node.pid;
  }
};

// sleep given ms, used above as a hack to allow node genesis to complete
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
