const requireFunc =
  typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require
const path = require('path')
const merge = require('merge')
const through2 = require('through2')
const gulpUtil = require('gulp-util')
const tpl = require('art-template')
const reload = require('require-reload')(requireFunc)

const PLUGIN_NAME = 'gulp-jsart'
const PluginError = gulpUtil.PluginError
const ext = gulpUtil.replaceExtension

module.exports = function(options) {
  options = merge.recursive(true, { mode: 'dev' }, options || {})

  const stream = through2.obj(function(file, enc, cb) {
    // [Verify] 空数据格式验证
    if (file.isNull()) return cb(null, file)

    // [Verify] stream格式验证
    if (file.isStream()) {
      const msg = 'Streaming not supported!'
      throw new PluginError(PLUGIN_NAME, msg)
    }

    const fileExt = path.extname(file.path)
    if (fileExt !== '.art') return cb(null, file)

    let art = file.contents.toString()
    let data = {}
    const fileDir = path.dirname(file.path)
    const dataTag = art.match(/\<import\_art\_data src\=\"([\S]+)\" \/\>{1}/)

    if (dataTag && dataTag.length >= 1) {
      const dataPath = path.join(fileDir, dataTag[1])
      if (options.mode === 'prod') data = requireFunc(dataPath)
      if (options.mode === 'dev') data = reload(dataPath)
      art = art.replace(dataTag[0], '')
    }

    let html = tpl.render(art, data, { root: fileDir })
    if (options.rep) {
      for (let a in options.rep) {
        const reg = new RegExp(a, 'g')
        html = html.replace(reg, options.rep[a])
      }
    }

    file.path = ext(file.path, '.html')
    file.contents = Buffer.from(html)

    cb(null, file)
  })
  return stream
}
