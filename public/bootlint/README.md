Updating bootlint
-----------------

When updating lint, do the following to generate the `min` file.

```sh
npm install
./node_modules/.bin/uglifyjs public/bootlint/<version>/bootlint.js -o public/bootlint/<version>/bootlint.min.js --comments all
```

Additionally, do not forget to update the latest symlink.
