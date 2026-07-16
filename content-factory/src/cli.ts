#!/usr/bin/env node
// PassPoint — CLI de la fábrica de contenido (SPEC §6).
// Uso: factory <comando> [--state CA] [opciones]
// El pipeline es independiente del runtime del producto: la IA vive SOLO aquí.

import { run as ingest } from './commands/ingest.js';
import { run as generate } from './commands/generate.js';
import { run as verify } from './commands/verify.js';
import { run as review } from './commands/review.js';
import { run as importCmd } from './commands/import.js';
import { run as watch } from './commands/watch.js';

type Command = (args: string[]) => Promise<void>;

const COMMANDS: Record<string, { run: Command; help: string }> = {
  ingest: { run: ingest, help: 'Descarga y parsea el manual oficial → chunks con referencia de sección.' },
  generate: { run: generate, help: 'Genera preguntas por tema ancladas a un chunk → DRAFT.' },
  verify: { run: verify, help: 'Segundo pase de IA valida cada DRAFT contra su fuente → AI_VERIFIED.' },
  review: { run: review, help: 'Revisión humana 1×1 (aprobar/editar/rechazar) → HUMAN_APPROVED.' },
  import: { run: importCmd, help: 'Carga a la base de datos con versión.' },
  watch: { run: watch, help: 'Vigila cambios del manual oficial y alerta para regenerar.' },
};

function printHelp(): void {
  console.log('PassPoint — fábrica de contenido (SPEC §6)\n');
  console.log('Uso: factory <comando> [opciones]\n');
  console.log('Comandos (orden del pipeline):');
  for (const [name, { help }] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(10)} ${help}`);
  }
}

async function main(): Promise<void> {
  const [, , commandName, ...args] = process.argv;

  if (!commandName || commandName === '--help' || commandName === '-h') {
    printHelp();
    return;
  }

  const command = COMMANDS[commandName];
  if (!command) {
    console.error(`Comando desconocido: ${commandName}\n`);
    printHelp();
    process.exitCode = 1;
    return;
  }

  await command.run(args);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
