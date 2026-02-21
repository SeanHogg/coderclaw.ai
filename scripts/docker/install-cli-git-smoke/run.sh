#!/usr/bin/env bash
set -euo pipefail

LOCAL_CLI_INSTALL_PATH="/opt/coderclaw-install-cli.sh"
if [[ -n "${CODERCLAW_INSTALL_CLI_URL:-}" ]]; then
  CLI_INSTALL_URL="$CODERCLAW_INSTALL_CLI_URL"
elif [[ -f "$LOCAL_CLI_INSTALL_PATH" ]]; then
  CLI_INSTALL_URL="file://${LOCAL_CLI_INSTALL_PATH}"
else
  CLI_INSTALL_URL="https://coderclaw.ai/install-cli.sh"
fi

curl_cli_install() {
  if [[ "$CLI_INSTALL_URL" == file://* ]]; then
    curl -fsSL "$CLI_INSTALL_URL"
  else
    curl -fsSL --proto '=https' --tlsv1.2 "$CLI_INSTALL_URL"
  fi
}

echo "==> CLI installer: --help"
curl_cli_install | bash -s -- --help >/tmp/install-cli-help.txt
grep -q -- "--install-method" /tmp/install-cli-help.txt

echo "==> Clone CoderClaw repo"
REPO_ROOT="/tmp"
REPO_DIR_NAME="coderclaw-src"
REPO_DIR="${REPO_ROOT}/${REPO_DIR_NAME}"
rm -rf "$REPO_DIR"
git clone --depth 1 https://github.com/coderclaw/coderclaw.git "$REPO_DIR"
if [[ -n "${CODERCLAW_GIT_REF:-}" ]]; then
  echo "==> Checkout ref: ${CODERCLAW_GIT_REF}"
  git -C "$REPO_DIR" fetch --depth 1 origin "refs/tags/${CODERCLAW_GIT_REF}:refs/tags/${CODERCLAW_GIT_REF}" || true
  git -C "$REPO_DIR" fetch --depth 1 origin "$CODERCLAW_GIT_REF" || true
  if ! git -C "$REPO_DIR" checkout "$CODERCLAW_GIT_REF"; then
    echo "ERROR: failed to checkout ref ${CODERCLAW_GIT_REF}" >&2
    git -C "$REPO_DIR" tag -l | head -n 20 >&2 || true
    exit 1
  fi
  echo "checked_out=$(git -C "$REPO_DIR" rev-parse HEAD)"
fi

echo "==> Install from Git (install-cli)"
INSTALL_PREFIX="/tmp/coderclaw"
(cd "$REPO_ROOT" && curl_cli_install | bash -s -- --install-method git --git-dir "$REPO_DIR_NAME" --no-git-update --no-onboard --prefix "$INSTALL_PREFIX")

echo "==> Verify wrapper exists"
test -x "${INSTALL_PREFIX}/bin/coderclaw"

echo "==> Verify coderclaw runs"
"${INSTALL_PREFIX}/bin/coderclaw" --help >/dev/null
(cd / && "${INSTALL_PREFIX}/bin/coderclaw" --help >/dev/null)

echo "==> Verify version matches checkout"
EXPECTED_VERSION="$(node -e "console.log(JSON.parse(require('fs').readFileSync('${REPO_DIR}/package.json','utf8')).version)")"
INSTALLED_VERSION="$("${INSTALL_PREFIX}/bin/coderclaw" --version 2>/dev/null | head -n 1 | tr -d '\r')"
echo "installed=$INSTALLED_VERSION expected=$EXPECTED_VERSION"
if [[ "$INSTALLED_VERSION" != "$EXPECTED_VERSION" ]]; then
  echo "ERROR: expected coderclaw@$EXPECTED_VERSION, got $INSTALLED_VERSION" >&2
  exit 1
fi

echo "OK"
