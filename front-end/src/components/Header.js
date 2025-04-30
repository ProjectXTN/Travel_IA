import React from "react";
import { HeaderContainer, BannerImage, Title, ContainerButton, Button } from "../style/styles";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ loading, title }) => {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <Link to="/">
        <BannerImage src="/img/logo-v4-conv.png" alt="Logo" />
      </Link>
      <Title>
        <h1>{title}</h1>
      </Title>
      <ContainerButton>
        <Button
          onClick={() => navigate("/pt-br")}
          disabled={loading}
          $variant="language"
          title="Português"
        >
          <img src="/img/flags/br.svg" alt="🇧🇷" width="24" height="24" />
        </Button>

        <Button
          onClick={() => navigate("/fr")}
          disabled={loading}
          $variant="language"
          title="Français"
        >
          <img src="/img/flags/fr.svg" alt="FR" width="24" height="24" />
        </Button>

        <Button
          onClick={() => navigate("/en")}
          disabled={loading}
          $variant="language"
          title="English"
        >
          <img src="/img/flags/gb.svg" alt="EN" width="24" height="24" />
        </Button>

      </ContainerButton>
    </HeaderContainer>
  );
};

export default Header;
