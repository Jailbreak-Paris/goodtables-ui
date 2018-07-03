import React from 'react'
import { Report } from './Report'
import { MessageGroup } from './MessageGroup'
import { merge } from '../helpers'


// Module API


const docBaseUrl = "https://git.opendatafrance.net/validata/validata-doc/blob/master/static/schemas"


export class Form extends React.Component {

  // Public

  constructor(props) {
    super(props)

    const options = this.props.options || {}

    // Set state
    this.state = {
      isSourceFile: false,
      isLoading: !!this.props.reportPromise,
      source: this.props.source || '',
      options,
      schema: null,
      report: null,
      error: null,
      selectedExamplesUrls: {},
      selectedSchemaCode: options.schema,
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

  handleExampleSelect(schema, exampleUrl) {
    const selectedExamplesUrls = this.state.selectedExamplesUrls
    if (exampleUrl === "no-example") {
      delete selectedExamplesUrls[schema.code]
    } else {
      selectedExamplesUrls[schema.code] = exampleUrl
    }
    const newState = { selectedExamplesUrls }
    if (this.state.selectedSchemaCode === schema.code) {
      newState.source = exampleUrl
    }
    this.setState(newState)
  }
  handleSelectSchema(schemaCode) {
    const { schemas } = this.props
    const schema = schemas.find(schema => schema.code === schemaCode)
    const { options } = this.state
    options.schema = schema.url
    this.setState({
      selectedSchemaCode: schemaCode,
      source: this.state.selectedExamplesUrls[schemaCode] || "",
      report: null,
      options,
      schema,
    }, () => {
      document.getElementById("source-url-form").scrollIntoView({ "block": "start", "behavior": "smooth" })
    })
  }
  render() {
    const { schemas } = this.props
    return <div>
      <div className="row">
        {schemas.map((schema, index) =>
          <div className="col-sm-4 col-md-3" key={index}>
            <div className={`panel panel-${this.state.selectedSchemaCode === schema.code ? "primary" : "default"}`} style={{ height: "20em", position: "relative" }}>
              <div className="panel-heading">
                <h3 className="panel-title">
                  <span style={{ marginRight: "1em" }}>{schema.name}</span>
                  {schema.version && <span className="badge">{schema.version}</span>}
                  {schema.todo && <span className="badge">En cours de réalisation</span>}
                </h3>
              </div>
              <div className="panel-body">
                {schema.shortDescription && <p>{schema.shortDescription}</p>}
                {schema.specUrl &&
                  <p>
                    <a href={schema.specUrl} target="_blank">Spécification SCDL</a>
                  </p>
                }
                {schema.todo ? null :
                  <p>
                    <a href={`${docBaseUrl}/${schema.code}.md`} target="_blank">Documentation</a>
                  </p>
                }
                {this.renderSchemaExamples(schema)}
                {schema.todo || this.state.selectedSchemaCode === schema.code ? null :
                  <button className="btn btn-secondary" style={{
                    position: "absolute",
                    bottom: "1em",
                    right: "1em"
                  }} title="Valider un fichier de ce type" onClick={ev => this.handleSelectSchema(schema.code)}>
                    Sélectionner ce schéma
                  </button>
                }
              </div>
            </div>
          </div>
        )}
      </div>
      {this.state.selectedSchemaCode &&
        this.renderForm()
      }
    </div>
  }
  renderSchemaExamples(schema) {
    const { examples } = this.props
    const examplesForSchema = examples.filter(example => example.schemaCode == schema.code)
    if (examplesForSchema.length === 0) {
      return null
    }
    return <div>
      <select className="form-control" onChange={ev => this.handleExampleSelect(schema, ev.target.value)}>
        <option value={"no-example"}>Sélectionner un fichier d'exemple...</option>
        {examplesForSchema.map((example, index) =>
          <option key={index} value={example.url}>
            {example.name}
          </option>
        )}
      </select>
    </div>
  }
  renderForm() {
    const { isSourceFile, isLoading, source, options, schema, report, error } = this.state
    const onSourceTypeChange = this.onSourceTypeChange.bind(this)
    const onSourceChange = this.onSourceChange.bind(this)
    const onSubmit = this.onSubmit.bind(this)

    return (
      <form className="goodtables-ui-form panel panel-default" id="source-url-form">
        <div className="row-source">
          <div className="row">
            <div className="form-group col-md-8">
              <label htmlFor="source">Fichier tabulaire à valider</label>&nbsp;
              [<a href="#" onClick={onSourceTypeChange}>
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

        <div className="row-submit clearfix">
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
            <Report report={report} schema={schema} />
          </div>
        }

      </form>
    )
  }

  // Private

  onSourceTypeChange(ev) {
    ev.preventDefault()
    this.setState({ isSourceFile: !this.state.isSourceFile })
    this.onSourceChange('')
  }

  onSourceChange(value) {
    this.setState({ source: value })
  }

  onSubmit() {
    const { validate } = this.props
    const { source, options } = this.state
    if (this._isDataPackage(source)) options.preset = 'datapackage'
    this.setState({ report: null, error: null, isLoading: true })
    validate(source, options).then(([report, schema]) => {
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
