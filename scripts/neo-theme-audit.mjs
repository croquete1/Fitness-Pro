import { promises as fs } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(process.cwd(), 'src');

const VALID_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.mdx']);

const tailwindKeywords = [
  ' bg-',
  ' text-',
  ' px-',
  ' py-',
  ' pt-',
  ' pb-',
  ' pl-',
  ' pr-',
  ' gap-',
  ' space-x-',
  ' space-y-',
  ' flex',
  ' grid',
  ' items-',
  ' justify-',
  'rounded-',
  ' shadow',
  ' dark:',
  ' sm:',
  ' md:',
  ' lg:',
  ' xl:',
  ' 2xl:',
  'hover:',
  'focus:',
  'aria-',
];

const muiImportPattern = /from\s+['"]@mui\//;
const legacyTodoPattern = /(TODO|FIXME|HACK)/;
const mockPattern = /\b_memdb\b|\bmock\b/i;

function shouldScan(filePath) {
  const ext = path.extname(filePath);
  return VALID_EXTENSIONS.has(ext);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.')) return [];
        return walk(fullPath);
      }
      if (!shouldScan(fullPath)) return [];
      return [fullPath];
    }),
  );
  return files.flat();
}

function captureMatches(lines, predicate) {
  const matches = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (predicate(line)) {
      matches.push({ line: i + 1, code: line.trim() });
    }
  }
  return matches;
}

function hasTailwindTokens(line) {
  if (!/(class(Name)?|classList|clsx|twMerge)/.test(line)) return false;
  const normalized = ` ${line}`;
  return tailwindKeywords.some((token) => normalized.includes(token));
}

async function analyseFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);

  const tailwindMatches = captureMatches(lines, hasTailwindTokens);
  const muiMatches = captureMatches(lines, (line) => muiImportPattern.test(line));
  const todoMatches = captureMatches(lines, (line) => legacyTodoPattern.test(line));
  const mockMatches = captureMatches(lines, (line) => mockPattern.test(line));

  if (!tailwindMatches.length && !muiMatches.length && !todoMatches.length && !mockMatches.length) {
    return null;
  }

  return {
    file: path.relative(path.resolve(process.cwd()), filePath),
    tailwindMatches,
    muiMatches,
    todoMatches,
    mockMatches,
  };
}

function formatSection(title, entries, formatter) {
  if (!entries.length) return '';
  const lines = [title];
  for (const entry of entries) {
    lines.push(formatter(entry));
  }
  return `${lines.join('\n')}`;
}

function formatMatch(match) {
  return `  • L${match.line}: ${match.code}`;
}

async function main() {
  try {
    const files = await walk(PROJECT_ROOT);
    const reports = [];
    for (const file of files) {
      const report = await analyseFile(file);
      if (report) reports.push(report);
    }

    reports.sort((a, b) => b.tailwindMatches.length - a.tailwindMatches.length);

    const tailwindTotal = reports.reduce((sum, report) => sum + report.tailwindMatches.length, 0);
    const muiTotal = reports.reduce((sum, report) => sum + report.muiMatches.length, 0);
    const todoTotal = reports.reduce((sum, report) => sum + report.todoMatches.length, 0);
    const mockTotal = reports.reduce((sum, report) => sum + report.mockMatches.length, 0);

    console.log('Neo Theme Adoption Audit');
    console.log('==========================');
    console.log(`Scanned files: ${files.length}`);
    console.log(`Tailwind-like utility occurrences: ${tailwindTotal}`);
    console.log(`MUI import occurrences: ${muiTotal}`);
    console.log(`TODO/FIXME/HACK markers: ${todoTotal}`);
    console.log(`Mock data references: ${mockTotal}`);
    console.log('');

    const tailwindTop = reports
      .filter((report) => report.tailwindMatches.length > 0)
      .slice(0, 10);

    if (tailwindTop.length) {
      console.log('Top Tailwind-heavy files:');
      for (const report of tailwindTop) {
        console.log(`• ${report.file} (${report.tailwindMatches.length})`);
      }
      console.log('');
    }

    const muiFiles = reports.filter((report) => report.muiMatches.length > 0);
    if (muiFiles.length) {
      console.log('Files importing MUI:');
      for (const report of muiFiles) {
        console.log(`• ${report.file}`);
      }
      console.log('');
    }

    const todoFiles = reports.filter((report) => report.todoMatches.length > 0 || report.mockMatches.length > 0);
    if (todoFiles.length) {
      console.log('Pending implementation markers:');
      for (const report of todoFiles) {
        if (report.todoMatches.length) {
          console.log(`• ${report.file} (${report.todoMatches.length} TODO/FIXME/HACK)`);
        }
        if (report.mockMatches.length) {
          console.log(`  ↳ ${report.mockMatches.length} mock references`);
        }
      }
      console.log('');
    }

    const verbose = process.argv.includes('--verbose');
    if (verbose) {
      for (const report of reports) {
        console.log(`\nFile: ${report.file}`);
        const sections = [
          formatSection(' Tailwind-like snippets:', report.tailwindMatches, formatMatch),
          formatSection(' MUI imports:', report.muiMatches, formatMatch),
          formatSection(' TODO/FIXME/HACK markers:', report.todoMatches, formatMatch),
          formatSection(' Mock references:', report.mockMatches, formatMatch),
        ].filter(Boolean);
        for (const section of sections) {
          console.log(section);
        }
      }
    }
  } catch (error) {
    console.error('Failed to run Neo theme audit');
    console.error(error);
    process.exitCode = 1;
  }
}

await main();
