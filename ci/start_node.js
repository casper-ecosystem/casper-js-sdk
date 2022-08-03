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

    const stdout_file = fs.createWriteStream(tmp_dir + '/stdout.log', {
      flags: 'a'
    });
    const stderr_file = fs.createWriteStream(tmp_dir + '/stderr.log', {
      flags: 'a'
    });

    const casper_node = spawn(casper_bin, ['validator', config_toml]);

    casper_node.stdout.pipe(stdout_file);
    casper_node.stderr.pipe(stderr_file);

    //        casper_node.stdout.on("data", data => {
    //            console.log(`stdout: ${data}`);
    //        });
    //
    //        casper_node.stderr.on("data", data => {
    //            console.log(`stderr: ${data}`);
    //        });

    casper_node.on('error', error => {
      console.log(`error: ${error.message}`);
    });

    casper_node.on('close', code => {
      console.log(`child process exited with code ${code}`);
    });

    console.log(`sleeping 60s to allow node to complete genesis...`);
    sleep(60000);
    return casper_node.pid;
  }
};

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
