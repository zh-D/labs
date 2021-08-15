`npm i typescript -S`
`(npx) tsc --init`(generate tsconfig.json)
write comment in the ts files
add tsconfig in tsconfig.json
```json
  "typedocOptions": {
    "entryPoints": ["index.ts"],
    "out": "docs"
  }
```
`npx typedoc --out docs`
This command will generate typedoc with your comment