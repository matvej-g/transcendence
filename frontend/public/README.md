in this directory:

index.html
index_old -> auth file from ivan (can be deleted?)
userLanding_old -> user landing placeholder from ivan (can be deleted?)
profle_avatar -> for having an img in profile before connecting to backend


To run the website without docker:

0) - once per system (probably add to docker instructions)
# Install nvm (Node Version Manager)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# reload your shell
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

# install latest node
nvm install --lts
nvm use --lts

# from project root
# IF package.json and package-lock.json are missing:
npm init -y
npm i -D typescript
# if they are present
npm ci

1) from root (or where tsconfig.json is)
# build js from ts once
npx tsc
# or
# re-builds js on each save
npx tsc --watch

2) run website / server
python3 -m http.server 8080 --directory site/public


