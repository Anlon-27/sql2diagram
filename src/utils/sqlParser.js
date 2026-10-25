/**
 * SQL 解析器 - 解析 CREATE TABLE 语句
 * 使用手动括号匹配替代正则，正确处理嵌套括号
 */

export function parseSql(sql) {
    const tables = [];

    // 移除注释
    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
    sql = sql.replace(/--.*/g, '');
    sql = sql.replace(/#.*/g, '');

    // 提取 COMMENT ON TABLE 语句中的表注释
    const tableComments = {};
    const commentOnTableRegex = /COMMENT\s+ON\s+TABLE\s+(?:IF\s+EXISTS\s+)?[`"']?([^\s`'"(),]+)[`"']?\s+IS\s+'([^']*)'/gi;
    let tcMatch;
    while ((tcMatch = commentOnTableRegex.exec(sql)) !== null) {
        tableComments[tcMatch[1]] = tcMatch[2];
    }

    // 逐个查找 CREATE TABLE — 表名支持中文用 [^\s`'"']+
    const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?([^\s`'"',()]+)[`"']?\s*\(/gi;
    let match;

    while ((match = createRegex.exec(sql)) !== null) {
        const tableName = match[1];
        const bodyStart = match.index + match[0].length; // 紧接在 '(' 之后

        // 手动查找匹配的右括号（处理嵌套括号）
        const bodyEnd = findMatchingParen(sql, bodyStart);
        if (bodyEnd === -1) continue;

        const columnsBlock = sql.substring(bodyStart, bodyEnd);

        // 提取右括号之后到分号之间的表选项
        const afterParen = sql.substring(bodyEnd + 1);
        const semicolonIdx = afterParen.indexOf(';');
        const tableOptions = semicolonIdx !== -1 ? afterParen.substring(0, semicolonIdx) : afterParen;

        // 提取表注释：优先 COMMENT ON TABLE，其次 inline COMMENT
        const tableComment = tableComments[tableName]
            || (tableOptions.match(/COMMENT\s*=?\s*'([^']*)'/i) || [])[1]
            || tableName;

        const columns = [];
        const primaryKeys = [];
        const foreignKeys = [];

        // 找独立的 PRIMARY KEY 声明
        const pkRegex = /PRIMARY\s+KEY\s*\(([^)]+)\)/gi;
        let pkMatch;
        while ((pkMatch = pkRegex.exec(columnsBlock)) !== null) {
            const keys = pkMatch[1].split(',').map(k => k.trim().replace(/[`"']/g, ''));
            primaryKeys.push(...keys);
        }

        // 找独立的 FOREIGN KEY 声明
        const fkRegex = /FOREIGN\s+KEY\s*\(\s*[`"']?([^\s`'"(),]+)[`"']?\s*\)/gi;
        let fkMatch;
        while ((fkMatch = fkRegex.exec(columnsBlock)) !== null) {
            foreignKeys.push(fkMatch[1]);
        }

        // 按逗号分割（跳过括号和引号内的逗号）
        const lines = splitColumnLines(columnsBlock);

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // 跳过约束行
            if (/^\s*(PRIMARY\s+KEY|UNIQUE\s+KEY|UNIQUE\s+INDEX|UNIQUE\s*\(|INDEX|KEY\s|CONSTRAINT|FOREIGN\s+KEY|CHECK)/i.test(trimmed)) {
                continue;
            }

            // 解析字段 — \S+ 支持中文等非ASCII字符
            const colMatch = trimmed.match(
                /^[`"']?(\S+?)[`"']?\s+([\w]+(?:\s*\([^)]*\))?)\s*(.*)/i
            );

            if (colMatch) {
                const colName = colMatch[1];
                const colType = colMatch[2];
                const rest = colMatch[3] || '';

                const isPK = /PRIMARY\s+KEY/i.test(rest) || primaryKeys.includes(colName);
                const isFK = foreignKeys.includes(colName);
                const commentMatch = rest.match(/COMMENT\s+'([^']*)'/i);
                const comment = commentMatch ? commentMatch[1] : colName;

                // Extract nullable
                const isNullable = !/NOT\s+NULL/i.test(rest);
                // Extract default
                const defaultMatch = rest.match(/DEFAULT\s+('(?:[^'\\]|\\.)*'|NULL|\w+(?:\([^)]*\))?)/i);
                const defaultValue = defaultMatch ? defaultMatch[1].replace(/^'|'$/g, '') : '';

                columns.push({
                    name: colName,
                    type: colType,
                    isPrimaryKey: isPK,
                    isForeignKey: isFK,
                    comment: comment,
                    nullable: isNullable,
                    defaultValue: defaultValue
                });
            }
        }

        tables.push({
            name: tableName,
            comment: tableComment,
            columns: columns
        });
    }

    return tables;
}

