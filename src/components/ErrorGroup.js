import React from 'react'
import marked from 'marked'
import classNames from 'classnames'
import startCase from 'lodash/startCase'
const spec = require('../spec.json')


// Module API

export class ErrorGroup extends React.Component {

  // Public

  constructor(props) {
    super(props)
    this.state = {
      visibleRowsCount: 10,
    }
  }

  render() {
    const {errorGroups, headers, schema} = this.props
    const {visibleRowsCount} = this.state
    const rowNumbers = Object.keys(errorGroups).length
    return (
      <div className="result">

        {/* Table view */}
        <div className="table-view">
          <div className="inner">
            <ErrorGroupTable
              errorGroups={errorGroups}
              headers={headers}
              schema={schema}
              visibleRowsCount={visibleRowsCount}
            />
          </div>
        </div>

        {/* Show more */}
        {(visibleRowsCount < rowNumbers.length) &&
          <a
            onClick={() => {this.setState({visibleRowsCount: visibleRowsCount + 10})}}
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

function ErrorGroupTable({errorGroups, headers, schema, visibleRowsCount}) {
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
                  <td className={classNames({fail: errorGroups[rowNumber].row.badcols.has(innerIndex + 1)})}
                    key={innerIndex}>
                    {value}
                  </td>
                )}
              </tr>,
              <tr>
                <td colSpan={errorGroups[rowNumber].row.values.length + 1}>
                  <ul className="row-errors list-unstyled">
                    {errorGroups[rowNumber].errors.map((error, index) =>
                      <li key={index}>{renderError(headers, schema, error)}</li>
                    )}
                  </ul>
                </td>
              </tr>
            ]
        ))}
        <tr className="after-fail">
          <td className="result-row-index">
            {rowNumbers[rowNumbers.length - 1] ? rowNumbers[rowNumbers.length - 1] + 1 : 2}
          </td>
          {headers && headers.map((_, index) =>
            <td key={index} />
          )}
        </tr>
      </tbody>
    </table>
  )
}


function renderError(headers, schema, error) {
  // We don't want the end user to see the actual regex, but the definition given by the table schema.
  const columnName = headers[error["column-number"] - 1]
  let errorElement = (
    <details>
      <summary>{columnName}</summary>
      <div className="details-body">{error.message}</div>
    </details>
  )
  if (error.code === "pattern-constraint") {
    const field = schema.fields.find(field => field.name === columnName)
    if (field && field.description) {
      errorElement = (
        <details>
          <summary>{columnName} : le motif ne correspond pas à celui attendu.</summary>
          <div className="details-body">
            <p>{field.description}</p>
            {field.examples && <p>Exemples : {field.examples}</p>}
          </div>
        </details>
      )
    }
  }
  return errorElement
}