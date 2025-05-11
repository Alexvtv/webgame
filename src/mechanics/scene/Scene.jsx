import React, { useState, useEffect } from 'react';
import { VirtualJoystick } from '../joystick/Joystick.jsx';
import styles from './Scene.module.scss';

export const GameScene = () => {
    const [characterPosition, setCharacterPosition] = useState({ x: 50, y: 50 });
    const [characterSpeed] = useState(5);
    const [movement, setMovement] = useState({ x: 0, y: 0 });

    // Обработчик движения джойстика
    const handleJoystickMove = (direction) => {
        setMovement({
            x: direction.x,
            y: direction.y
        });
    };

    // Обработчик остановки джойстика
    const handleJoystickStop = () => {
        setMovement({ x: 0, y: 0 });
    };

    // Игровой цикл для перемещения персонажа
    useEffect(() => {
        const gameLoop = setInterval(() => {
            if (movement.x !== 0 || movement.y !== 0) {
                setCharacterPosition(prev => ({
                    x: Math.max(0, Math.min(100, prev.x + movement.x * characterSpeed)),
                    y: Math.max(0, Math.min(100, prev.y + movement.y * characterSpeed))
                }));
            }
        }, 16); // ~60 FPS

        return () => clearInterval(gameLoop);
    }, [movement, characterSpeed]);

    return (
        <div className={styles["game-container"]}>
            <div className={styles["game-field"]}>
                {/* Персонаж */}
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

            {/* Виртуальный джойстик */}
            <VirtualJoystick
                onMove={handleJoystickMove}
                onStop={handleJoystickStop}
            />
        </div>
    );
};