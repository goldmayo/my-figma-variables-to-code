import { usesReferences, getReferences } from "style-dictionary/utils";

/**
 * 컬러 타입 목록
 */
const COLOR_CONTAIN_TOKEN_TYPE = ["shadow", "border", "gradient", "color"];

/**
 * 참조 여부 확인 함수
 *
 * 토큰이 사전의 다른 토큰의 값을 참조하는지 확인
 *
 * @param {token: TransformedToken} token 참조값 여부를 판별 하고 싶은 토큰 객체
 * @param {dictionary: Dictionary} dictionary 파라미터 토큰이 속한 객체
 * @return {boolean} 참조여부
 *
 * https://github.com/amzn/style-dictionary/blob/main/types/DesignToken.ts
 *
 * https://styledictionary.com/reference/utils/references/#usesreferences
 */
const isReferenceOtherTokens = (token, dictionary) =>
  usesReferences(token, dictionary);

/**
 * 토큰 참조 목록 반환 함수
 *
 * 사전 내부에서 파라미터 토큰이 참조하는 토큰의 값들을 반환
 *
 * @param {TransformedToken} token 다른 토큰을 참조하는 토큰 객체
 * @param {Dictionary} dictionary 파라미터 토큰이 속한 객체
 * @return {DesignToken[]} 파라미터 토큰이 참조하는 토큰의 값들
 *
 * https://styledictionary.com/reference/utils/references/#getreferences
 */
const getTokensReferencesList = (token, dictionary) =>
  getReferences(token, dictionary);

/**
 * 컬러 속성 타입 포함 여부 함수
 *
 * W3C DTCG에서 지정한 토큰 타입 중 컬러 속성을 가지는 타입 목록에 속하는지 확인
 *
 * @param {string} targetType 확인하고 싶은 토큰의 타입
 * @return {boolean} 컬러 속성 여부
 *
 * https://tr.designtokens.org/format/
 */
const isIncludeColorType = (targetType) =>
  COLOR_CONTAIN_TOKEN_TYPE.includes(targetType);

/**
 * 토큰 이름의 첫 번째 세그먼트를 제거하는 함수
 *
 * 첫번째 구분자 "-" 를 기준으로 맨 처음 세그먼트를 제거
 *
 * "light-color-blue-200" -> "color-blue-200"
 *
 * @param {string} tokenName 변환하고 싶은 토큰 이름
 * @return {string} 첫번째 구분자 "-" 를 기준으로 맨 처음 세그먼트가 제거된 문자열
 */
const removeFirstSegmentTokenName = (tokenName) =>
  tokenName.split("-").slice(1).join("-");

/**
 * 들여쓰기 공백 추가 함수
 *
 * @param {number} count 추가 하고 싶은 인덴트 숫자
 * @return {string} " "이 count회 반복된 인덴트 문자열
 */
const addIndentSpace = (count) => " ".repeat(count);

/**
 * 참조 값을 변환하는 함수
 *
 * 참조 값의 속성 중 color 속성을 가지는 값: css 변수로 변환
 *
 * 그 외의 참조 값은 scss 변수로 변환
 *
 * @param {DesignToken.$value} tokenValue 다른 토큰의 값을 참조하는 토큰 값
 * @param {DesignToken.$value[]} referencedValueArray tokenValue가 참조하는 토튼 배열
 * @param {string} tokenType tokenValue를 소유한 토큰의 타입
 * @return {DesignToken.$value[]} 변환된 referencedValueArray
 *
 * https://github.com/amzn/style-dictionary/blob/main/types/DesignToken.ts
 *
 * https://styledictionary.com/reference/utils/references/#getreferences
 */
const replaceValueToReference = (tokenValue, referencedValueArray, tokenType) =>
  referencedValueArray.reduce((acc, ref) => {
    const refName = isIncludeColorType(tokenType)
      ? `--var(${removeFirstSegmentTokenName(ref.name)})`
      : `$${ref.name}`;
    return acc.replace(ref.$value, refName);
  }, tokenValue);

/**
 * 토큰 변환 함수
 *
 * 특정 파일로 생성한 사전의 모든 토큰을 참조 값 여부에 따라 css변수 또는 scss변수로 변환
 *
 * @param {Dictionary} dictionary 변환할 사전
 * @param {string} tokenFileDestination 생성할 token.*.scss 파일의 이름중 * 를 의미
 * @return {string} 사전의 내부의 $scss 변수로 변환된 모든 토큰
 *
 * https://github.com/amzn/style-dictionary/blob/main/types/DesignToken.ts
 */
export const convertTokensToVariables = (dictionary, tokenFileDestination) => {
  const tokens = dictionary.allTokens
    .filter((token) => token.filePath.includes(`${tokenFileDestination}`))
    .map((token) => {
      const tokenValue = isReferenceOtherTokens(
        token.original.$value,
        dictionary.tokens
      )
        ? replaceValueToReference(
            token.$value,
            getTokensReferencesList(token.original.$value, dictionary.tokens),
            token.original.$type
          )
        : token.$value;

      return `$${token.name}: ${tokenValue};`;
    })
    .join("\n");

  // return `@import "./tokens.light.scss";\n@import "./tokens.dark.scss";\n\n${tokens}`;
  return `${tokens}`;
};

/**
 * 토큰을 테마에 맞는 스타일로 변환하는 함수
 *
 * 특정 파일로 생성한 사전의 모든 토큰을 참조 값 여부에 따라 css변수 또는 scss변수로 변환
 *
 * $scss 변수와 html[data-theme="tokenFileDestination"] {...} 로 변환
 *
 * @param {Dictionary} dictionary 변환할 사전
 * @param {string} themeName 생성할 테마 파일 token.*.scss 파일의 * 를 의미
 * @return {string} 변환된 $scss 변수와 html[data-theme="themeName"] {...}
 *
 * https://github.com/amzn/style-dictionary/blob/main/types/DesignToken.ts
 */
export const convertTokensToThemeVariables = (dictionary, themeName) => {
  const tokens = dictionary.allTokens.filter((token) =>
    token.filePath.includes(`${themeName}`)
  );

  const [scssVar, cssVar] = tokens.reduce(
    ([scssAcc, cssAcc], token) => {
      const tokenName = token.name.replace(`${themeName}-`, "");
      const tokenHasReferences = isReferenceOtherTokens(
        token.original.$value,
        dictionary.tokens
      )
        ? replaceValueToReference(
            token.$value,
            getTokensReferencesList(token.original.$value, dictionary.tokens),
            token.original.$type
          )
        : token.$value;

      const scssVariable = `$${tokenName}-${themeName}: ${tokenHasReferences};`;
      const cssVariable = `${addIndentSpace(
        2
      )}--${tokenName}: $${tokenName}-${themeName};`;

      return [
        [...scssAcc, scssVariable],
        [...cssAcc, cssVariable],
      ];
    },
    [[], []]
  );

  return `${scssVar.join(
    "\n"
  )}\n\nhtml[data-theme=${themeName}] {\n${cssVar.join("\n")}\n}`;
};
