'use strict';

/**
 * Reports when the live Casper networks have moved past the node images the
 * e2e matrix is pinned to.
 *
 * The comparison is against the `buildVersion` each pinned image *reports*, not
 * against its tag: `makesoftware/casper-nctl:v212` serves `build_version`
 * `2.1.1-4bb15d5e0`, so reading 2.1.2 off the tag would overstate coverage by a
 * patch and hide exactly the drift this exists to find.
 *
 * Usage: node scripts/check-node-version-drift.js
 * Prints a markdown report to stdout. Exit 0 = no drift, 1 = drift found,
 * 2 = could not tell (a network was unreachable, or the pin file is unusable).
 */

const fs = require('fs');
const path = require('path');

const TAGS_FILE = path.join(__dirname, '..', 'e2e', 'supported-tags.json');

// Not the `rpc.{mainnet,testnet}.casperlabs.io` pair the old e2e scripts and CI
// env carried: those hostnames no longer resolve at all.
const NETWORKS = {
  mainnet: 'https://node.mainnet.casper.network/rpc',
  testnet: 'https://node.testnet.casper.network/rpc'
};

/** `2.1.1-4bb15d5e0` -> `[2, 1, 1]`. Build metadata after the dash is dropped. */
function parseVersion(raw) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(String(raw).trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareVersions(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

const formatVersion = version => version.join('.');

async function fetchBuildVersion(url) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'version-drift',
      method: 'info_get_status'
    }),
    signal: AbortSignal.timeout(30_000)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  const buildVersion = body?.result?.build_version;
  if (!buildVersion) {
    throw new Error('response carried no result.build_version');
  }
  return buildVersion;
}

async function main() {
  let pinned;
  try {
    pinned = JSON.parse(fs.readFileSync(TAGS_FILE, 'utf8')).tags;
  } catch (error) {
    console.error(`could not read ${TAGS_FILE}: ${error.message}`);
    return 2;
  }

  const covered = [];
  for (const entry of pinned) {
    const version = parseVersion(entry.buildVersion);
    if (!version) {
      console.error(
        `pinned tag ${entry.tag} has no usable buildVersion — boot the image, ` +
          `read info_get_status, and record it in ${TAGS_FILE}`
      );
      return 2;
    }
    covered.push({ tag: entry.tag, version });
  }

  const highest = covered.reduce((max, entry) =>
    compareVersions(entry.version, max.version) > 0 ? entry : max
  );

  const live = [];
  for (const [name, url] of Object.entries(NETWORKS)) {
    try {
      const buildVersion = await fetchBuildVersion(url);
      const version = parseVersion(buildVersion);
      if (!version) throw new Error(`unparseable build_version ${buildVersion}`);
      live.push({ name, buildVersion, version });
    } catch (error) {
      console.error(`${name}: ${error.message}`);
      return 2;
    }
  }

  const ahead = live.filter(
    network => compareVersions(network.version, highest.version) > 0
  );

  const table = [
    '| Network | build_version |',
    '| --- | --- |',
    ...live.map(n => `| ${n.name} | \`${n.buildVersion}\` |`),
    '',
    '| Pinned image tag | reports build_version |',
    '| --- | --- |',
    ...covered.map(c => `| \`${c.tag}\` | \`${formatVersion(c.version)}\` |`)
  ].join('\n');

  if (ahead.length === 0) {
    console.log(
      `No drift: the e2e matrix covers up to ${formatVersion(
        highest.version
      )} (\`${highest.tag}\`), which is at or ahead of every live network.\n\n${table}`
    );
    return 0;
  }

  console.log(
    `${ahead
      .map(n => `**${n.name}** is running \`${n.buildVersion}\``)
      .join(' and ')}, past the newest node image the e2e matrix is pinned to ` +
      `(\`${highest.tag}\`, build ${formatVersion(highest.version)}).\n\n` +
      `Pick up a newer \`makesoftware/casper-nctl\` tag in ` +
      `\`e2e/supported-tags.json\` and in the \`scheduled-e2e\` matrix, boot it ` +
      `once to record the \`build_version\` it actually reports, and re-run the ` +
      `full e2e matrix against it.\n\n${table}`
  );
  return 1;
}

main().then(
  code => process.exit(code),
  error => {
    console.error(error);
    process.exit(2);
  }
);
