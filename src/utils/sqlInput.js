const MAX_INPUT_CHARS = 80000;

export function filterSql(sql) {
  if (sql.length <= MAX_INPUT_CHARS) return sql;

  const withoutData = stripDataStatements(sql);
  if (withoutData.length <= MAX_INPUT_CHARS) return withoutData;

  const createTables = extractCreateTables(sql);
  if (createTables.length > 0) {
    return createTables.join('\n\n');
  }

  return sql.substring(0, MAX_INPUT_CHARS);
}

function stripDataStatements(sql) {
  const lines = sql.split('\n');
  const result = [];
  let inDataBlock = false;

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim().toUpperCase();

    const isDataStart = /^INSERT\s+INTO\b/.test(trimmed)
      || /^UPDATE\s+\w+\s+SET\b/.test(trimmed)
      || /^DELETE\s+FROM\b/.test(trimmed);

    const isStruct = /^(CREATE|ALTER|DROP|LOCK\s+TABLE|UNLOCK|SET|USE|BEGIN|COMMIT|START|GRANT|REVOKE|TRUNCATE)\b/.test(trimmed)
      || trimmed.startsWith('/*!')
      || trimmed.startsWith('SOURCE ')
      || lines[i].trimStart().startsWith('.');

    if (isDataStart) {
      inDataBlock = true;
      continue;
    }

    if (inDataBlock) {
      if (isStruct || trimmed === '' || lines[i].trimStart().startsWith('--')) {
        inDataBlock = false;
        result.push(lines[i]);
      }
      continue;
    }

    result.push(lines[i]);
  }

  return result.join('\n');
}

function extractCreateTables(sql) {
  const tables = [];
  const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(/gi;
  let match;

  while ((match = createRegex.exec(sql)) !== null) {
    const start = match.index;
    const parenStart = start + match[0].length - 1;
    const end = findMatchingParen(sql, parenStart);
    if (end === -1) continue;

    const afterParen = sql.substring(end + 1);
    const semiIdx = afterParen.indexOf(';');
    const fullEnd = end + 1 + (semiIdx !== -1 ? semiIdx + 1 : 1);
    const fullStatement = sql.substring(start, fullEnd).trim();

    tables.push(fullStatement);
  }

  return tables;
}

function findMatchingParen(str, startIndex) {
  let depth = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let i = startIndex + 1; i < str.length; i += 1) {
    const ch = str[i];
    const prev = i > 0 ? str[i - 1] : '';

    if (ch === "'" && !inDoubleQuote && !inBacktick && prev !== '\\') {
      inSingleQuote = !inSingleQuote;
    } else if (ch === '"' && !inSingleQuote && !inBacktick && prev !== '\\') {
      inDoubleQuote = !inDoubleQuote;
    } else if (ch === '`' && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
    }

    if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
      if (ch === '(') depth += 1;
      else if (ch === ')') {
        depth -= 1;
        if (depth === 0) return i;
      }
    }
  }

  return -1;
}
