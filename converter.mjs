import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import {
  convertTokensToVariables,
  convertTokensToThemeVariables,
} from "./utils/index.mjs";

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
 *  - $scss 변수 생성 및
 *  - html[data-theme="테마"] { ... } 생성
 */
StyleDictionary.registerFormat({
  name: "custom/theme",
  format: ({ dictionary, file }) => {
    const tokenFileName = file.destination.split(".")[1];
    return convertTokensToThemeVariables(dictionary, tokenFileName);
  },
});

/**
 * 커스텀 테마 format
 *
 *  - $scss 변수 생성
 *  - scss 변수 내부에 다른 색상 변수를 참조하는 경우 테마 파일에 맞는 css 변수로 변환
 */
StyleDictionary.registerFormat({
  name: "custom/scss",
  format: ({ dictionary, file }) => {
    const tokenFileName = file.destination.split(".")[1];
    return convertTokensToVariables(dictionary, tokenFileName);
  },
});

const config = {
  source: [`./sources/*.json`],
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
          destination: "tokens.core.scss",
          format: "custom/scss",
        },
        {
          destination: "tokens.light.scss",
          format: "custom/theme",
          filter: (token) => token.filePath.includes("light.json"),
        },
        {
          destination: "tokens.dark.scss",
          format: "custom/theme",
          filter: (token) => token.filePath.includes("dark.json"),
        },
      ],
    },
  },
};

const sd = new StyleDictionary({ ...config });

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
