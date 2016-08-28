
import pt from 'path'
import map from 'lodash/map'
import keys from 'lodash/keys'
import flatten from 'lodash/flatten'

export default (data) => {
  // flatten out the entire path list, use this to get indices
  const fullyResolvedPaths = flatten(
    map(data, (relPaths, basePath) =>
      map(relPaths, relPath => pt.join(basePath, relPath))
    )
  )

  /*
    takes the getWatched list and returns a flat list of the form
    [
      [fullPath, index of parent],
      ...
    ]
    where the index of parent will be used to create the nested list
  */
  const flatLinked = flatten(map(data, (relPaths, basePath) =>
    map(relPaths, (relPath) => ([
      pt.join(basePath, relPath),
      fullyResolvedPaths.indexOf(basePath)
    ])
    )
  ))

  /*
    takes the flatLinked and creates nested list
  */
  const makeTree = (arr) => {
    const treeArr = new Array(arr.length)
    for (let i = 0, len = arr.length; i < len; i++) {
      const arrI = arr[i]
      let newNode
      if (keys(data).includes(arrI[0])) {
        newNode = treeArr[i] = {
          name: arrI[0],
          children: []
        }
      } else {
        newNode = treeArr[i] = {
          name: arrI[0]
        }
      }

      const parentI = arrI[1]
      if (parentI > -1 && treeArr[parentI].children) {
        treeArr[parentI].children.push(newNode)
      }
    }
    return treeArr[0]
  }

  const _files = makeTree(flatLinked)
  return [{
    name: _files.name,
    children: _files.children
  }]
}
