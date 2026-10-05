#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node -e 'if (Number(process.versions.node.split(".")[0]) < 24) throw Error("Node.js 24+ required")'
mkdir -p tests/helpers
cp game.cjs tests/helpers/game.cjs
for test_file in ./*.test.cjs; do
  cp "$test_file" tests/
done
node --test tests/*.test.cjs
