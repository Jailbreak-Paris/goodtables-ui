import React from 'react'
import classNames from 'classnames'
import {ErrorGroup} from './ErrorGroup'
import {getTableErrorGroups, removeBaseUrl, splitFilePath} from '../helpers'


// Module API

export function Table({table, tableNumber, tablesCount, schema}) {
  const tableFile = removeBaseUrl(table.source)
  const splitTableFile = splitFilePath(tableFile)
  const errorGroups = getTableErrorGroups(table)
  return (
    <div className={classNames({file: true, valid: table.valid, invalid: !table.valid})}>

      {/* Valid message */}
      {table.valid && <p>Aucune erreur n'a été trouvée, le fichier tabulaire est valide.</p>}

      {/* Heading */}
      {!table.valid && (
        <div>
          <p>{table['error-count']} erreurs ont été trouvées :</p>
          <ErrorGroup errorGroups={errorGroups} headers={table.headers} schema={schema} />
        </div>
      )}

    </div>
  )
}
