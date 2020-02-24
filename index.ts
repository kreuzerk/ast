import * as ts from 'typescript';
import * as fs from 'fs';
import * as util from 'util';

import {getSourceNodes} from './ast-utils';

const writeFile = util.promisify(fs.writeFile);
const readfile = util.promisify(fs.readFile);

function showTree(sourceFile: ts.Node, indent: string = '    '): void {
    let node = sourceFile;
    console.log(indent + ts.SyntaxKind[node.kind]);

    if (node.getChildCount() === 0) {
        console.log(indent + '    Text: ' + node.getText());
    }

    for (let child of node.getChildren()) {
        showTree(child, indent + '    ');
    }
}

async function updateImportStatement(nodes: ts.Node[]): Promise<void> {
    const importNodes = nodes.filter(n => n.kind === ts.SyntaxKind.ImportDeclaration);
    const importStringLiterals = importNodes
        .map(importNode => importNode.getChildren()
            .filter((child) => child.kind === ts.SyntaxKind.StringLiteral)[0]
        );

    importStringLiterals.forEach(node => console.log(node.getText()));
    const override = `'foo';`;

    const fileContent = await readfile('demo.ts', 'utf-8');
    const startPosition = importStringLiterals[importStringLiterals.length - 1].pos + 1;
    const endPosition = importStringLiterals[importStringLiterals.length - 1].end + 1;
    const prefix = fileContent.substring(0, startPosition);
    const suffix = fileContent.substring(endPosition);
    await writeFile('demo.ts', `${prefix}${override}${suffix}`);
    console.log('Done');
    // return new InsertChange('demo.ts', importStringLiterals[importStringLiterals.length - 1].pos, override);
}

const buffer = fs.readFileSync('demo.ts');
const content = buffer.toString('utf-8');
const sourceFile = ts.createSourceFile('demo.ts', content, ts.ScriptTarget.Latest, true);
const nodes = getSourceNodes(sourceFile);

updateImportStatement(nodes);
// change.apply(fs.writeFile);
// showTree(sourceFile);