export function serializeSql(tables = []) {
    return (tables || []).map((table) => {
        const tableName = table?.name || 'table_name';
        const tableComment = String(table?.comment || tableName).replace(/'/g, "''");
        const columns = Array.isArray(table?.columns) ? table.columns : [];
        const primaryKeys = columns.filter((col) => col.isPrimaryKey).map((col) => `\`${col.name}\``);

        const columnLines = columns.map((col) => {
            const parts = [
                `  \`${col.name}\``,
                col.type || 'VARCHAR(255)'
            ];

            if (!col.nullable) {
                parts.push('NOT NULL');
            }

            if (col.defaultValue !== undefined && col.defaultValue !== null && String(col.defaultValue) !== '') {
                parts.push(`DEFAULT '${String(col.defaultValue).replace(/'/g, "''")}'`);
            }

            if (col.comment) {
                parts.push(`COMMENT '${String(col.comment).replace(/'/g, "''")}'`);
            }

            return parts.join(' ');
        });

        if (primaryKeys.length > 0) {
            columnLines.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
        }

        return `CREATE TABLE \`${tableName}\` (\n${columnLines.join(',\n')}\n) COMMENT='${tableComment}';`;
    }).join('\n\n');
}

/**
 * 从指定位置开始，查找匹配的右括号
 * 正确处理嵌套括号和引号内的括号
 */
function findMatchingParen(str, startIndex) {
    let depth = 1;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inBacktick = false;

    for (let i = startIndex; i < str.length; i++) {
        const ch = str[i];
        const prev = i > 0 ? str[i - 1] : '';

        // 引号状态切换（忽略转义）
        if (ch === "'" && !inDoubleQuote && !inBacktick && prev !== '\\') {
            inSingleQuote = !inSingleQuote;
            continue;
        }
        if (ch === '"' && !inSingleQuote && !inBacktick && prev !== '\\') {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }
        if (ch === '`' && !inSingleQuote && !inDoubleQuote) {
            inBacktick = !inBacktick;
            continue;
        }

        // 只在引号外计数括号
        if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
            if (ch === '(') depth++;
            else if (ch === ')') {
                depth--;
                if (depth === 0) return i;
            }
        }
    }
    return -1;
}

/**
 * 按逗号分割字段行，跳过括号和引号内的逗号
 */
function splitColumnLines(block) {
    const lines = [];
    let current = '';
    let depth = 0;
    let inSingleQuote = false;
    let inBacktick = false;

    for (let i = 0; i < block.length; i++) {
        const ch = block[i];
        const prev = i > 0 ? block[i - 1] : '';

        if (ch === "'" && !inBacktick && prev !== '\\') {
            inSingleQuote = !inSingleQuote;
        } else if (ch === '`' && !inSingleQuote) {
            inBacktick = !inBacktick;
        }

        if (!inSingleQuote && !inBacktick) {
            if (ch === '(') depth++;
            else if (ch === ')') depth--;
            else if (ch === ',' && depth === 0) {
                lines.push(current);
                current = '';
                continue;
            }
        }
        current += ch;
    }
    if (current.trim()) lines.push(current);
    return lines;
}
