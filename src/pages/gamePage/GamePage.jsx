import { GameScene } from "../../mechanics/scene/Scene"

export const GamePage = () => {
    const demoMap = {
        mapWidth: 1000,
        mapHeight: 1000,
        objects: [
            {
                id: 'forest1',
                type: 'forest',
                x: 150,
                y: 300,
                width: 300,
                height: 130,
                priority: 10
            },
            {
                id: 'plant1',
                type: 'plant',
                x: 30,
                y: 40,
                width: 40,
                height: 40,
                priority: 20
            },
            {
                id: 'wall1',
                type: 'wall',
                x: 160,
                y: 130,
                width: 180,
                height: 10,
                priority: 40
            },
            {
                id: 'dungeon1',
                type: 'dungeon',
                x: 500,
                y: 100,
                width: 150, //100
                height: 160, //160
                border: 10,
                priority: 70
            },
        ],
    };

    return <GameScene {...demoMap} />
}