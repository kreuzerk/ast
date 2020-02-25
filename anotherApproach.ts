import * as fs from 'fs';
import * as ts from 'typescript';

interface Modification {
    startPosition: number;
    endPosition: number;
    content: string;
}

let modifications: Modification[] = [];

function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
        const importSegments = node.getChildren();
        const importStringLiteral = importSegments.find(segment => segment.kind === ts.SyntaxKind.StringLiteral);

        if (!isThirdPartyLibImport(importStringLiteral)) {
            modifications.push({
                startPosition: importStringLiteral.pos + 1,
                endPosition: importStringLiteral.end + 1,
                content: `'foo';`
            })
        }
    }
    node.forEachChild(visit);
}

function isThirdPartyLibImport(importStringLiteral: ts.Node): boolean {
    return !importStringLiteral || !importStringLiteral.getText().startsWith(`'.`)
}

function instrument(fileName: string, sourceCode: string) {
    const sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);
    visit(sourceFile);
    const modifiedSource = applyReplacements(sourceCode, modifications);
    fs.writeFileSync('./demo.ts', modifiedSource);
}

const inputFile = './demo.ts';
instrument(inputFile, fs.readFileSync(inputFile, 'utf-8'));


export function applyReplacements(source: string, replacements: Modification[]) {
    for (const modification of modifications.reverse()) {
        source = source.slice(0, modification.startPosition) + modification.content + source.slice(modification.endPosition);
    }
    return source;
}
