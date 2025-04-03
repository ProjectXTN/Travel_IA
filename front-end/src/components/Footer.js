import react from "react";
import {
    FaLinkedin,
    FaUserTie
} from "react-icons/fa";
import {
    FooterContainer,
    FooterContent,
    FooterText,
    SocialIcons
} from "../style/styles"

const Footer = () => {
    return (
        <FooterContainer>
            <FooterContent>
                <FooterText>Pedro MEIRELES © 2025</FooterText>
                <SocialIcons>
                    <a href="https://www.linkedin.com/in/pedro-henrique-braz-meireles-68609b204/" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin />
                    </a>
                    <a href="https://plateforme.freelance.com/freelance/Pedro-80201e0a-b4f1-40c3-ad2a-7828044205f6" target="_blank" rel="noopener noreferrer">
                        <FaUserTie />
                    </a>
                </SocialIcons>
            </FooterContent>
        </FooterContainer>
    );
};

export default Footer;