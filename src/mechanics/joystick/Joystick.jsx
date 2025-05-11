import React, { useState, useRef, useEffect } from 'react';
import styles from './Joystick.module.scss';

export const VirtualJoystick = ({ onMove, onStop, size = 150, stickSize = 60 }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);
    const joystickRef = useRef(null);
    const stickRef = useRef(null);
    const touchIdRef = useRef(null);

    const handleStart = (clientX, clientY) => {
        if (!joystickRef.current || !stickRef.current) return;

        const joystickRect = joystickRef.current.getBoundingClientRect();
        const centerX = joystickRect.left + joystickRect.width / 2;
        const centerY = joystickRect.top + joystickRect.height / 2;

        const x = clientX - centerX;
        const y = clientY - centerY;

        const distance = Math.min(Math.sqrt(x * x + y * y), size / 2);
        const angle = Math.atan2(y, x);

        const boundedX = Math.cos(angle) * distance;
        const boundedY = Math.sin(angle) * distance;

        setPosition({ x: boundedX, y: boundedY });
        setIsActive(true);

        // Нормализованные значения направления (-1 до 1)
        const normalizedX = boundedX / (size / 2);
        const normalizedY = boundedY / (size / 2);
        onMove({ x: normalizedX, y: normalizedY });
    };

    const handleMove = (clientX, clientY) => {
        if (!isActive || !joystickRef.current) return;

        const joystickRect = joystickRef.current.getBoundingClientRect();
        const centerX = joystickRect.left + joystickRect.width / 2;
        const centerY = joystickRect.top + joystickRect.height / 2;

        const x = clientX - centerX;
        const y = clientY - centerY;

        const distance = Math.min(Math.sqrt(x * x + y * y), size / 2);
        const angle = Math.atan2(y, x);

        const boundedX = Math.cos(angle) * distance;
        const boundedY = Math.sin(angle) * distance;

        setPosition({ x: boundedX, y: boundedY });

        // Нормализованные значения направления (-1 до 1)
        const normalizedX = boundedX / (size / 2);
        const normalizedY = boundedY / (size / 2);
        onMove({ x: normalizedX, y: normalizedY });
    };

    const handleEnd = () => {
        setPosition({ x: 0, y: 0 });
        setIsActive(false);
        touchIdRef.current = null;
        onStop();
    };

    // Обработчики для мыши
    const onMouseDown = (e) => {
        handleStart(e.clientX, e.clientY);
    };

    const onMouseMove = (e) => {
        handleMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
        handleEnd();
    };

    // Обработчики для тач-устройств
    const onTouchStart = (e) => {
        if (touchIdRef.current !== null) return;
        const touch = e.touches[0];
        touchIdRef.current = touch.identifier;
        handleStart(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e) => {
        if (touchIdRef.current === null) return;
        const touch = Array.from(e.touches).find(
            (t) => t.identifier === touchIdRef.current
        );
        if (touch) {
            handleMove(touch.clientX, touch.clientY);
        }
    };

    const onTouchEnd = () => {
        handleEnd();
    };

    // eslint-disable-next-line
    useEffect(() => {
        // Добавляем глобальные обработчики для мыши и тача
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onTouchMove);
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
            className={styles['joystick-container']}
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}>
            <div
                ref={stickRef}
                className={styles[`joystick-stick ${isActive ? 'active' : ''}`]}
                style={{
                    width: `${stickSize}px`,
                    height: `${stickSize}px`,
                    transform: `translate(${position.x}px, ${position.y}px)`,
                }}
            />
        </div>
    );
};