module.exports = {

  overrideLog(callback) {
    console.oldlog = console.log
    
    console.log = function(text) {
      console.oldlog(text)
      callback(text)
    } 
  },

  overrideError(callback) {
    console.olderror = console.error

    console.error = function(text) {
      console.olderror(text)
      callback(text)
    }
  },
  
  //Found on StackOverflow and changed a bit, don't know how it works :)
  parseName(str) {
    return str.replace(/(?!\w|\s)./g, '')
      .replace(/\s+/g, '-')
      .replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2')
  },
  compare(a, b, key) {
    return b[key] - a[key]
  }
}