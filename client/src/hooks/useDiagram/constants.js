// src/hooks/useDiagram/constants.js
export const HEADER_HEIGHT = 60;
export const TEXT_BLOCK_HEIGHT = 25;
export const PADDING = 4;

export const NODE_CONFIG = {
    default: {
        label: 'Блок',
        style: { width: 150, height: 80, background: '#fff' }
    },
    class: {
        label: 'Блок',
        style: { width: 200, height: 250, background: '#fff' },
        data: { splitY: HEADER_HEIGHT + (250 - HEADER_HEIGHT) / 2 }
    },
    circle: {
        label: 'Блок',
        style: { width: 100, height: 100, background: 'transparent' }
    },
    textblock: {
        label: 'Текст',
        style: { width: 150, height: 40, background: 'transparent' },
        isNew: true
    },
    actor: {
        label: 'Актер',
        style: { width: 80, height: 120, background: 'transparent' }
    },
    database: {
        label: 'БД',
        style: { width: 100, height: 100, background: 'transparent' }
    },
    diamond: {
        label: 'Условие',
        style: { width: 120, height: 120, background: 'transparent' }
    },
    group: {
        label: 'Группа',
        style: { width: 400, height: 300, background: 'rgba(240, 240, 240, 0.5)', zIndex: -10 },
        data: { nodeStyle: { background: 'rgba(240, 240, 240, 0.5)', borderColor: '#aaa' } }
    },
};