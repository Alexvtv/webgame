import { GameScene } from "../../mechanics/scene/Scene"

export const GamePage = () => {
    const demoMap = {
        mapWidth: 100,
        mapHeight: 100,
        displayWidth: 50,
        displayHeight: 50,
        objects: [
            { id: 'wall1', type: 'wall', x: 20, y: 30, width: 40, height: 2 },
            { id: 'npc1', type: 'npc', x: 40, y: 80, width: 5, height: 5 },
        ],
    };

    return <GameScene {...demoMap} />
}