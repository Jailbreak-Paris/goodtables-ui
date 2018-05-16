import React from 'react'
import {Report} from './Report'
import {MessageGroup} from './MessageGroup'
import {merge} from '../helpers'


// Module API

export class Form extends React.Component {

  // Public

  constructor(props) {
    super(props)

    // Set state
    this.state = {
      isSourceFile: false,
      isLoading: !!this.props.reportPromise,
      source: this.props.source || '',
      options: this.props.options || {},
      report: null,
      schema: null,
      error: null,
    }

    // Load report
    if (this.props.reportPromise) {
      this.props.reportPromise.then(([report, schema]) => {
        this.setState({report, schema, isLoading: false})
      }).catch(error => {
        this.setState({error, isLoading: false})
      })
    }
  }

  render() {
    const {isSourceFile, isLoading} = this.state
    const {source, options, report, error} = this.state
    const {schemas} = this.props
    const onSourceTypeChange = this.onSourceTypeChange.bind(this)
    const onSourceChange = this.onSourceChange.bind(this)
    const onOptionsChange = this.onOptionsChange.bind(this)
    const onSubmit = this.onSubmit.bind(this)
    const checkOptionsControls = [
      {key: 'blank-row', label: 'Ignore blank rows'},
      {key: 'duplicate-row', label: 'Ignore duplicate rows'},
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
                defaultValue={options.schema}
                onChange={ev => onOptionsChange('schema', ev.target.value)}>
                {schemas.map(({name, url}, index) => (
                  <option key={index} value={url}>{name}</option>
                ))}
              </select>

              <small>Le schéma à utiliser pour valider le jeu de données.</small>
            </div>

          </div>
        </div>

        <div className="row-submit clearfix">
          <button
            className="btn btn-primary pull-right"
            onClick={ev => {ev.preventDefault(); onSubmit()}}
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
          <div className="row-report">
            <Report report={report} schema={this.state.schema} />
          </div>
        }

      </form>
    )
  }

  // Private

  onSourceTypeChange() {
    this.setState({isSourceFile: !this.state.isSourceFile})
    this.onSourceChange('')
  }

  onSourceChange(value) {
    this.setState({source: value})
  }

  onOptionsChange(key, value) {
    const options = merge(this.state.options, {[key]: value})
    if (!value) delete options[key]
    this.setState({options})
  }

  onSubmit() {
    const {validate} = this.props
    const {source, options} = this.state
    if (this._isDataPackage(source)) options.preset = 'datapackage'
    this.setState({report: null, error: null, isLoading: true})
    validate(source, merge(options)).then(([report, schema]) => {
      this.setState({report, schema, isLoading: false})
    }).catch(error => {
      this.setState({error, isLoading: false})
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
