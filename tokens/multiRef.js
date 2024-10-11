import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import { outputReferencesFilter } from "style-dictionary/utils";

register(StyleDictionary);
StyleDictionary.registerFileHeader({
  name: "my-file-header",
  // async is optional
  fileHeader: async (defaultMessages = []) => {
    const currentTime = new Date(Date.now()).toLocaleString("ko-KR", {
      timeZone: "UTC",
    });
    return [`created at ${currentTime}`, ...defaultMessages];
  },
});

const config = {
  source: ["./tokens/sources/multiple/*.json"],
  // source: ["./tokens/sources/**/primitive.tokens.json"],
  // source: ["./tokens/sources/**/tokens.json"],
  preprocessors: ["tokens-studio"],
  log: {
    warnings: "warn", // 'warn' | 'error' | 'disabled'
    verbosity: "verbose", // 'default' | 'silent' | 'verbose'
    errors: {
      brokenReferences: "throw", // 'throw' | 'console'
    },
  },
  platforms: {
    scss: {
      transformGroup: "tokens-studio",
      transforms: [
        "ts/descriptionToComment",
        // "ts/resolveMath",
        "ts/size/px",
        "ts/opacity",
        "ts/size/lineheight",
        "ts/typography/fontWeight",
        "ts/shadow/innerShadow",
        "name/kebab",
        "time/seconds",
        "html/icon",
        // "size/px",
        "asset/url",
        "fontFamily/css",
        "cubicBezier/css",
        "strokeStyle/css/shorthand",
        "border/css/shorthand",
        "typography/css/shorthand",
        "transition/css/shorthand",
        "shadow/css/shorthand",
        "name/kebab",
      ],
      options: {
        fileHeader: "my-file-header",
        outputReferences: outputReferencesFilter,
      },
      buildPath: "tokens/dist/",
      files: [
        {
          destination: "tokens.scss",
          format: "scss/map-deep",
        },
      ],
    },
  },
};

const sd = new StyleDictionary({ ...config });

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
