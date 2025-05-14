import React, { useState, useEffect, useRef } from 'react';
import { VirtualJoystick } from '../joystick/Joystick';
import styles from './Scene.module.scss';

export const GameScene = ({
    displayWidth = 100,
    displayHeight = 100,
    mapWidth = 100,
    mapHeight = 100,
    objects = []
}) => {
    const [characterPosition, setCharacterPosition] = useState({
        x: mapWidth / 2,
        y: mapHeight / 2
    });

    const CHARACTER_SPEED = 0.2; // Фиксированная скорость
    const movementRef = useRef({ x: 0, y: 0 });
    const lastUpdateRef = useRef(performance.now());
    const prevPositionRef = useRef({ x: mapWidth / 2, y: mapHeight / 2 });

    const checkCollision = (x, y) => {
        const charWidth = 2;
        const charHeight = 2;

        const charLeft = x - charWidth / 2;
        const charRight = x + charWidth / 2;
        const charTop = y - charHeight / 2;
        const charBottom = y + charHeight / 2;

        for (const obj of objects) {
            const objLeft = obj.x - (obj.width || 5) / 2;
            const objRight = obj.x + (obj.width || 5) / 2;
            const objTop = obj.y - (obj.height || 5) / 2;
            const objBottom = obj.y + (obj.height || 5) / 2;

            if (charRight > objLeft &&
                charLeft < objRight &&
                charBottom > objTop &&
                charTop < objBottom) {
                return true;
            }
        }
        return false;
    };

    const getSafePosition = (newX, newY) => {
        const prevPos = prevPositionRef.current;
        let safeX = newX;
        let safeY = newY;

        if (newX !== prevPos.x && checkCollision(newX, prevPos.y)) {
            safeX = prevPos.x;
        }

        if (newY !== prevPos.y && checkCollision(safeX, newY)) {
            safeY = prevPos.y;
        }

        if (newX !== prevPos.x && newY !== prevPos.y && checkCollision(safeX, safeY)) {
            if (!checkCollision(newX, prevPos.y)) {
                return { x: newX, y: prevPos.y };
            }
            if (!checkCollision(prevPos.x, newY)) {
                return { x: prevPos.x, y: newY };
            }
            return prevPos;
        }

        safeX = Math.max(1, Math.min(mapWidth - 1, safeX));
        safeY = Math.max(1, Math.min(mapHeight - 1, safeY));

        return { x: safeX, y: safeY };
    };

    const handleJoystickMove = (direction) => {
        const { x, y } = direction;
        const length = Math.sqrt(x * x + y * y);

        // Нормализуем вектор направления
        movementRef.current = {
            x: length > 0 ? x / length : 0,
            y: length > 0 ? y / length : 0
        };
    };

    useEffect(() => {
        let animationFrameId;
        const updatePosition = (timestamp) => {
            const deltaTime = timestamp - lastUpdateRef.current;
            lastUpdateRef.current = timestamp;

            const { x, y } = movementRef.current;
            if (x !== 0 || y !== 0) {
                setCharacterPosition(prev => {
                    // Учитываем время между кадрами для плавного движения
                    const distance = CHARACTER_SPEED * (deltaTime / 16.67); // Нормализуем к 60 FPS
                    const newX = prev.x + x * distance;
                    const newY = prev.y + y * distance;
                    const safePos = getSafePosition(newX, newY);
                    prevPositionRef.current = safePos;
                    return safePos;
                });
            }
            animationFrameId = requestAnimationFrame(updatePosition);
        };
        animationFrameId = requestAnimationFrame(updatePosition);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const scale = Math.min(
        displayWidth / mapWidth,
        displayHeight / mapHeight
    );

    return (
        <div className={styles["game-container"]}>
            <div
                className={styles["game-field"]}
                style={{
                    width: `${displayWidth}%`,
                    height: `${displayHeight}%`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute',
                    width: `${mapWidth}%`,
                    height: `${mapHeight}%`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left'
                }}>
                    {objects.map(obj => (
                        <div
                            key={obj.id}
                            className={styles[`map-object-${obj.type}`]}
                            style={{
                                position: 'absolute',
                                left: `${obj.x}%`,
                                top: `${obj.y}%`,
                                width: `${obj.width || 5}%`,
                                height: `${obj.height || 5}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    ))}

                    <div
                        className={styles["character"]}
                        style={{
                            position: 'absolute',
                            left: `${characterPosition.x}%`,
                            top: `${characterPosition.y}%`,
                            width: '2%',
                            height: '2%',
                            transform: `
                                translate(-50%, -50%)
                                rotate(${movementRef.current.x !== 0 || movementRef.current.y !== 0
                                    ? Math.atan2(movementRef.current.y, movementRef.current.x) * (180 / Math.PI) + 90
                                    : 0}deg)
                            `
                        }}
                    >
                        <div className={styles["character-inner"]}></div>
                    </div>
                </div>
            </div>

            <VirtualJoystick
                onMove={handleJoystickMove}
                onStop={() => movementRef.current = { x: 0, y: 0 }}
            />
        </div>
    );
};