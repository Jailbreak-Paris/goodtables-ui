// Module API

// Group errors by row number.
export function getTableErrorGroups(table) {
  const groups = {
    table: [],
    byRow: [],
  }
  for (const error of table.errors) {
    if (error["row-number"]) {
      // Get group
      let group = groups.byRow[error["row-number"]]

      // Create group
      if (!group) {
        group = {
          rowNumber: error["row-number"],
          count: 0,
          row: null,
          errors: [],
        }
      }

      // Get row
      let row = group.row

      // Create row
      if (!row) {
        let values = error.row
        if (!error['row-number']) {
          values = table.headers
        }
        row = {
          values,
          badcols: new Set(),
        }
      }

      // Ensure missing value
      if (error.code === 'missing-value') {
        row.values[error['column-number'] - 1] = ''
      }

      // Add row badcols
      if (error['column-number']) {
        row.badcols.add(error['column-number'])
      } else if (row.values) {
        row.badcols = new Set(row.values.map((value, index) => index + 1))
      }

      // Save group
      group.count += 1
      group.errors.push(error)
      group.row = row
      groups.byRow[error['row-number']] = group
    } else {
      groups.table.push(error)
    }

  }
  return groups
}


export function removeBaseUrl(text) {
  return text.replace(/https:\/\/raw\.githubusercontent\.com\/\S*?\/\S*?\/\S*?\//g, '')
}


export function splitFilePath(path) {
  const parts = path.split('/')
  return {
    name: parts.pop(),
    base: parts.join('/'),
    sep: parts.length ? '/' : '',
  }
}


export function merge(...args) {
  return Object.assign({}, ...args)
}
