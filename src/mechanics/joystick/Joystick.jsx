import React, { useState, useRef, useEffect } from 'react';
import styles from './Joystick.module.scss';
import classNames from 'classnames';

export const VirtualJoystick = ({ onMove, onStop, size = 150, stickSize = 60 }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);
    const joystickRef = useRef(null);
    const touchIdRef = useRef(null);

    const getPosition = (clientX, clientY) => {
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let x = clientX - centerX;
        let y = clientY - centerY;

        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = size / 2;

        if (distance > maxDistance) {
            x = x * maxDistance / distance;
            y = y * maxDistance / distance;
        }

        return { x, y };
    };

    const handleStart = (clientX, clientY) => {
        const { x, y } = getPosition(clientX, clientY);
        setPosition({ x, y });
        setIsActive(true);
        onMove({
            x: x / (size / 2),
            y: y / (size / 2)
        });
    };

    const handleMove = (clientX, clientY) => {
        if (!isActive) return;
        const { x, y } = getPosition(clientX, clientY);
        setPosition({ x, y });
        onMove({
            x: x / (size / 2),
            y: y / (size / 2)
        });
    };

    const handleEnd = () => {
        setPosition({ x: 0, y: 0 });
        setIsActive(false);
        touchIdRef.current = null;
        onStop();
    };

    // Обработчики событий
    const onMouseDown = (e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    };

    const onMouseMove = (e) => {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
        handleEnd();
    };

    const onTouchStart = (e) => {
        if (touchIdRef.current !== null) return;
        const touch = e.touches[0];
        touchIdRef.current = touch.identifier;
        handleStart(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e) => {
        if (touchIdRef.current === null) return;
        const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
        if (touch) handleMove(touch.clientX, touch.clientY);
    };

    const onTouchEnd = () => {
        handleEnd();
    };

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isActive]);

    return (
        <div
            ref={joystickRef}
            className={styles["joystick-container"]}
            style={{ width: size, height: size }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}>
            <div
                className={classNames(styles['joystick-stick'], isActive ? styles.active : '')}
                style={{
                    width: stickSize,
                    height: stickSize,
                    transform: `translate(${position.x}px, ${position.y}px)`
                }}
            />
        </div>
    );
};