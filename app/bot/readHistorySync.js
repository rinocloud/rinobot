import fs from 'fs-extra'
import _ from 'lodash'

export default (historyFilePath) => {
  try {
      const data = fs.readFileSync(historyFilePath, 'utf8')
      return JSON.parse(data)
   } catch (err) {
      return {}
   }
}
