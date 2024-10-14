import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import { convertTokensToVariables } from "./utils/index.mjs";

// @tokens-studio/sd-transforms TransformGroup 등록
register(StyleDictionary);

/**
 * 생성된 파일 상단에 생성 시간 주석 추가
 * UTC + 9시간 = KST(한국시간)
 */
StyleDictionary.registerFileHeader({
  name: "my-file-header",
  fileHeader: async (defaultMessages = []) => {
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const currentTime = new Date(Date.now() + KR_TIME_DIFF).toLocaleString(
      "ko-KR",
      {
        timeZone: "UTC",
      }
    );
    return [`created at ${currentTime}`, ...defaultMessages];
  },
});

/**
 * 커스텀 테마 format
 *
 * THEME_FLAG : boolean(default: false)
 *  - html[data-theme="테마"] { ... } scss 테마 변수 인덴트 추가 플래그
 */
StyleDictionary.registerFormat({
  name: "custom/theme",
  format: ({ dictionary, config }) => {
    const THEME_FLAG = true;

    const lightTheme = convertTokensToVariables(
      dictionary,
      "light.tokens.json",
      THEME_FLAG
    );
    const darkTheme = convertTokensToVariables(
      dictionary,
      "dark.tokens.json",
      THEME_FLAG
    );
    const coreTokens = convertTokensToVariables(dictionary, "core.tokens.json");

    return `html[data-theme="light"] {\n${lightTheme}\n}\n\nhtml[data-theme="dark"] {\n${darkTheme}\n}\n\n${coreTokens}`;
  },
});

const config = {
  source: [`./sources/*.tokens.json`],
  preprocessors: ["tokens-studio"],
  log: {
    warnings: "warn",
    verbosity: "verbose",
    errors: {
      brokenReferences: "throw",
    },
  },
  platforms: {
    scss: {
      prefix: "tokens",
      transformGroup: "tokens-studio",
      transforms: [
        "ts/descriptionToComment",
        "ts/size/px",
        "ts/opacity",
        "ts/size/lineheight",
        "ts/typography/fontWeight",
        "ts/shadow/innerShadow",
        "name/kebab",
        "time/seconds",
        "html/icon",
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
        outputReferences: true,
        themeable: true,
      },
      buildPath: "./tokens/",
      files: [
        {
          destination: "tokens.scss",
          format: "custom/theme",
          options: {},
        },
      ],
    },
  },
};

const sd = new StyleDictionary({ ...config });

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
