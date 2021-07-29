import * as inquirer from 'inquirer';
import * as fs from 'fs-extra';
import checkEmpty from './utils/checkEmpty';
import selectTemplate from './selectTemplate';
import downloadAndGenerateProject from './downloadAndGenerateProject';


const chalk = require('chalk');

export default async function create(dirPath: string, templateName: string, dirname: string): Promise<void> {
    await fs.ensureDir(dirPath);
    const empty = await checkEmpty(dirPath);

    if (!empty) {
        const { go } = await inquirer.prompt({
            type: 'confirm',
            name: 'go',
            message:
                'The existing file in the current directory. Are you sure to continue ？',
            default: false,
        });
        if (!go) process.exit(1);
    }

    const templateUrl = await selectTemplate(templateName);

    await downloadAndGenerateProject(dirPath, templateUrl, dirname);

    console.log();
    console.log('Initialize project successfully.');
    console.log();
    console.log('Starts the development server.');
    console.log();
    console.log(chalk.cyan(`    cd ${dirname}`));
    console.log(chalk.cyan('    npm install'));
    console.log(chalk.cyan('    npm start'));
    console.log();

}

