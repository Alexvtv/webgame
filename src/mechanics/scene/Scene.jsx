import React, { useState, useEffect, useRef } from 'react';
import { VirtualJoystick } from '../joystick/Joystick';
import styles from './Scene.module.scss';

const generateCompositeObjects = (objects) => {
    // Оставим без изменений, так как работает с абсолютными координатами
    return objects.flatMap(obj => {
        if (obj.type === 'dungeon') {
            const border = obj.border || 3;
            return [
                {
                    id: `${obj.id}_top`,
                    x: obj.x,
                    y: obj.y - (obj.height / 2) + border / 2,
                    type: 'wall',
                    height: border,
                    width: obj.width,
                    priority: obj.priority
                },
                {
                    id: `${obj.id}_left`,
                    y: obj.y,
                    type: 'wall',
                    x: obj.x - obj.width / 2 + border / 2,
                    width: border,
                    height: obj.height,
                    priority: obj.priority
                },
                {
                    id: `${obj.id}_right`,
                    y: obj.y,
                    type: 'wall',
                    x: obj.x + obj.width / 2 - border / 2,
                    width: border,
                    height: obj.height,
                    priority: obj.priority
                }
            ];
        }
        return obj;
    });
};

export const GameScene = ({
    mapWidth = 1000,
    mapHeight = 1000,
    objects = []
}) => {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const characterRef = useRef(null);

    const [characterPosition, setCharacterPosition] = useState({
        x: mapWidth / 2,
        y: mapHeight / 2
    });

    const CHARACTER_SPEED = 2; // Пикселей за кадр
    const movementRef = useRef({ x: 0, y: 0 });
    const prevPositionRef = useRef({ ...characterPosition });

    const processedObjects = generateCompositeObjects(objects)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Ресайз наблюдатель для контейнера
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(([entry]) => {
            const newSize = {
                width: entry.contentRect.width,
                height: entry.contentRect.height
            };
            setContainerSize(newSize);
            updateScrollPosition(characterPosition, newSize);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Обновление позиции прокрутки при движении персонажа
    const updateScrollPosition = (pos, containerSize) => {
        if (!containerRef.current || !characterRef.current) return;

        const characterRect = characterRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const targetX = pos.x - containerSize.width / 2;
        const targetY = pos.y - containerSize.height / 2;

        const maxX = mapWidth - containerSize.width;
        const maxY = mapHeight - containerSize.height;

        setScrollOffset({
            x: Math.max(0, Math.min(maxX, targetX)),
            y: Math.max(0, Math.min(maxY, targetY))
        });
    };

    // Проверка коллизий (адаптирована под пиксели)
    const checkCollision = (x, y) => {
        const charWidth = 20;
        const charHeight = 20;

        const charRect = {
            left: x - charWidth / 2,
            right: x + charWidth / 2,
            top: y - charHeight / 2,
            bottom: y + charHeight / 2
        };

        return processedObjects.some(obj => {
            const objRect = {
                left: obj.x - (obj.width || 0) / 2,
                right: obj.x + (obj.width || 0) / 2,
                top: obj.y - (obj.height || 0) / 2,
                bottom: obj.y + (obj.height || 0) / 2
            };

            return (
                charRect.right > objRect.left &&
                charRect.left < objRect.right &&
                charRect.bottom > objRect.top &&
                charRect.top < objRect.bottom
            );
        });
    };

    // Логика движения
    useEffect(() => {
        let animationFrameId;

        const updatePosition = () => {
            setCharacterPosition(prev => {
                const newX = prev.x + movementRef.current.x * CHARACTER_SPEED;
                const newY = prev.y + movementRef.current.y * CHARACTER_SPEED;

                // Проверка границ карты
                const boundedX = Math.max(10, Math.min(mapWidth - 10, newX));
                const boundedY = Math.max(10, Math.min(mapHeight - 10, newY));

                // Проверка коллизий
                if (!checkCollision(boundedX, boundedY)) {
                    prevPositionRef.current = { x: boundedX, y: boundedY };
                    updateScrollPosition({ x: boundedX, y: boundedY }, containerSize);
                    return { x: boundedX, y: boundedY };
                }
                return prev;
            });

            animationFrameId = requestAnimationFrame(updatePosition);
        };

        animationFrameId = requestAnimationFrame(updatePosition);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className={styles["game-container"]}>
            <div
                ref={containerRef}
                className={styles["game-field"]}
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    position: 'relative'
                }}
            >
                <div
                    style={{
                        width: `${mapWidth}px`,
                        height: `${mapHeight}px`,
                        position: 'relative',
                        // transform: `translate(-${scrollOffset.x}px, -${scrollOffset.y}px)`,
                        // transition: 'transform 0.1s linear'
                    }}
                >
                    {processedObjects.map(obj => (
                        <div
                            key={obj.id}
                            className={styles[`map-object-${obj.type}`]}
                            style={{
                                position: 'absolute',
                                left: `${obj.x - (obj.width || 0) / 2}px`,
                                top: `${obj.y - (obj.height || 0) / 2}px`,
                                width: `${obj.width || 5}px`,
                                height: `${obj.height || 5}px`,
                                border: obj.type === 'dungeon' ? `${obj.border || 3}px solid #333` : 'none'
                            }}
                        />
                    ))}

                    <div
                        ref={characterRef}
                        className={styles["character"]}
                        style={{
                            position: 'absolute',
                            left: `${characterPosition.x}px`,
                            top: `${characterPosition.y}px`,
                            width: '20px',
                            height: '20px',
                            transform: `
                                translate(-50%, -50%)
                                rotate(${movementRef.current.x !== 0 || movementRef.current.y !== 0
                                    ? Math.atan2(movementRef.current.y, movementRef.current.x) * (180 / Math.PI) + 90
                                    : 0}deg)
                            `,
                            transition: 'transform 0.1s linear'
                        }}
                    >
                        <div className={styles["character-inner"]}></div>
                    </div>
                </div>
            </div>

            <VirtualJoystick
                onMove={(dir) => movementRef.current = dir}
                onStop={() => movementRef.current = { x: 0, y: 0 }}
            />
        </div>
    );
};