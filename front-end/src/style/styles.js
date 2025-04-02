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
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

export const Select = styled.select`
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;


export const ContainerButton = styled.div`
  width: 100%;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 10px ;

`

export const Button = styled.button`
  padding: 10px;
  background: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background: #ccc;
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

