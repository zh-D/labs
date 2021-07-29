import * as ora from 'ora';
import * as inquirer from 'inquirer';
import axios from 'axios';

axios.interceptors.response.use(res => {
    return res.data;
})


// select template from github
export default async function selectTemplate(templateName: string): Promise<string> {
    const user = 'dzh-cli';
    const repo = templateName ? templateName : await selectRepo();
    const tag = await selectTag(repo);
    const requestUrl = `${user}/${repo}${tag ? '#' + tag : ''}`;
    return requestUrl;
}

async function selectRepo(): Promise<string> {
    // 获取模板列表
    const spinner = ora('fetch template list start').start();
    let repoList;
    try {
        repoList = await axios.get('https://api.github.com/orgs/dzh-cli/repos');
    } catch (error) {
        spinner.fail('fetch template list failed.');
        process.exit(1);
    }
    spinner.succeed('fetch template list successfully.');

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
        name: 'repo',
        type: 'list',
        choices: repoList.map(item => item.name),
        message: 'Please choose a template to create project'
    })

    // 3）return 用户选择的名称
    return repo;
}

async function selectTag(repo: string): Promise<string> {
    // 远程拉取对应的 tag 列表
    const spinner = ora('fetch tag list start').start();
    let tags = [];
    try {
        tags = await axios.get(`https://api.github.com/repos/dzh-cli/${repo}/tags`);
        if (tags.length === 0) {
            spinner.succeed('fetch tag list successfully.');
            return
        }
    } catch (error) {
        if (error) {
            spinner.fail('fetch tag list Failed.');
            process.exit(1);
        }
    }

    spinner.succeed('fetch tag list successfully.');

    const { tag } = await inquirer.prompt({
        name: 'tag',
        type: 'list',
        choices: tags.map(item => item.name),
        message: 'Place choose a tag to create project'
    })
    return tag;
}