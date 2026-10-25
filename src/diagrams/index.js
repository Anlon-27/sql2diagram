import erDiagram from './er/index.js';
import overallErDiagram from './overall-er/index.js';
import linetableDiagram from './linetable/index.js';
import architectureDiagram from './architecture/index.js';
import flowchartDiagram from './flowchart/index.js';
import usecaseDiagram from './usecase/index.js';
import classDiagram from './classdiagram/index.js';
import sequenceDiagram from './sequence/index.js';

export const diagrams = [
    erDiagram,
    overallErDiagram,
    linetableDiagram,
    architectureDiagram,
    flowchartDiagram,
    usecaseDiagram,
    classDiagram,
    sequenceDiagram
];

export function getDiagramByType(type) {
    return diagrams.find(d => d.type === type);
}
