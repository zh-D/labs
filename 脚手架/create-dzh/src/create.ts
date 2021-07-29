import * as ora from 'ora';
import * as inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import checkEmpty from './utils/checkEmpty';
import selectTemplate from './selectTemplate';
const chalk = require('chalk');
const downloadGitRepo = require('download-git-repo');

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

function downloadAndGenerateProject(
    dirPath: string,
    templateUrl: string,
    dirname: string
): Promise<void> {

    const spinner = ora('download git repo start').start();

    return new Promise((resolve, reject) => {
        downloadGitRepo(templateUrl, dirPath, async (err) => {
            if (err) {
                spinner.fail('download git repo failed.');
                console.error(err);
                process.exit(1);
            }
            spinner.succeed('download git repo successfully.');
            await onDownloadSuccess(dirname);
            resolve()
        })
    })
}

async function onDownloadSuccess(dirname: string) {
    // const packagePath = path.join(process.cwd(), dirname, 'package.json')
    // let packageObj;

    // try {
    //     packageObj = await fs.readJson(packagePath)
    //     packageObj.name = dirname;
    // } catch (err) {
    //     console.error(err)
    // }

    // try {
    //     await fs.writeJson(packagePath, packageObj)
    //     console.log('writeJson success!')
    // } catch (err) {
    //     console.error(err)
    // }
}