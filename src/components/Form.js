import React from 'react'
import { Report } from './Report'
import { MessageGroup } from './MessageGroup'
import { merge } from '../helpers'


// Module API


export class Form extends React.Component {

  // Public

  constructor(props) {
    super(props)

    const options = this.props.options || {}
    const schemaCode = options.schema
      ? this.props.schemas.find(schema => schema.url === options.schema).code
      : null

    // Set state
    this.state = {
      isSourceFile: false,
      isLoading: !!this.props.reportPromise,
      source: this.props.source || '',
      options,
      report: null,
      schema: null,
      schemaCode,
      error: null,
    }

    // Load report
    if (this.props.reportPromise) {
      this.props.reportPromise.then(([report, schema]) => {
        this.setState({ report, schema, isLoading: false })
      }).catch(error => {
        this.setState({ error, isLoading: false })
      })
    }
  }

  render() {
    const { isSourceFile, isLoading, source, options, report, error, schema, schemaCode } = this.state
    const { schemas, examples } = this.props
    const onSourceTypeChange = this.onSourceTypeChange.bind(this)
    const onSourceChange = this.onSourceChange.bind(this)
    const onSchemaChange = this.onSchemaChange.bind(this)
    const onSubmit = this.onSubmit.bind(this)
    const checkOptionsControls = [
      { key: 'blank-row', label: 'Ignore blank rows' },
      { key: 'duplicate-row', label: 'Ignore duplicate rows' },
    ]

    return (
      <form className="goodtables-ui-form panel panel-default">

        <div className="row-source">
          <div className="row">
            <div className="form-group col-md-8">
              <label htmlFor="source">Fichier tabulaire à valider</label>&nbsp;
              [<a href="#" onClick={() => onSourceTypeChange()}>
                {(isSourceFile) ? 'Fournir un lien' : 'Envoyer un fichier'}
              </a>]

              {!isSourceFile &&
                <input
                  name="source"
                  className="form-control"
                  type="text"
                  value={source}
                  placeholder="http://data.source/url"
                  onChange={ev => onSourceChange(ev.target.value)}
                />
              }

              {isSourceFile &&
                <input
                  name="source"
                  className="form-control"
                  type="file"
                  placeholder="http://data.source/url"
                  onChange={ev => onSourceChange(ev.target.files[0])}
                />
              }
              <small>Le jeu de données tabulaire à valider.</small>
            </div>
          </div>
        </div>

        <div className="row-schema">
          <div className="row">
            <div className="form-group col-md-8">
              <label htmlFor="schema">Schéma du <abbr title="Socle Commun des Données Locales">SCDL</abbr></label>&nbsp;

              <select
                className="form-control"
                name="schema"
                value={options.schema}
                onChange={ev => onSchemaChange(ev.target.value)}>
                {schemas.map(({ name, url }, index) => (
                  <option key={index} value={url}>{name}</option>
                ))}
              </select>

              <small>Le schéma à utiliser pour valider le jeu de données.</small>
            </div>

          </div>
        </div>

        <div className="row-submit clearfix">
          {examples &&
            <details>
              <summary>Exemples</summary>
              <ul>
                {examples.map(({ url, name, schemaCode }, index) =>
                  <li key={index}>
                    <a
                      href={url}
                      onClick={ev => {
                        ev.preventDefault()
                        this.onExampleSelect({ source: ev.target.href, schemaCode })
                      }}
                    >
                      {name}
                    </a>
                    {url === source && " (sélectionné)"}
                  </li>
                )}
              </ul>
            </details>
          }

          <button
            className="btn btn-primary pull-right"
            disabled={!(source instanceof File) && !source.trim()}
            onClick={ev => { ev.preventDefault(); onSubmit() }}
          >
            Valider
          </button>

          {report && location.search &&
            <a href={location.href}>Lien permanent</a>
          }
        </div>

        {isLoading &&
          <div className="row-message">
            <div className="alert alert-info">
              Chargement en cours...
            </div>
          </div>
        }

        {error &&
          <div className="row-message">
            <MessageGroup
              type="danger"
              title={'Error'}
              messages={[error.message]}
            />
          </div>
        }

        {report &&
          <div id="report">
            <hr />
            <Report report={report} schema={schema} schemaCode={schemaCode} />
          </div>
        }

      </form>
    )
  }

  // Private

  onExampleSelect({ source, schemaCode }) {
    const schema = this.props.schemas.find(schema => schema.code === schemaCode).url
    const options = merge(this.state.options, { schema })
    this.setState({
      schemaCode,
      source,
      isSourceFile: false,
      options,
    }, () => { this.onSubmit() })
  }

  onSourceTypeChange() {
    this.setState({ isSourceFile: !this.state.isSourceFile })
    this.onSourceChange('')
  }

  onSourceChange(value) {
    this.setState({ source: value })
  }

  onSchemaChange(schemaUrl) {
    const schemaCode = this.props.schemas.find(schema => schema.url === schemaUrl).code
    const options = merge(this.state.options, { schema: schemaUrl })
    this.setState({ options, schemaCode })
  }

  onSubmit() {
    const { validate } = this.props
    const { source, options } = this.state
    if (this._isDataPackage(source)) options.preset = 'datapackage'
    this.setState({ report: null, error: null, isLoading: true })
    validate(source, merge(options)).then(([report, schema]) => {
      this.setState({ report, schema, isLoading: false }, () => {
        document.getElementById("report").scrollIntoView({ "block": "start", "behavior": "smooth" })
      })
    }).catch(error => {
      this.setState({ error, isLoading: false })
    })
  }

  _isDataPackage(source) {
    let path = source

    // Source is a file
    if (source.name !== undefined) {
      path = source.name
    }

    return path.endsWith('datapackage.json')
  }
}
