/* global $, localStorage, alert */

const comms = ['cat', 'help', 'cd', 'clear', 'history', 'ls', 'path']
const dirs = {
  'root': ['about.txt', 'projects', 'skills', 'contact.txt', 'resume.txt'],
  'projects': ['nodemessage.txt', 'slack_automation.txt', 'map.txt', 'dotify.txt'],
  'skills': ['proficient.txt', 'familiar.txt', 'learning.txt']
}

class Shell {
  constructor (term, commands) {
    this.commands = commands
    this.setupListeners(term)
    this.term = term

    localStorage.directory = 'root'
    localStorage.history = JSON.stringify('')

    $('.input').focus()
  }

  setupListeners (term) {
    $('#terminal').mouseup(() => {
      $('.input').last().focus()
    })

    term.addEventListener('keyup', (evt) => {
      const keyUp = 38
      const keyDown = 40
      const key = evt.keyCode

      if ([keyUp, keyDown].includes(key)) {
        let history = localStorage.history
        history = history ? Object.values(JSON.parse(history)) : []

        if (key === keyUp && localStorage.historyIndex >= 0) {
          $('.input').last().html(`${history[localStorage.historyIndex]}<span class="end"><span>`)
          localStorage.historyIndex -= 1
        } else if (key === keyDown && localStorage.historyIndex < history.length) {
          $('.input').last().html(history[localStorage.historyIndex])
          localStorage.historyIndex += 1
        }
        evt.preventDefault()
        $('.end').focus()
      }
    })

    term.addEventListener('keydown', (evt) => {
      const match = (val) => val != null ? filter(val) : ''

      // a tab is pressed
      if (evt.keyCode === 9) {
        evt.preventDefault()
        const content = $('.input').last().html()
        const matched = match(content)
        if (content !== matched && matched !== '') {
          $('.input').last().html(matched)
        }
      }
    })

    term.addEventListener('keypress', (evt) => {
      if (evt.keyCode === 13) {
        localStorage.historyIndex = 0
        const prompt = evt.target
        const input = prompt.textContent.trim().split(' ')
        const cmd = input[0]
        const args = input[1]

        if (cmd === 'clear') {
          this.clearConsole()
        } else if (cmd && cmd in this.commands) {
          this.runCommand(cmd, args)
          this.resetPrompt(term, prompt)
          $('.root').last().html(localStorage.directory)
        } else {
          this.term.innerHTML += 'Error: command not recognized'
          this.resetPrompt(term, prompt)
        }
        evt.preventDefault()
      }
    })
  }

  runCommand (cmd, args) {
    const command = args ? `${cmd} ${args}` : cmd
    this.updateHistory(command)

    const output = this.commands[cmd](args)
    if (output) { this.term.innerHTML += output }
  }

  resetPrompt (term, prompt) {
    const newPrompt = prompt.parentNode.cloneNode(true)
    prompt.setAttribute('contenteditable', false)
    if (this.prompt) {
      newPrompt.querySelector('.prompt').textContent = this.prompt
    }
    term.appendChild(newPrompt)
    newPrompt.querySelector('.input').innerHTML = ''
    newPrompt.querySelector('.input').focus()
  }

  updateHistory (command) {
    let history = localStorage.history
    history = history ? Object.values(JSON.parse(history)) : []

    history.push(command)
    localStorage.history = JSON.stringify(history)
    localStorage.historyIndex = history.length - 1
  }

  clearConsole () {
    $('#terminal').html(
      `<p class="hidden">
        <span class="prompt">
          <span class="root">root</span>
          <span class="tick">❯</span>
        </span>
        <span contenteditable="true" class="input"></span>
      </p>`
    )
    $('.input').focus()
  }
}

function filter (part) {
  const currDir = dirs[localStorage.directory]
  const matcher = new RegExp(['^', part].join(''), 'i')

  const filterer = (arr) => {
    return arr.filter(val => {
      const str = val.toString()
      try {
        return (matcher.exec(str)) ? str.substring(part.length - 1, str.length - 1) : null
      } catch (err) {
        alert(err)
      }
    })
  }
  return (filterer(comms) !== null) ? filterer(comms) : filterer(currDir)
}
