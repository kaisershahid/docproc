#!/bin/bash
echo "> set tag"
for tag in `git tag`; do
  echo $tag
done
echo "< enter tag (omit 'v')"
read tag
echo "> tag=$tag"

# @todo validate tag doesn't exist
# @todo validate tag is valid format
if [ "" = "$tag" ]; then
  echo "ERROR: no tag"
  exit 1
fi

echo "< enter release one-liner"
read releaseOneLiner

if [ "" = "$releaseOneLiner" ]; then
  echo "ERROR: no release one-liner"
  exit 1
fi

echo "# tag: $tag"
echo "# one-liner: $releaseOneLiner"
echo "? is this correct? Y/n"
read prompt
if [ "n" = $prompt ] || [ "N" = $prompt ]; then
  exit 1
fi

echo "- testing" && npm run test && \
echo "- packing" && npm run prepack && \
echo "- committing lib" && git add lib package.json && \
echo "- tagging $tag" && git commit lib -m "- pack & release: (v$tag) $releaseOneLiner" && \
npm version $tag