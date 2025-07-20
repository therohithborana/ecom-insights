"use client";
import { useState, useEffect, useRef } from 'react';

export function StreamingText({ text }: { text: string }) {
    const [displayedText, setDisplayedText] = useState('');
    const requestRef = useRef<number>();

    useEffect(() => {
        setDisplayedText(''); 
        if (text) {
            let i = 0;
            const animate = () => {
                if (i < text.length) {
                    setDisplayedText(text.slice(0, i + 1));
                    i++;
                    requestRef.current = requestAnimationFrame(animate);
                }
            };
            requestRef.current = requestAnimationFrame(animate);
            return () => {
                if (requestRef.current) {
                    cancelAnimationFrame(requestRef.current);
                }
            }
        }
    }, [text]);

    return <p className="whitespace-pre-wrap">{displayedText}</p>;
}
