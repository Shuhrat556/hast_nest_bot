const SUPPORTED_LANGS = ['en', 'ru', 'tj'];

const DICT = {
  en: {
    chooseLanguage: 'Please choose your language:',
    languageSet: 'Language saved: English',
    noRooms:
      'No rooms are configured yet. Ask an administrator to add one with:\n/addroom <name> <capacity>',
    selectRoom: 'Select a room:',
    roomSelected: 'Room: {room}\nCapacity: {max}\n\nChoose how many people are present:',
    askReason:
      'Room: {room}\nPresent: {count}/{max}\nMissing: {missing}\n\nPlease write the reason in one message.',
    askReasonPreset: 'Choose a ready reason or write your own:',
    reasonManualPrompt: 'Please write your reason in one message.',
    reportSentFull: 'Report sent. All present.',
    reportSentPartial: 'Report sent. Thank you.',
    invalidRoom: 'Invalid room',
    roomNotFound: 'Room not found',
    invalidCount: 'Invalid count',
    countTooHigh: 'Count exceeds capacity',
    tapStart: 'Please tap /start',
    reasonEmpty: 'Reason cannot be empty.',
    reasonTooLong: 'Reason is too long (max 4000 characters).',
    unknownAction: 'Unknown action',
    reportTitle: 'Attendance report',
    reportRoom: 'Room',
    reportPresent: 'Present',
    reportAllPresent: 'All present',
    reportMissing: 'Missing',
    reportReason: 'Reason',
    reasonPresetOutside: 'Outside the room',
    reasonPresetSick: 'Sick',
    reasonPresetNoReason: 'No reason',
    reasonPresetCustom: 'Write manually',
    reasonPresetOutsideReport: 'Outside the room',
    reasonPresetNoReasonReport: 'No reason',
    adminNotAuthorized: 'You are not authorized to use this command.',
    adminRoomsEmpty: 'No rooms found. Use /setroom to add rooms.',
    adminRoomNotFound: 'Room #{id} was not found.',
    adminRoomDeleted: 'Room #{id} deleted.',
    adminDataCleaned:
      'Data cleaned.\nRenamed: {renamed}\nRemoved duplicates: {removedDuplicates}\nNormalized IDs: {normalizedIds}\nFixed capacities: {fixedCapacities}\nTotal rooms: {totalRooms}',
    adminBroadcastStartBtn: 'Start broadcast',
    adminBroadcastCancelBtn: 'Cancel',
    adminBroadcastPanel:
      'Broadcast panel\n\n1) Press Start broadcast.\n2) Send one message.\n3) The message will be sent to all users who started the bot.',
    adminBroadcastPrompt:
      'Broadcast mode enabled.\n\nSend one message and it will be delivered to all users who started the bot.',
    adminBroadcastCancelled: 'Broadcast cancelled.',
    adminBroadcastEmpty: 'Message cannot be empty.',
    adminBroadcastDone:
      'Broadcast completed.\nTotal: {total}\nSent: {sent}\nFailed: {failed}',
    dailyReminder:
      'Please do your Hast-Nest report for today.\nIt is your daily duty, and your update helps the whole team. Thank you!',
    dailySummaryReminder:
      '22:00 summary: report for {room} is still missing.\nPlease submit your Hast-Nest report now.',
  },
  ru: {
    chooseLanguage: 'Пожалуйста, выберите язык:',
    languageSet: 'Язык сохранен: Русский',
    noRooms:
      'Комнаты пока не настроены. Попросите администратора добавить:\n/addroom <name> <capacity>',
    selectRoom: 'Выберите комнату:',
    roomSelected: 'Комната: {room}\nВместимость: {max}\n\nСколько людей сейчас в комнате?',
    askReason:
      'Комната: {room}\nПрисутствует: {count}/{max}\nОтсутствует: {missing}\n\nНапишите причину одним сообщением.',
    askReasonPreset: 'Выберите готовую причину или напишите свою:',
    reasonManualPrompt: 'Напишите причину одним сообщением.',
    reportSentFull: 'Отчет отправлен. Все на месте.',
    reportSentPartial: 'Отчет отправлен. Спасибо.',
    invalidRoom: 'Неверная комната',
    roomNotFound: 'Комната не найдена',
    invalidCount: 'Неверное количество',
    countTooHigh: 'Количество больше вместимости',
    tapStart: 'Нажмите /start',
    reasonEmpty: 'Причина не может быть пустой.',
    reasonTooLong: 'Причина слишком длинная (макс. 4000 символов).',
    unknownAction: 'Неизвестное действие',
    reportTitle: 'Отчет посещаемости',
    reportRoom: 'Комната',
    reportPresent: 'Присутствует',
    reportAllPresent: 'Все на месте',
    reportMissing: 'Отсутствует',
    reportReason: 'Причина',
    reasonPresetOutside: 'Вне комнаты',
    reasonPresetSick: 'Болен',
    reasonPresetNoReason: 'Без причины',
    reasonPresetCustom: 'Написать вручную',
    reasonPresetOutsideReport: 'Вне комнаты',
    reasonPresetNoReasonReport: 'Без причины',
    adminNotAuthorized: 'У вас нет доступа к этой команде.',
    adminRoomsEmpty: 'Комнаты не найдены. Используйте /setroom для добавления.',
    adminRoomNotFound: 'Комната #{id} не найдена.',
    adminRoomDeleted: 'Комната #{id} удалена.',
    adminDataCleaned:
      'Данные очищены.\nПереименовано: {renamed}\nУдалено дубликатов: {removedDuplicates}\nНормализовано ID: {normalizedIds}\nИсправлено вместимостей: {fixedCapacities}\nВсего комнат: {totalRooms}',
    adminBroadcastStartBtn: 'Начать рассылку',
    adminBroadcastCancelBtn: 'Отмена',
    adminBroadcastPanel:
      'Панель рассылки\n\n1) Нажмите "Начать рассылку".\n2) Отправьте одно сообщение.\n3) Сообщение получат все пользователи, которые запускали бота.',
    adminBroadcastPrompt:
      'Режим рассылки включен.\n\nОтправьте одно сообщение, и оно будет доставлено всем пользователям, запустившим бота.',
    adminBroadcastCancelled: 'Рассылка отменена.',
    adminBroadcastEmpty: 'Сообщение не может быть пустым.',
    adminBroadcastDone:
      'Рассылка завершена.\nВсего: {total}\nОтправлено: {sent}\nОшибок: {failed}',
    dailyReminder:
      'Пожалуйста, сделайте сегодня отчет Hast-Nest.\nЭто ваша ежедневная задача, и ваш отчет важен для всей команды. Спасибо!',
    dailySummaryReminder:
      'Сводка 22:00: отчет по {room} еще не сдан.\nПожалуйста, отправьте ваш Hast-Nest отчет сейчас.',
  },
  tj: {
    chooseLanguage: 'Лутфан забонро интихоб кунед:',
    languageSet: 'Забон нигоҳ дошта шуд: Тоҷикӣ',
    noRooms:
      'Ҳоло ҳуҷраҳо танзим нашудаанд. Аз маъмур хоҳиш кунед:\n/addroom <name> <capacity>',
    selectRoom: 'Ҳуҷраро интихоб кунед:',
    roomSelected: 'Ҳуҷра: {room}\nИқтидор: {max}\n\nЧанд нафар ҳозир ҳастанд?',
    askReason:
      'Ҳуҷра: {room}\nҲозир: {count}/{max}\nНамерасад: {missing}\n\nСабабро дар як паём нависед.',
    askReasonPreset: 'Сабаби тайёрро интихоб кунед ё худатон нависед:',
    reasonManualPrompt: 'Сабабро дар як паём нависед.',
    reportSentFull: 'Ҳисобот фиристода шуд. Ҳама ҳозир.',
    reportSentPartial: 'Ҳисобот фиристода шуд. Раҳмат.',
    invalidRoom: 'Ҳуҷраи нодуруст',
    roomNotFound: 'Ҳуҷра ёфт нашуд',
    invalidCount: 'Шумораи нодуруст',
    countTooHigh: 'Шумора аз иқтидор зиёд аст',
    tapStart: 'Лутфан /start-ро пахш кунед',
    reasonEmpty: 'Сабаб набояд холӣ бошад.',
    reasonTooLong: 'Сабаб хеле дароз аст (макс. 4000 рамз).',
    unknownAction: 'Амали номаълум',
    reportTitle: 'Ҳисоботи ҳозиршавӣ',
    reportRoom: 'Ҳуҷра',
    reportPresent: 'Ҳозир',
    reportAllPresent: 'Ҳама ҳозир',
    reportMissing: 'Намерасад',
    reportReason: 'Сабаб',
    reasonPresetOutside: 'Берун аз ҳуҷра',
    reasonPresetSick: 'Бемор аст',
    reasonPresetNoReason: 'Бе сабаб',
    reasonPresetCustom: 'Худам менависам',
    reasonPresetOutsideReport: 'Берун аз ҳуҷра',
    reasonPresetNoReasonReport: 'Бе сабаб',
    adminNotAuthorized: 'Шумо барои ин фармон иҷозат надоред.',
    adminRoomsEmpty: 'Ҳуҷраҳо ёфт нашуданд. Барои илова /setroom-ро истифода баред.',
    adminRoomNotFound: 'Ҳуҷраи #{id} ёфт нашуд.',
    adminRoomDeleted: 'Ҳуҷраи #{id} ҳазф шуд.',
    adminDataCleaned:
      'Маълумот тоза шуд.\nНомивазкунӣ: {renamed}\nНестшудаи такрорӣ: {removedDuplicates}\nID-и муътадилшуда: {normalizedIds}\nИқтидорҳои ислоҳшуда: {fixedCapacities}\nҲамагӣ ҳуҷраҳо: {totalRooms}',
    adminBroadcastStartBtn: 'Оғози паҳнкунӣ',
    adminBroadcastCancelBtn: 'Бекор кардан',
    adminBroadcastPanel:
      'Панели паҳнкунӣ\n\n1) "Оғози паҳнкунӣ"-ро пахш кунед.\n2) Як паём фиристед.\n3) Паём ба ҳамаи корбароне, ки ботро оғоз кардаанд, меравад.',
    adminBroadcastPrompt:
      'Ҳолати паҳнкунӣ фаъол шуд.\n\nЯк паём фиристед ва он ба ҳамаи корбароне, ки ботро оғоз кардаанд, ирсол мешавад.',
    adminBroadcastCancelled: 'Паҳнкунӣ бекор шуд.',
    adminBroadcastEmpty: 'Паём набояд холӣ бошад.',
    adminBroadcastDone:
      'Паҳнкунӣ анҷом ёфт.\nҲамагӣ: {total}\nФиристода шуд: {sent}\nХатоҳо: {failed}',
    dailyReminder:
      'Лутфан имрӯз ҳисоботи Hast-Nest-ро иҷро кунед.\nИн вазифаи ҳаррӯзаи шумост ва хабар додани шумо барои тамоми даста муҳим аст. Раҳмат!',
    dailySummaryReminder:
      'Хулосаи 22:00: ҳисобот барои {room} ҳанӯз супорида нашудааст.\nЛутфан ҳозир ҳисоботи Hast-Nest-ро супоред.',
  },
};

function normalizeLang(lang) {
  if (SUPPORTED_LANGS.includes(lang)) return lang;
  return 'en';
}

function t(lang, key, vars = {}) {
  const safeLang = normalizeLang(lang);
  const text = DICT[safeLang][key] || DICT.en[key] || key;
  return text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}

module.exports = {
  SUPPORTED_LANGS,
  normalizeLang,
  t,
};
