import { genericPorts, NodePort, rectanglePorts, WorkspaceNode } from "../../models";

export function extractColorAndOpacity(rgba: string): {
    fillColor: string;
    fillOpacity: number;
    } {
    const match = rgba.match(
        /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)/,
    );

    if (!match) {
        return {
        fillColor: '#000000',
        fillOpacity: 1,
        };
    }

    const [, r, g, b, a] = match;

    const fillColor =
        '#' +
        [r, g, b]
        .map((v) => Number(v).toString(16).padStart(2, '0'))
        .join('');

    return {
        fillColor,
        fillOpacity: a !== undefined ? Number(a) : 1,
    };
}

export function getInitialTheme(): 'light' | 'dark' {
    const savedTheme = localStorage.getItem('viewflow-theme');
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    return theme;
}
