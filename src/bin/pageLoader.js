#!/usr/bin/env node
import program from 'commander';
import loader from '..';

program
  .version('0.0.1')
  .arguments('<path>')
  .description('download web page')
  .option('-o, --output [dir]', 'output data directory')
  .action((path, cmd) =>
    loader(path, cmd.output));

program.parse(process.argv);
