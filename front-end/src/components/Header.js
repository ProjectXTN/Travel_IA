import React from "react";
import { HeaderContainer, BannerImage } from "../style/styles";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <HeaderContainer>
      <Link to="/">
        <BannerImage src="/img/logo-v3-conv.ico" alt="Logo" />
      </Link>
    </HeaderContainer>
  );
};

export default Header;
