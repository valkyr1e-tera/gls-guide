module.exports = function GrottoOfLostSoulsGuide(mod) {
  let boss = null
  let power = false
  let level = 0
  
  mod.command.add('gls', () => {
      mod.settings.enabled = !mod.settings.enabled
      mod.command.message(mod.settings.enabled ? 'enabled' : 'disabled')
  })

  function sendMessage(msg) {
    switch (mod.settings.notification_mode) {
      case 'flash':
        mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
          type: 70,
          chat: false,
          channel: 0,
          message: msg
        })
        break
      case 'chat':
        mod.send('S_CHAT', 1, {
          channel: 21, //21 = p-notice, 1 = party
          authorName: mod.options.niceName,
          message: msg
        })
        break
    }
  }

  function reset() {
    boss = null
    power = false
    level = 0
  }

  mod.game.me.on('change_zone', reset)

  mod.hook('S_BOSS_GAGE_INFO', 3, event => {
    if (!mod.settings.enabled)
      return

    if ([782, 982].includes(event.huntingZoneId)) {
      if ([1000, 2000, 3000].includes(event.templateId))
        boss = event
    }

    if (boss && boss.curHp <= 0)
      reset()
  })

  mod.hook('S_ACTION_STAGE', 8, event => {
    if (!mod.settings.enabled || !boss || !event.gameId.equals(boss.id))
      return

    const skillid = event.skill.id
    switch (boss.templateId) {
      case 1000:
        switch (skillid) {
          case 309:
            sendMessage('1 flower')
            break
          case 310:
            sendMessage('2 flowers')
            break
          case 311:
            sendMessage('3 flowers')
            break
          case 312:
            sendMessage('Golden flower')
            break
        }
        break
    
      case 2000:
        switch (skillid) {
          case 301:
            sendMessage('IN -> OUT')
            break
          case 302:
            sendMessage('OUT -> IN')
            break
        }
        break
    
      case 3000:
        if (boss.huntingZoneId === 982) { // Hard Mode
          switch (skillid) {
            case 300: // first awakening
              power = true
              level = 0
              break
            case 360: // electric discharge
              level = 0
              break
            case 399: // second awakening
              level = 0
              break
          }
          if (power) {
            switch (skillid) {
              case 118:
                power = false
                setTimeout(() => {
                  power = true
                }, 4000)
              case 143:
              case 145:
              case 146:
              case 154:
              case 144:
              case 147:
              case 148:
              case 155:
              case 161:
              case 162:
              case 213:
              case 215:
                level++
                sendMessage(String(level))
            }
          }
        }
        break
    }
  })
}