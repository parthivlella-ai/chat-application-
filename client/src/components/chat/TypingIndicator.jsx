import React from 'react';

const TypingIndicator = ({ typingUsers = {} }) => {
  const userNames = Object.values(typingUsers);
  if (userNames.length === 0) return null;

  const text =
    userNames.length === 1
      ? `${userNames[0]} is typing`
      : userNames.length === 2
      ? `${userNames[0]} and ${userNames[1]} are typing`
      : 'Several people are typing';

  return (
    <div className="typing-pill">
      <span>{text}</span>
      <div className="typing-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};

export default TypingIndicator;
