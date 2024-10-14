import { usesReferences, getReferences } from "style-dictionary/utils";

export function isReferenceOtherTokens(token, dictionary) {
  return usesReferences(token, dictionary);
}

export function getTokensReferencesList(token, dictionary) {
  return getReferences(token, dictionary);
}

export function replaceValueToReference(referencedValue, referenceArray) {
  let target = referencedValue;
  referenceArray.forEach((ref) => {
    target = target.replace(ref.$value, `$${ref.name}`);
  });
  return target;
}

export function addIndentSpace(count) {
  return " ".repeat(count);
}

export function convertTokensToVariables(
  dictionary,
  tokenPath,
  isTheme = false
) {
  return dictionary.allTokens
    .filter((token) => token.filePath.includes(`${tokenPath}`))
    .map((token) => {
      let tokenHasReferences = token.$value;

      if (!isReferenceOtherTokens(token.original.$value, dictionary.tokens)) {
        return `${isTheme ? addIndentSpace(2) : addIndentSpace(0)}$${
          token.name
        }: ${token.$value};`;
      }

      const referenceList = getTokensReferencesList(
        token.original.$value,
        dictionary.tokens
      );
      tokenHasReferences = replaceValueToReference(
        tokenHasReferences,
        referenceList
      );
      return `${isTheme ? addIndentSpace(2) : addIndentSpace(0)}$${
        token.name
      }: ${tokenHasReferences};`;
    })
    .join("\n");
}
