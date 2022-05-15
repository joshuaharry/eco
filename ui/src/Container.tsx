import React from "react";
import Card from "./Card";

const style = {
  width: 400,
};

export interface Item {
  id: number;
  text: string;
}

export interface ContainerState {
  cards: Item[];
}

export const Container: React.FC = () => {
  const [cards, setCards] = React.useState([
    {
      id: 0,
      text: "Write a cool JS library",
    },
    {
      id: 1,
      text: "Make it generic enough",
    },
    {
      id: 2,
      text: "Write README",
    },
    {
      id: 3,
      text: "Create some examples",
    },
    {
      id: 4,
      text: "Spam in Twitter and IRC to promote it (note that this element is taller than the others)",
    },
    {
      id: 5,
      text: "???",
    },
    {
      id: 6,
      text: "PROFIT",
    },
  ]);

  const moveCard = React.useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setCards((prevCards: Item[]) => {
        return prevCards.map((el, index) => {
          if (index === dragIndex)
            return {
              id: prevCards[hoverIndex].id,
              text: prevCards[hoverIndex].text,
            };
          if (index === hoverIndex)
            return {
              id: prevCards[dragIndex].id,
              text: prevCards[dragIndex].text,
            };
          return el;
        });
      });
    },
    []
  );

  const renderCard = React.useCallback(
    (card: { id: number; text: string }, index: number) => {
      return (
        <Card
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
        />
      );
    },
    [moveCard]
  );

  return (
    <>
      <div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
    </>
  );
};

export default Container;
