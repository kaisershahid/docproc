#!/bin/bash
echo "> set tag"
for tag in `git tag`; do
  echo $tag
done
echo "< enter tag"
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

echo "# release: $tag ($releaseOneLiner)"

echo "- testing" && npm run test && \
echo "- packing" && npm run prepack && \
echo "- committing lib" && git add lib && \
echo "- tagging $tag" && git commit lib -m "- pack & release: $tag" && \
git tag -a $tag -m "${releaseOneLiner}"