#!/usr/bin/env bash
set -e

function join_by {
    local d=$1
    shift
    echo -n "$1"
    shift
    printf "%s" "${@/#/$d}"
}


PRGDIR=$(dirname "$0")
BASEDIR=$(cd "$PRGDIR" > /dev/null; pwd)
PROJECT_DIR=~/.ktorm-docs/temp/repo/ktorm
DEPLOY_DIR=~/.ktorm-docs/temp/repo/ktorm-docs

srcDirs=(
    "./ktorm-core/src/main/kotlin"
    "./ktorm-global/src/main/kotlin"
    "./ktorm-jackson/src/main/kotlin"
    "./ktorm-support-mysql/src/main/kotlin"
    "./ktorm-support-oracle/src/main/kotlin"
    "./ktorm-support-postgresql/src/main/kotlin"
    "./ktorm-support-sqlite/src/main/kotlin"
    "./ktorm-support-sqlserver/src/main/kotlin"
)

srcLinks=(
    "ktorm-core/src/main/kotlin=https://github.com/kotlin-orm/ktorm/blob/master/ktorm-core/src/main/kotlin#L"
    "ktorm-global/src/main/kotlin=https://github.com/kotlin-orm/ktorm/blob/master/ktorm-global/src/main/kotlin#L"
    "ktorm-jackson/src/main/kotlin=https://github.com/kotlin-orm/ktorm/blob/master/ktorm-jackson/src/main/kotlin#L"
    "ktorm-support-mysql/src/main/kotlin=https://github.com/kotlin-orm/ktorm/blob/master/ktorm-support-mysql/src/main/kotlin#L"
    "ktorm-support-oracle/src/main/kotlin=https://github.com/kotlin-orm/ktorm/blob/master/ktorm-support-oracle/src/main/kotlin#L"
    "ktorm-support-postgresql/src/main/kotlin=https://github.com/kotlin-orm/ktorm/blob/master/ktorm-support-postgresql/src/main/kotlin#L"
    "ktorm-support-sqlite/src/main/kotlin=https://github.com/kotlin-orm/ktorm/blob/master/ktorm-support-sqlite/src/main/kotlin#L"
    "ktorm-support-sqlserver/src/main/kotlin=https://github.com/kotlin-orm/ktorm/blob/master/ktorm-support-sqlserver/src/main/kotlin#L"
)

links=(
    # "https://javadoc.io/doc/org.springframework/spring-jdbc/latest/^https://javadoc.io/doc/org.springframework/spring-jdbc/latest/package-list"
    # "https://javadoc.io/doc/org.springframework/spring-tx/latest/^https://javadoc.io/doc/org.springframework/spring-tx/latest/package-list"
    "https://www.javadoc.io/doc/com.fasterxml.jackson.core/jackson-databind/latest/^https://www.javadoc.io/doc/com.fasterxml.jackson.core/jackson-databind/latest/package-list"
    "https://www.javadoc.io/doc/com.fasterxml.jackson.core/jackson-core/latest/^https://www.javadoc.io/doc/com.fasterxml.jackson.core/jackson-core/latest/package-list"
    "https://www.javadoc.io/doc/com.fasterxml.jackson.core/jackson-annotations/latest/^https://www.javadoc.io/doc/com.fasterxml.jackson.core/jackson-annotations/latest/package-list"
)

# Clone the project repo. 
[ -e "$PROJECT_DIR" ] && rm -rf "$PROJECT_DIR"
git clone --depth=1 --branch=master https://github.com/kotlin-orm/ktorm.git "$PROJECT_DIR"

# Go to the project repo and print the classpath. 
cd "$PROJECT_DIR" && ./gradlew printClasspath

# Generate API documents. 
[ -e "$BASEDIR/source/api-docs" ] && rm -rf "$BASEDIR/source/api-docs"
java \
    -jar "$BASEDIR/tools/dokka-fatjar-with-hexo-format-0.9.18-SNAPSHOT.jar" \
    -src $(join_by ":" ${srcDirs[@]}) \
    -format hexo \
    -classpath $(cat "build/ktorm.classpath") \
    -jdkVersion 8 \
    -include "./PACKAGES.md" \
    -output "$BASEDIR/source/" \
    -module "api-docs" \
    -srcLink $(join_by "^^" ${srcLinks[@]}) \
    -links $(join_by "^^" ${links[@]})

# Compile doc.js
cd "$BASEDIR/themes/doc" && npx webpack -p

# Generate the site. 
cd "$BASEDIR" && hexo clean && hexo generate

# Write custom domain to CNAME file (required by GitHub Pages). 
echo "www.ktorm.org" > "$BASEDIR/public/CNAME"

# Clone the deploy repo. 
[ -e "$DEPLOY_DIR" ] && rm -rf "$DEPLOY_DIR"
git clone --depth=1 --branch=gh-pages https://github.com/kotlin-orm/ktorm-docs.git "$DEPLOY_DIR"

# Copy static files to the deploy dir. 
cd "$DEPLOY_DIR" && git rm -rf . && cp -r "$BASEDIR/public/." "$DEPLOY_DIR"

# Commit to GitHub Pages.
git add . 
git commit -m "deploy the site"
git push
