import React, { PropTypes } from 'react'
import markdownIt from 'markdown-it'
import markdownKatex from 'markdown-it-katex'
import Plugin from 'markdown-it-regexp'

const md = markdownIt({
  linkify: true,
  html: true
})

const defaultImageRender = md.renderer.rules.image

const defaultLinkRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}

md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const rinoImageRegex = /rino\/(\w+)/

  const token = tokens[idx]
  const aIndex = token.attrIndex('src')
  if (rinoImageRegex.test(token.attrs[aIndex][1])) {
    const id = token.attrs[aIndex][1].match(rinoImageRegex)[1]
    const url = `/api/1/files/download/?id=${id}`
    return `<img style="width: auto max-width: 100%" class="loading" src="${url}"/>`
  }
  return defaultImageRender(tokens, idx, options, env, self)
}

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const rinoLinkRegex = /rino\/(\w+)/

  const token = tokens[idx]
  const aIndex = token.attrIndex('href')

  if (rinoLinkRegex.test(token.attrs[aIndex][1])) {
    const match = token.attrs[aIndex][1].match(rinoLinkRegex)[1]
    token.attrs[aIndex][1] = `/redirecter/${match}`
  }
  return defaultLinkRender(tokens, idx, options, env, self)
}

const rinoHashtag = new Plugin(/#(\w+)/,
  (match, utils) => {
    const url = `/redirecter/${match[1]}`
    return `<a href="${utils.escape(url)}">${utils.escape(`#${match[1]}`)}</a>`
  }
)

md
  .use(rinoHashtag)
  .use(markdownKatex)

export const MarkdownRenderer = (props) => {
  let html = ''
  if (props.content) {
    html = md.render(props.content)
  }
  return <div dangerouslySetInnerHTML={{ __html: html }}></div>
}


MarkdownRenderer.propTypes = {
  content: PropTypes.string
}
