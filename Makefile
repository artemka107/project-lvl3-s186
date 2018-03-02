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
debug:
	DEBUG=page-loader:* npm run babel-node -- src/bin/pageLoader.js --output /tmp https://artemka107.github.io/mishka/
test:
	make debug
	npm run test
test-w:
	npm run test:watch
