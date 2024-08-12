#!/usr/bin/env bash
set -e

PRGDIR=$(dirname "$0")
BASEDIR=$(cd "$PRGDIR" > /dev/null; pwd)
PROJECT_DIR=~/.ktorm-docs/temp/repo/ktorm
DEPLOY_DIR=~/.ktorm-docs/temp/repo/ktorm-docs

# Compile doc.js.
cd "$BASEDIR/themes/doc" && npx webpack --mode production

# Generate hexo html. 
cd "$BASEDIR" && npx hexo clean && npx hexo generate

# Write custom domain to CNAME file (required by GitHub Pages). 
echo "www.ktorm.org" > "$BASEDIR/public/CNAME"

# Clone the project repo. 
[ -e "$PROJECT_DIR" ] && rm -rf "$PROJECT_DIR"
git clone --depth=1 --branch=dev https://github.com/kotlin-orm/ktorm.git "$PROJECT_DIR"

# Generate dokka html. 
cd "$PROJECT_DIR" && ./gradlew dokkaHtmlMultiModule
cp -r "$PROJECT_DIR/build/dokka/htmlMultiModule" "$BASEDIR/public/api-docs"

# Skip Github deployement.
if [ -n "$1" ] && [ "$1" == "--skip-deploy" ]; then
    echo "Skip deploy..."
    exit 0
fi

# Clone the deploy repo. 
[ -e "$DEPLOY_DIR" ] && rm -rf "$DEPLOY_DIR"
git clone --depth=1 --branch=gh-pages https://github.com/kotlin-orm/ktorm-docs.git "$DEPLOY_DIR"

# Copy static files to the deploy dir. 
cd "$DEPLOY_DIR" && git rm -rf . && cp -r "$BASEDIR/public/." "$DEPLOY_DIR"

# Commit to GitHub Pages.
git add . 
git commit -m "deploy the site"
git push
