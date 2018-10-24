module.exports = function GrottoOfLostSoulsGuide(mod) {
  let boss = null
  let power = false
  let level = 0

  mod.command.add('gls', {
    $default() {
      mod.settings.enabled = !mod.settings.enabled
      mod.command.message(mod.settings.enabled ? 'enabled' : 'disabled')
    },
    party() {
      mod.settings.sendToParty = !mod.settings.sendToParty
      mod.command.message(mod.settings.sendToParty ? 'Messages will be sent to the party.' : 'Only you will see messages.')
    }
  })

  function sendMessage(msg) {
    mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
      type: 70,
      chat: false,
      channel: 0,
      message: msg
    })
  }
  function sendPartyNotice(msg) {
    if (mod.settings.sendToParty) {
      mod.send('C_CHAT', 1, {
        channel: 1,
        message: msg
      })
    } else {
      mod.send('S_CHAT', 1, {
        channel: 21, //21 = p-notice, 1 = party
        authorName: mod.options.niceName,
        message: msg
      })
    }
  }

  mod.game.me.on('change_zone', () => {
    power = false
  })

  mod.hook('S_BOSS_GAGE_INFO', 3, event => {
    if (!mod.settings.enabled)
      return

    if ([782, 982].includes(event.huntingZoneId)) {
      if ([1000, 2000, 3000].includes(event.templateId))
        boss = event
    }

    if (boss && boss.curHp <= 0)
      boss = null
  })

  mod.hook('S_ACTION_STAGE', 8, event => {
    if (!mod.settings.enabled || !boss || !event.gameId.equals(boss.id))
      return

    const skillid = event.skill.id
    switch (boss.templateId) {
      case 1000:
        switch (skillid) {
          case 1309:
            sendMessage('1 flower')
            break
          case 1310:
            sendMessage('2 flowers')
            break
          case 1312:
            sendMessage('Golden flower')
            break
        }
        break

      case 2000:
        switch (skillid) {
          case 1301:
            sendMessage('OUT -> IN')
            break
          case 1302:
            sendMessage('IN -> OUT')
            break
        }
        break

      case 3000:
        if (boss.huntingZoneId === 982) { // Hard Mode
          switch (skillid) {
            case 1300: // first awakening
              power = true
              level = 0
              break
            case 1360: // electric discharge
              level = 0
              sendMessage('Electric Discharge')
              break
            case 1399: // second awakening
              level = 0
              break
          }

          if (power) {
            switch (skillid % 1000) {
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
                sendPartyNotice(String(level))
            }
          }
        }
        break
    }
  })
}