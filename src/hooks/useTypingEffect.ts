// src/hooks/useTypingEffect.ts

import { useState, useEffect } from 'react';

/**
 * A custom hook to create a typing animation effect for a given text.
 * @param fullText The text to be animated.
 * @param typingSpeed The speed of typing in milliseconds.
 * @param resetDelay The delay before the text resets after completion.
 * @returns The currently displayed text.
 */
export function useTypingEffect(fullText: string, typingSpeed = 100, resetDelay = 7000) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // 1. Typing logic: ถ้ายังพิมพ์ไม่ครบ ให้เพิ่มตัวอักษรทีละตัว
    if (displayedText.length < fullText.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, typingSpeed);

      return () => clearTimeout(timeoutId);
    }

    // 2. Reset logic: ถ้าพิมพ์ครบแล้ว ให้รอสักครู่แล้วค่อยล้างข้อความเพื่อเริ่มใหม่
    if (displayedText.length === fullText.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText('');
      }, resetDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [displayedText, fullText, typingSpeed, resetDelay]);

  return displayedText;
}
