import { useEffect, useState } from "react";

const TypingAnim = () => {
  const words = [
    "Chat with Your AI Assistant",
    "Boost Your Productivity",
    "Get Instant Answers",
    "Experience the Future",
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const typingDelay = isDeleting ? 50 : 100;
    const pauseDelay = 2000;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (displayedText.length < currentWord.length) {
            setDisplayedText(currentWord.substring(0, displayedText.length + 1));
          } else {
            // Finished typing, pause then start deleting
            setTimeout(() => setIsDeleting(true), pauseDelay);
          }
        } else {
          // Deleting
          if (displayedText.length > 0) {
            setDisplayedText(displayedText.substring(0, displayedText.length - 1));
          } else {
            // Finished deleting, move to next word
            setIsDeleting(false);
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWordIndex]);

  return (
    <span
      style={{
        fontSize: "2rem",
        fontWeight: 700,
        color: "white",
        fontFamily: "monospace",
      }}
    >
      {displayedText}
      <span
        style={{
          display: "inline-block",
          width: "3px",
          height: "1.2em",
          backgroundColor: "#64f3d5",
          marginLeft: "4px",
          animation: "blink 1s infinite",
          verticalAlign: "text-bottom",
        }}
      />
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </span>
  );
};

export default TypingAnim;