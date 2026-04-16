const SUPPORTED_LANGS = ['en', 'ru', 'tj'];

const DICT = {
  en: {
    chooseLanguage: '🌐 Please choose your language:',
    languageSet: '✅ Language saved: English',
    noRooms:
      'No rooms are configured yet. Ask an administrator to add one with:\n/addroom <name> <capacity>',
    selectRoom: '🏢 Select a room:',
    roomSelected: '🏠 Room: {room}\n👥 Capacity: {max}\n\nChoose how many people are present:',
    askReason:
      '🏠 Room: {room}\n👥 Present: {count}/{max}\n❌ Missing: {missing}\n\n✍️ Please write the reason in one message.',
    askReasonPreset: '👇 Choose a ready reason or write your own:',
    reasonManualPrompt: '✍️ Please write your reason in one message.',
    reportSentFull: '✅ Report sent. All present.',
    reportSentPartial: '✅ Report sent. Thank you.',
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
    reasonPresetNoReason: 'No reason provided',
    reasonPresetCustom: 'Write manually',
    dailyReminder:
      '🌟 Please do your Hast-Nest report for today.\nIt is your daily duty, and your update helps the whole team. Thank you!',
  },
  ru: {
    chooseLanguage: '🌐 Пожалуйста, выберите язык:',
    languageSet: '✅ Язык сохранен: Русский',
    noRooms:
      'Комнаты пока не настроены. Попросите администратора добавить:\n/addroom <name> <capacity>',
    selectRoom: '🏢 Выберите комнату:',
    roomSelected: '🏠 Комната: {room}\n👥 Вместимость: {max}\n\nСколько людей сейчас в комнате?',
    askReason:
      '🏠 Комната: {room}\n👥 Присутствует: {count}/{max}\n❌ Отсутствует: {missing}\n\n✍️ Напишите причину одним сообщением.',
    askReasonPreset: '👇 Выберите готовую причину или напишите свою:',
    reasonManualPrompt: '✍️ Напишите причину одним сообщением.',
    reportSentFull: '✅ Отчет отправлен. Все на месте.',
    reportSentPartial: '✅ Отчет отправлен. Спасибо.',
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
    reasonPresetOutside: 'Вышел из комнаты',
    reasonPresetSick: 'Болен',
    reasonPresetNoReason: 'Без причины',
    reasonPresetCustom: 'Написать вручную',
    dailyReminder:
      '🌟 Пожалуйста, сделайте сегодня отчет Hast-Nest.\nЭто ваша ежедневная задача, и ваш отчет важен для всей команды. Спасибо!',
  },
  tj: {
    chooseLanguage: '🌐 Лутфан забонро интихоб кунед:',
    languageSet: '✅ Забон нигоҳ дошта шуд: Тоҷикӣ',
    noRooms:
      'Ҳоло ҳуҷраҳо танзим нашудаанд. Аз маъмур хоҳиш кунед:\n/addroom <name> <capacity>',
    selectRoom: '🏢 Ҳуҷраро интихоб кунед:',
    roomSelected: '🏠 Ҳуҷра: {room}\n👥 Иқтидор: {max}\n\nЧанд нафар ҳозир ҳастанд?',
    askReason:
      '🏠 Ҳуҷра: {room}\n👥 Ҳозир: {count}/{max}\n❌ Намерасад: {missing}\n\n✍️ Сабабро дар як паём нависед.',
    askReasonPreset: '👇 Сабаби тайёрро интихоб кунед ё худатон нависед:',
    reasonManualPrompt: '✍️ Сабабро дар як паём нависед.',
    reportSentFull: '✅ Ҳисобот фиристода шуд. Ҳама ҳозир.',
    reportSentPartial: '✅ Ҳисобот фиристода шуд. Раҳмат.',
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
    reasonPresetOutside: 'Аз ҳуҷра баромадааст',
    reasonPresetSick: 'Бемор аст',
    reasonPresetNoReason: 'Бе сабаб навишта шуд',
    reasonPresetCustom: 'Худам менависам',
    dailyReminder:
      '🌟 Лутфан имрӯз ҳисоботи Hast-Nest-ро иҷро кунед.\nИн вазифаи ҳаррӯзаи шумост ва хабар додани шумо барои тамоми даста муҳим аст. Раҳмат!',
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
