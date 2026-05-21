// src/types/nodeTypes.js
import {
    DefaultBlock, CircleBlock, CloudBlock, TextBlock,
    ActorBlock, DatabaseBlock, DiamondBlock, ClassBlock, GroupBlock
} from '../components/CustomNodes';

export const nodeTypes = {
    default: DefaultBlock,
    circle: CircleBlock,
    cloud: CloudBlock,
    textblock: TextBlock,
    actor: ActorBlock,
    database: DatabaseBlock,
    diamond: DiamondBlock,
    class: ClassBlock,
    group: GroupBlock,
};