import React, { useState, useRef, useEffect } from 'react';
import styles from './Joystick.module.scss';
import classNames from 'classnames';

export const VirtualJoystick = ({ onMove, onStop, size = 150, stickSize = 60 }) => {
    const joystickRef = useRef(null);
    const stickRef = useRef(null);
    const touchIdRef = useRef(null);
    const animationFrameRef = useRef(null);
    const isActiveRef = useRef(false);
    const positionRef = useRef({ x: 0, y: 0 });

    const updatePosition = (x, y) => {
        const maxDistance = size / 2;
        const distance = Math.sqrt(x * x + y * y);
        
        // Нормализация позиции
        if (distance > maxDistance) {
            x = x * maxDistance / distance;
            y = y * maxDistance / distance;
        }

        positionRef.current = { x, y };
        
        // Плавное перемещение стика
        if (stickRef.current) {
            stickRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }

        // Передаем нормализованные значения
        if (onMove) {
            onMove({
                x: x / maxDistance,
                y: y / maxDistance
            });
        }
    };

    const handleStart = (clientX, clientY) => {
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const x = clientX - centerX;
        const y = clientY - centerY;
        
        isActiveRef.current = true;
        updatePosition(x, y);
    };

    const handleMove = (clientX, clientY) => {
        if (!isActiveRef.current) return;
        
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const x = clientX - centerX;
        const y = clientY - centerY;
        
        updatePosition(x, y);
    };

    const handleEnd = () => {
        isActiveRef.current = false;
        positionRef.current = { x: 0, y: 0 };
        
        // Плавный возврат стика в центр
        const animateReturn = () => {
            const { x, y } = positionRef.current;
            const speed = 0.2;
            
            if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) {
                positionRef.current = { x: 0, y: 0 };
                if (stickRef.current) {
                    stickRef.current.style.transform = 'translate(0, 0)';
                }
                if (onStop) onStop();
                return;
            }
            
            positionRef.current = {
                x: x * (1 - speed),
                y: y * (1 - speed)
            };
            
            if (stickRef.current) {
                stickRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
            }
            
            animationFrameRef.current = requestAnimationFrame(animateReturn);
        };
        
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(animateReturn);
    };

    // Обработчики событий
    const onMouseDown = (e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    };

    const onTouchStart = (e) => {
        if (touchIdRef.current !== null) return;
        e.preventDefault();
        const touch = e.touches[0];
        touchIdRef.current = touch.identifier;
        handleStart(touch.clientX, touch.clientY);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isActiveRef.current) return;
            e.preventDefault();
            handleMove(e.clientX, e.clientY);
        };

        const handleMouseUp = () => {
            if (!isActiveRef.current) return;
            handleEnd();
        };

        const handleTouchMove = (e) => {
            if (!isActiveRef.current || touchIdRef.current === null) return;
            e.preventDefault();
            const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
            if (touch) handleMove(touch.clientX, touch.clientY);
        };

        const handleTouchEnd = (e) => {
            if (touchIdRef.current === null) return;
            const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
            if (touch) {
                e.preventDefault();
                handleEnd();
                touchIdRef.current = null;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <div
            ref={joystickRef}
            className={styles["joystick-container"]}
            style={{ width: size, height: size }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            <div
                ref={stickRef}
                className={classNames(
                    styles['joystick-stick'],
                    isActiveRef.current ? styles.active : ''
                )}
                style={{
                    width: stickSize,
                    height: stickSize,
                    transition: isActiveRef.current ? 'none' : 'transform 0.2s ease-out'
                }}
            />
        </div>
    );
};