import React from 'react'
import { Link } from 'react-router'
import Highlight from 'react-highlight'

export default React.createClass({
  render() {
    return (
      <div>
        <div className="row m-b-lg p-b-lg">
          <h2>Rinocloud watcher documentation</h2>
          <Link to="/" className="pull-right btn btn-sm btn-default">Back to watcher</Link>

          <div className="row">
            <div className="col-lg-8">
              <h3>Getting started</h3>

              <p>
                To start watching a directory you first need to place a rino.yaml file inside.
                Then choose your directory using rino-watcher. rino-watcher will look inside the rino.yaml
                file and decide how to treat all the files in that directory.
              </p>

              <p>
                If you need any help or have suggestions please email <strong>eoin@rinocloud.com</strong>
              </p>

              <h3>Example rino.yaml file</h3>

              <Highlight className='yaml'>
                apiToken: "{'<'}your rinocloud token{'>'}"{'\n'}
                {'\n'}
                metadata:{'\n'}
                {'\t'}location: "/Users/eoinmurray/Downloads"{'\n'}
                {'\n'}
                {'\n'}
                # this ignores python files{'\n'}
                ignore:{'\n'}
                {'\t'}- "*.py"
                {'\n'}
                {'\n'}
                # operations that happen to files{'\n'}
                rules:{'\n'}{'\n'}
                {'\t'}# this rule copies a file to the location specified in metadata{'\n'}
                {'\t'}- match: "*.txt"{'\n'}
                {'\t'}{'  '}command: cp{'\n'}
                {'\t'}{'  '}args: "{"{{"}filepath{"}}"} {"{{"}location{"}}"}"{'\n'}
                {'\n'}
                {'\t'}# this rule uploads all data (except the ignored stuff) to rinocloud{'\n'}
                {'\t'}- match: "*.log"{'\n'}
                {'\t'}{'  '}command: python{'\n'}
                {'\t'}{'  '}args: parse.py {"{{"}filepath{"}}"}{'\n'}
                {'\n'}
                {'\t'}- match: "*.log"{'\n'}
                {'\t'}{'  '}command: rinocloud-upload{'\n'}
                {'\t'}{'  '}on: add{'\n'}
              </Highlight>

              <h3>rules</h3>

              <p>
                A rule is something that happens to a file when it is created in the watched directory.
                Rule are run sequentially - so always put the upload rule last.
                For example the rule:
              </p>
              <Highlight className='yaml'>
                - match: "*.log"{'\n'}
                {'  '}command: rinocloud-upload{'\n'}
                {'  '}on: add{'\n'}
              </Highlight>

              <p>will add all files ending in <strong>.log</strong> to rinocloud.</p>

              <h3>rules which call other programs</h3>

              <p>
                Rules can be used to call other programs to process data before uploading.
              </p>

              <p>
                This rule will be used to copy a file from the watched directory to somewhere else:
              </p>
              <Highlight className='yaml'>
                - match: "*.txt"{'\n'}
                {'  '}command: cp{'\n'}
                {'  '}args: "{"{{"}filepath{"}}"} {"{{"}location{"}}"}"{'\n'}
              </Highlight>

              <p>
              This rule will send the file through a parser first, and then the data can all be uploaded.
              </p>
              <Highlight className='yaml'>
                # this rule uploads all data (except the ignored stuff) to rinocloud{'\n'}
                - match: "*.log"{'\n'}
                {'  '}command: python{'\n'}
                {'  '}args: parse.py {"{{"}filepath{"}}"}{'\n'}
              </Highlight>

              <h3>adding metadata variables to rules</h3>

              <p>
                If you add a field called metadata to the rino.yaml its will automatically be appended
                to the metadata of the uploaded files
              </p>

              <p>
                You can also use the metadata as variable in the rules by using the notation
                <code>{'{{'}variable name{'}}'} </code>
              </p>

              <p>
                Rinocloud makes some default variables available

                <ul>
                  <li>
                    <code>{'{{'}filename{'}}'} </code> - the name of the file
                  </li>
                  <li>
                    <code>{'{{'}filepath{'}}'} </code> - the absolute path of the file
                  </li>
                  <li>
                    <code>{'{{'}path{'}}'} </code> - relative path to the file from the watched directory. Use this to pass the filename to processing programs
                  </li>
                </ul>
              </p>

            </div>
          </div>
        </div>
      </div>
    );
  }
})
