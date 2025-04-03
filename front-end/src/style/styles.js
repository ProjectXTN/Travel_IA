import styled from "styled-components";

//Header

export const HeaderContainer = styled.header`
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
`;


//Wrapper

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;

  @media (max-width: 768px) {
    height: 100%;
  }
`;

// Main

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-image: url("/img/img-travel-ia-banner.png");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  margin: 0 auto;
  text-align: center;

  h1 {
    font-size: 50px;
    color: #FFF;
    margin: 50px 0 20px 0;
    text-transform: uppercase;
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
    padding: 10px 20px;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 8px;
    display: inline-block;
  }


  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    h1 {
    font-size: 24px;
    margin: 50px 10px 10px 10px;
    padding: 10px 15px;
    color: #FFF;
  }
  }
`;


export const ContainerForm = styled.div`
  max-width: 600px;
  padding: 0 10px 25px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`
//Form

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    text-align: start;
    padding: 20px 20px 30px 20px;
    background: rgba(255, 255, 255, 0.3);
    box-shadow: none;
  }
`;

export const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

export const Label = styled.label`
  font-weight: bold;
  width: 120px;
`;

export const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid ${({ $error }) => ($error ? "red" : "#ccc")};
  border-radius: 4px;
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
  border-radius: 6px;
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
  width: 100%;
  margin: 10px 0px 15px 10px;
  display: flex;
  justify-content: start;
  gap: 10px ;

  @media (max-width: 768px) {
    justify-content: center;
    margin: 10px 0px 10px 0px;
  }
`

export const Button = styled.button`
  background-color: #2b7fff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #1f6fe0;
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(43, 127, 255, 0.2);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .loader {
    border: 2px solid white;
    border-top: 2px solid #2b7fff;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    animation: spin 1s linear infinite;
    background: transparent;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    padding: 10px 10px;
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
  width: 100%;
  height: auto;
  background-color: rgb(0, 96, 148);
  padding: 10px 0;
`;

export const FooterContent = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
`;

export const FooterText = styled.p`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  padding: 5px;
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

