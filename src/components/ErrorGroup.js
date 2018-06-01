import React from 'react'
import marked from 'marked'
import classNames from 'classnames'
import startCase from 'lodash/startCase'
const spec = require('../spec.json')


// Module API

const docBaseUrl = "https://git.opendatafrance.net/validata/validata-doc/blob/master/static"

export class ErrorGroup extends React.Component {

  // Public

  constructor(props) {
    super(props)
    this.state = {
      visibleRowsCount: 10,
    }
  }

  render() {
    const { errorGroups, headers, schema, schemaCode } = this.props
    const { visibleRowsCount } = this.state
    const rowNumbers = Object.keys(errorGroups).length
    return (
      <div className="result">

        {errorGroups.table.length ?
          <div className="alert alert-danger">
            <p style={{ marginBottom: "1em" }}>Des erreurs portant sur la structure du fichier ont été trouvées :</p>
            <ul className="list-unstyled">
              {errorGroups.table.map((error, index) =>
                <li key={index}>{renderStructureError(error)}</li>
              )}
            </ul>
          </div> : null
        }

        {/* Table view */}
        {errorGroups.byRow.length ?
          <div>
            <div className="alert alert-danger">
              <p>Des erreurs portant sur le contenu des cellules du tableau ont été trouvées :</p>
            </div>
            <div className="table-view">
              <div className="inner">
                <ErrorGroupTable
                  errorGroups={errorGroups.byRow}
                  headers={headers}
                  schema={schema}
                  schemaCode={schemaCode}
                  visibleRowsCount={visibleRowsCount}
                />
              </div>
            </div>
          </div> : null
        }

        {/* Show more */}
        {(visibleRowsCount < rowNumbers.length) &&
          <a
            onClick={() => { this.setState({ visibleRowsCount: visibleRowsCount + 10 }) }}
            className="show-more"
          >
            Afficher la suite <span className="icon-keyboard_arrow_down" />
          </a>
        }

      </div>
    )
  }
}


// Internal

function ErrorGroupTable({ errorGroups, headers, schema, schemaCode, visibleRowsCount }) {
  const rowNumbers = Object.keys(errorGroups).sort().map(key => errorGroups[key].rowNumber)  // Use ints, keys are str.
  return (
    <table className="table">
      <tbody>
        {headers &&
          <tr className="before-fail">
            <td>1</td>
            {headers.map((header, index) =>
              <td key={index}>{header}</td>
            )}
          </tr>
        }
        {rowNumbers.map((rowNumber, index) => (
          (index < visibleRowsCount) &&
          [
            <tr key={index}>
              <td className="result-row-index">{rowNumber || 1}</td>
              {errorGroups[rowNumber].row.values.map((value, innerIndex) =>
                <td className={classNames({ fail: errorGroups[rowNumber].row.badcols.has(innerIndex + 1) })}
                  key={innerIndex}>
                  {value}
                </td>
              )}
            </tr>,
            <tr>
              <td colSpan={errorGroups[rowNumber].row.values.length + 1}>
                <ul className="row-errors list-unstyled">
                  {errorGroups[rowNumber].errors.map((error, index) =>
                    <li key={index}>{renderColumnError(headers, schema, schemaCode, error)}</li>
                  )}
                </ul>
              </td>
            </tr>
          ]
        ))}
      </tbody>
    </table>
  )
}

function renderStructureError(error) {
  return (
    <details>
      <summary>{spec.errors[error.code].name}</summary>
      <div className="details-body">
        {error.message}
        <p><a href={`${docBaseUrl}/errors/${error.code}.md`} target="_blank">En savoir plus</a></p>
      </div>
    </details>
  )
}

function renderColumnError(headers, schema, schemaCode, error) {
  // pattern-constraint is blacklisted because we don't want the end user to see the actual regex.
  const columnName = headers[error["column-number"] - 1] || "Ligne entière"
  const field = schema.fields.find(field => field.name === columnName) || {}
  const shortMessage = spec.errors[error.code] ? spec.errors[error.code].name : "Valeur invalide"
  const anchor = field.name ? `#${field.name.toLowerCase()}` : ""
  return (
    <details>
      <summary>{columnName} : {shortMessage}</summary>
      <div className="details-body">
        <div>
          {error.code !== "pattern-constraint" && <p>{error.message}</p>}
          {field.description && <p>{field.description}</p>}
          {field.examples && <p>Exemples de valeurs valides : {field.examples}</p>}
          <p>
            <a href={`${docBaseUrl}/schemas/${schemaCode}.md${anchor}`} target="_blank">
              En savoir plus sur la colonne
            </a>
          </p>
        </div>
        <p><a href={`${docBaseUrl}/errors/${error.code}.md`} target="_blank">En savoir plus sur l'erreur</a></p>
      </div>
    </details>
  )
}