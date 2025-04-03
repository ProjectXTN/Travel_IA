import React from "react";
import { CheckboxLabel } from "../style/styles";

export const interestEmojis = {
  "Férias": "🏖️",
  "Vacation": "🏖️",
  "Vacances": "🏖️",

  "Turismo": "🗺️",
  "Tourism": "🗺️",
  "Tourisme": "🗺️",

  "Culinária": "🍽️",
  "Cuisine": "🍽️",

  "Aventura": "⛰️",
  "Adventure": "⛰️",
  "Aventure": "⛰️",

  "Cultura": "🎭",
  "Culture": "🎭",

  "Praia": "🌴",
  "Beach": "🌴",
  "Plage": "🌴",

  "História": "🏛️",
  "History": "🏛️",
  "Histoire": "🏛️",

  "Parques": "🌳",
  "Parks": "🌳",
  "Parcs": "🌳"
};

const InterestCheckbox = ({ interest, checked, onChange }) => {
  return (
    <CheckboxLabel>
      <input
        type="checkbox"
        value={interest}
        checked={checked}
        onChange={onChange}
      />
      {interestEmojis[interest]} {interest}
    </CheckboxLabel>
  );
};

export default InterestCheckbox;
