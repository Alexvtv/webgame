import React, { useState, useEffect, useRef } from 'react';
import { VirtualJoystick } from '../joystick/Joystick.jsx';
import styles from './Scene.module.scss';

export const GameScene = () => {
    const [characterPosition, setCharacterPosition] = useState({ x: 50, y: 50 });
    const [characterSpeed] = useState(1);
    const [movement, setMovement] = useState({ x: 0, y: 0 });
    const movementRef = useRef(movement); // Реф для актуального состояния движения

    // Синхронизация состояния movement с рефом
    useEffect(() => {
        movementRef.current = movement;
    }, [movement]);

    const handleJoystickMove = (direction) => {
        setMovement({
            x: direction.x,
            y: direction.y
        });
    };

    const handleJoystickStop = () => {
        setMovement({ x: 0, y: 0 });
    };

    useEffect(() => {
        const gameLoop = setInterval(() => {
            // Используем movementRef.current вместо movement
            const currentMovement = movementRef.current;
            if (currentMovement.x !== 0 || currentMovement.y !== 0) {
                setCharacterPosition(prev => ({
                    x: Math.max(0, Math.min(100, prev.x + currentMovement.x * characterSpeed)),
                    y: Math.max(0, Math.min(100, prev.y + currentMovement.y * characterSpeed))
                }));
            }
        }, 70);

        return () => clearInterval(gameLoop);
    }, [characterSpeed]); // Зависимость только от characterSpeed

    return (
        <div className={styles["game-container"]}>
            <div className={styles["game-field"]}>
                <div
                    className={styles["character"]}
                    style={{
                        left: `${characterPosition.x}%`,
                        top: `${characterPosition.y}%`,
                        transform: `rotate(${movement.x !== 0 || movement.y !== 0
                            ? Math.atan2(movement.y, movement.x) * (180 / Math.PI) + 90
                            : 0}deg)`
                    }}>
                    <div className={styles["character-inner"]}></div>
                </div>
            </div>
            <VirtualJoystick
                onMove={handleJoystickMove}
                onStop={handleJoystickStop}
            />
        </div>
    );
};