// import { readFile } from 'fs/promises';
// import path, { dirname } from 'path';
import StyleDictionary from 'style-dictionary';
// import { convertToDTCG } from 'style-dictionary/utils';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PRIMITIVE_TOKEN_PATH = path.join(__dirname, `./sources/primitive.tokens.json`);
// const PRIMITIVE_TOKEN = await readFile(PRIMITIVE_TOKEN_PATH,"utf8")
// const primitive_token_dictionary = JSON.parse(PRIMITIVE_TOKEN)
// const converted_primitive_token_dictonary = convertToDTCG(primitive_token_dictionary, { applyTypesToGroup: false });

const config = { 
  source: ["./tokens/sources/**/*.tokens.json"],
  // tokens: {
  //   primitive: {...converted_primitive_token_dictonary}
  // },
  platforms: {
    scss: {
      transformGroup: "scss",
      transforms: ["name/kebab"],
      buildPath: "tokens/dist/",
      files: [
        {
          destination: "tokens.scss",
          format: "scss/map-deep",
        },
      ],
      usesDtcg: true
    }
  }
}

const sd = new StyleDictionary({...config});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();