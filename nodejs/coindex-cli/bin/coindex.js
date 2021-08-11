#!/usr/bin/env node
const program = require('commander');
const pkg = require('../package.json')

program
    .version(pkg.version)
    .command('key', 'Manage API Key -- https://nomics.com')
    .command('check', 'Check Coin Price Info')
    .parse(process.argv)



// console.log(process.argv);
//[
//     'C:\\Program Files\\nodejs\\node.exe',
//     'C:\\Program Files\\nodejs\\node_modules\\coindex\\bin\\coindex.js',
//     'argv1',
//     'argv2'
//]

