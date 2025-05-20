import { GameScene } from "../../mechanics/scene/Scene"

export const GamePage = () => {
    const demoMap = {
        mapWidth: 100,
        mapHeight: 100,
        displayWidth: 50,
        displayHeight: 50,
        objects: [
            {
                id: 'forest1',
                type: 'forest',
                x: 50,
                y: 100,
                width: 60,
                height: 30,
                priority: 10
            },
            {
                id: 'plant1',
                type: 'plant',
                x: 30,
                y: 40,
                width: 8,
                height: 8,
                priority: 20
            },
            {
                id: 'wall1',
                type: 'wall',
                x: 20,
                y: 30,
                width: 40,
                height: 2,
                priority: 40
            },
            {
                id: 'dungeon1',
                type: 'dungeon',
                x: 100,
                y: 60,
                width: 30, //100
                height: 36, //160
                border: 3,
                priority: 70
            },
        ],
    };

    return <GameScene {...demoMap} />
}