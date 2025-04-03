import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "Segoe UI", "Apple Color Emoji", "Noto Color Emoji", "Helvetica", "Arial", sans-serif;
    background-color: #ffffff;
    color: #333;
    line-height: 1.5;
  }
`;

export default GlobalStyle;
