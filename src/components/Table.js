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
      {table.valid &&
        <div className="alert alert-success">
          Aucune erreur n'a été trouvée, le fichier est valide !
        </div>
      }

      {/* Heading */}
      {!table.valid && <ErrorGroup errorGroups={errorGroups} headers={table.headers} schema={schema} />}

    </div>
  )
}
