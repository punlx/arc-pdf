import { useState, useEffect } from 'react';

export function useTypingEffect(fullText: string, typingSpeed = 100, resetDelay = 7000) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (displayedText.length < fullText.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, typingSpeed);

      return () => clearTimeout(timeoutId);
    }

    if (displayedText.length === fullText.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText('');
      }, resetDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [displayedText, fullText, typingSpeed, resetDelay]);

  return displayedText;
}
