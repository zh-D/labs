#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs-extra';
import { Command } from 'commander';
import create from './create';

const pkgContent = fs.readJSONSync(path.join(__dirname, '..', 'package.json'));

(async function () {
    const program = new Command();

    program
        .name(`create-dzh version ${pkgContent.version}`)
        .usage('<command> [options]');

    program
        .option('--template <template>', 'select a template');

    program.on('--help', () => {
        console.log('');
        console.log('Examples:');
        console.log('  $ create-dzh <projectName> ');
        console.log('  $ create-dzh <projectName> --template <templateName>');
        console.log('  $ create-dzh <projectName> <templateName>');
        process.exit(0);
    })

    program.parse(process.argv);

    const dirname: string = program.args[0] ? program.args[0] : '.';
    //@ts-ignore
    // const templateUrl: string = program.template ? program.template : program.args[1];
    const templateUrl = null;

    console.log('create-dzh version:', pkgContent.version);
    console.log('create-dzh args', dirname, templateUrl);

    const dirPath = path.join(process.cwd(), dirname);

    await create(dirPath, templateUrl, dirname);

})();