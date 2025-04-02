export const getLanguageFromPath = (pathname) => {
    if (pathname.includes("/fr")) return "FR";
    if (pathname.includes("/en")) return "EN";
    return "PT-BR";
  };
  