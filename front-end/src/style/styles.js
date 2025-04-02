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
  min-height: 100vh;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  //min-height: calc(100vh - 200px); /* ajuste dependendo da altura do header/footer */
  height: 100vh;
`;

// Main

export const Container = styled.div`
  width: 100%;
  background-image: url("/img/img-travel-ia-banner.png");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  margin: 0 auto;
  text-align: center;

  h2 {
    font-size: 50px;
    color: #FFF;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 100vh;

    h2 {
    font-size: 30px;
    color: #FFF;
    margin-bottom: 18px;
  }
  }
`;


export const ContainerForm = styled.div`
  max-width: 600px;
  padding: 0 25px;

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
  border: 2px solid ${({ error }) => (error ? "rgb(255, 0, 0)" : "#ccc")};
  border-radius: 4px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: ${({ error }) => (error ? "rgb(255, 0, 0)" : "#2b7fff")};
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

  input {
    accent-color: #2b7fff;
  }
`;


export const ContainerButton = styled.div`
  width: 100%;
  margin: 10px;
  display: flex;
  justify-content: center;
  gap: 10px ;

  @media (max-width: 768px) {
    margin: 0px;
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
  text-align: left;
  white-space: pre-line;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 8px;
`;

//Footer

export const FooterContainer = styled.div`
  width: 100%;
  height: 50px;
  background-color: #000000;
`

export const FooterContent = styled.div`
  text-align: center;
`

export const FooterText = styled.p`
  color: #fff;
  font-size: 14px;
  margin: 0;
  padding: 10px;
`;

