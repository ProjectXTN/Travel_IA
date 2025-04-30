import styled from "styled-components";

//Header

export const HeaderContainer = styled.header`
  width: 100%;
  background: linear-gradient(90deg, #283e51 0%, #485563 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  flex-wrap: wrap;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;


export const BannerImage = styled.img`
  width: 80px;
  height: 80px;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;

  &:hover {
    transform: scale(1.08);
    filter: brightness(1.2);
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;



//Wrapper

export const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(90deg, #283e51 0%, #485563 100%);
  display: flex;
  flex-direction: column;
`;

export const ContentWrapper = styled.div`
  width: 100%;
  height: 100vh;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
  }
`;

export const ContainerGeneral = styled.div`
  min-height: 100vh;
  background-image: url("/img/img-travel-ia-banner.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-position: center;
  }
`

// Main

export const Container = styled.div`
  width: 100%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  margin: 0 auto;
  text-align: center;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    min-height: unset;
  }
`;

export const Title = styled.div`
  flex: 1;
  text-align: center;

  h1 {
    font-size: 1.8rem;
    font-family: 'Poppins', sans-serif;
    color: white;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
    margin: 0;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.4rem;
    }
  }
`;


//Form
export const ContainerForm = styled.div`
  max-width: 450px;
  padding: 50px 25px 25px;

  @media (max-width: 768px) {
    padding: 20px 20px;
  }
`
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: #fff;
  border-radius: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    text-align: start;
    background: rgba(255, 255, 255, 0.4);
  }
`;

export const FormRow = styled.div`
  display: flex;
  align-items: start;
  flex-direction: ${({ $variant }) =>
    $variant === "secondary" ? "column" : "row"};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch; 
  }
`;

export const Label = styled.label`
  font-weight: bold;
  min-width: 120px;
  margin-right: 10px;
  margin-bottom: 10px;
  color: #000000;
  word-spacing: normal;

  @media (max-width: 768px) {
    min-width: auto;
    white-space: normal;
    font-size: 14px;
  }
`;


export const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid ${({ $error }) => ($error ? "red" : "#ccc")};
  border-radius: 10px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: ${({ $error }) => ($error ? "red" : "#2b7fff")};
  }

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const InputWrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const ErrorMessage = styled.div`
  color: #fff;
  font-size: 14px;
  background-color: rgb(255, 0, 0);
  padding: 6px 12px;
  border-radius: 4px;
`;

export const Select = styled.select`
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  min-height: 120px;
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f2f2f2;
  padding: 6px 5px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  flex: 1 1 48%;
  box-sizing: border-box;
  transition: all 0.2 ease-in-out;

  &:hover {
    background-color: #e0f0ff;
    box-shadow: 0 0 5px rgba(43, 127, 255, 0.3);
    transform: scale(1.01);
  }

  input {
    accent-color: #2b7fff;
  }
`;


export const ContainerButton = styled.div`
  display: flex;
  gap: 12px;

  justify-content: ${({ $variant }) =>
    $variant === "secondary" ? "center" : "flex-start"};

  margin-bottom: ${({ $variant }) =>
    $variant === "secondary" ? "30px" : "0"};

  @media (max-width: 768px) {
    /* flex-direction: column; */
    align-items: center;
  }
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  padding: ${({ $variant }) =>
    $variant === "language" ? "8px" : "12px 24px"};
  font-size: ${({ $variant }) =>
    $variant === "language" ? "14px" : "16px"};
  background-color: ${({ $variant }) =>
    $variant === "language" ? "transparent" : "#2b7fff"};
  border: ${({ $variant }) =>
    $variant === "language"
      ? "none"
      : "none"};
  color: ${({ $variant }) =>
    $variant === "language" ? "white" : "white"};

  transition: all 0.3s ease;

  img {
    width: 24px;
    height: 24px;
    border-radius: 3px;
  }

  &:hover:not(:disabled) {
    background-color: ${({ $variant }) =>
    $variant === "language"
      ? "rgba(255, 255, 255, 0.15)"
      : "#1f6fe0"};
    transform: ${({ $variant }) =>
    $variant === "language" ? "none" : "scale(1.03)"};
    box-shadow: ${({ $variant }) =>
    $variant === "language"
      ? "none"
      : "0 4px 12px rgba(43, 127, 255, 0.3)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loader {
    border: 2px solid white;
    border-top: 2px solid #2b7fff;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .airplane-animation {
  position: fixed;
  top: 40%;
  left: -100px;
  font-size: 40px;
  z-index: 999;
  animation: flyAcross 2.5s ease-in-out forwards;
  pointer-events: none;
  opacity: 0;
}

@keyframes flyAcross {
  0% {
    transform: translate(0, -50%) rotate(-10deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: translate(50vw, -50%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(120vw, -30%) rotate(10deg);
    opacity: 0;
  }
}

`;



export const PlanContainer = styled.div`
  background-color: #fff; 
  color: #000;            
  text-align: left;
  white-space: pre-line;
  margin: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  background: #fefefe;
  border-radius: 12px;

  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 16px;
  color: #333;
  line-height: 1.6;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  a {
    color: #007bff;
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s;

    &:hover {
      color: #0056b3;
      text-decoration: underline;
    }
  }

  strong {
    font-weight: bold;
    color: #111;
    text-shadow: 0 1px 1px rgba(0,0,0,0.1);
  }

  br {
    margin-bottom: 8px;
  }

  animation: fadeIn 0.5s ease-in-out;

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

`;

//Footer

export const FooterContainer = styled.div`
  //position: fixed;
  //bottom: 0;
  width: 100%;
  height: auto;
  background-color: rgb(0, 96, 148);
  //padding: 10px 0;
`;

export const FooterContent = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
`;

export const FooterText = styled.div`
  text-align: center;

  p {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    padding: 5px;
  }
  @media (max-width: 768px) {
    p {
      font-size: 14px;
      margin: 0;
      padding: 0px;
    }
  }
`;

export const SocialIcons = styled.div`
  margin-top: 5px;

  a {
    color: #fff;
    margin: 0 8px;
    font-size: 20px;
    transition: color 0.3s;

    &:hover {
      color: #0077b5;
    }
  }
`;

