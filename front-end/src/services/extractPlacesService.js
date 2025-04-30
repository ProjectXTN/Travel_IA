// services/extractPlacesService.js

export const extractPlacesService = (text) => {
    const regex = /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=([^"\n)]+)/g;
    const places = new Set();
    let match;
  
    while ((match = regex.exec(text)) !== null) {
      const decoded = decodeURIComponent(match[1].replace(/\+/g, " "));
      places.add(decoded);
    }
  
    return [...places];
  };
  