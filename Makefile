install:
	npm install
start:
	npm run build
publish:
	npm publish
lint:
	npm run eslint .
run:
	npm run babel-node -- src/bin/pageLoader.js --output /tmp https://hexlet.io
test:
	npm run test
test-w:
	npm run test:watch
