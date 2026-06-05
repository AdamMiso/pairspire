export const languages = ['sk', 'en'] as const
export type Language = (typeof languages)[number]

export const languageCookie = 'pairspire-language'

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && languages.includes(value as Language)
}

export function formatPlayerCount(count: number, lang: Language) {
  if (lang === 'en') return `${count} ${count === 1 ? 'player' : 'players'}`
  return `${count} ${count === 1 ? 'hráč' : count > 1 && count < 5 ? 'hráči' : 'hráčov'}`
}

export function formatRoundCount(count: number, lang: Language) {
  if (lang === 'en') return `${count} ${count === 1 ? 'round' : 'rounds'}`
  return `${count} ${count === 1 ? 'kolo' : 'kôl'}`
}

export function formatSuggestedRoundCount(count: number, lang: Language) {
  if (lang === 'en') return `${count} ${count === 1 ? 'round' : 'rounds'}`
  return `${count} ${count === 1 ? 'kolo' : 'kolá'}`
}

export function formatResultCount(count: number, lang: Language) {
  if (lang === 'en') return `${count} ${count === 1 ? 'result' : 'results'}`
  return `${count} ${count === 1 ? 'výsledok' : count > 1 && count < 5 ? 'výsledky' : 'výsledkov'}`
}

export function localeForLanguage(lang: Language) {
  return lang === 'en' ? 'en-US' : 'sk-SK'
}

export function translateServerError(message: string, lang: Language, fallback: string) {
  if (lang === 'sk') return message || fallback

  const exactMessages: Record<string, string> = {
    'Turnaj sa nenašiel': 'Tournament was not found',
    'Hráč sa nenašiel': 'Player was not found',
    'Všetky kolá už boli ukončené': 'All rounds have already been completed',
    'Na spustenie kola sú potrební aspoň 2 aktívni hráči': 'At least 2 active players are required to start a round',
    'Partia sa nenašla': 'Game was not found',
    'Pre partiu s voľnom nie je možné zapísať výsledok': 'A result cannot be recorded for a bye game',
    'Revízia sa nenašla': 'Revision was not found',
  }

  return exactMessages[message] ?? fallback
}

export function translateRevisionAction(action: string, lang: Language) {
  if (lang === 'sk') return action

  const exactActions: Record<string, string> = {
    'Vytvorený turnaj': 'Tournament created',
    'Aktualizované nastavenia turnaja': 'Tournament settings updated',
    'Turnaj ukončený': 'Tournament completed',
  }

  if (exactActions[action]) return exactActions[action]

  const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^Pridaný hráč: (.+)$/, (match) => `Player added: ${match[1]}`],
    [/^Aktualizovaný hráč: (.+)$/, (match) => `Player updated: ${match[1]}`],
    [/^Odstránený hráč: (.+)$/, (match) => `Player removed: ${match[1]}`],
    [/^Spustené kolo (\d+)$/, (match) => `Round ${match[1]} started`],
    [/^Ukončené kolo (\d+)$/, (match) => `Round ${match[1]} completed`],
    [/^Zapísaný výsledok na šachovnici (\d+)$/, (match) => `Result recorded on board ${match[1]}`],
    [/^Obnovené na revíziu (\d+)$/, (match) => `Restored to revision ${match[1]}`],
  ]

  for (const [pattern, translate] of patterns) {
    const match = action.match(pattern)
    if (match) return translate(match)
  }

  return action
}

export const translations = {
  sk: {
    app: {
      title: 'Pairspire - Správca šachových turnajov',
      description: 'Jednoduchá správa šachových turnajov švajčiarskym systémom. Vytvárajte turnaje, spravujte párovania a sledujte poradie.',
    },
    common: {
      language: 'Jazyk',
      slovak: 'Slovenčina',
      english: 'English',
      rules: 'Pravidlá',
      newTournament: 'Nový turnaj',
      new: 'Nový',
      round: 'Kolo',
      rounds: 'Kolá',
      players: 'Hráči',
      standings: 'Poradie',
      date: 'Dátum',
      progress: 'Postup',
      active: 'Prebieha',
      closed: 'Uzavreté',
      setup: 'Nastavenie',
      complete: 'Ukončený',
      bye: 'Voľno',
      unknown: 'Neznámy',
      vs: 'proti',
      recorded: 'Zapísané',
      cancel: 'Zrušiť',
      delete: 'Vymazať',
      restore: 'Obnoviť',
      optional: 'voliteľné',
    },
    home: {
      title: 'Turnaje',
      intro: 'Jednoduchá správa švajčiarskych šachových turnajov: súpiska, párovania, výsledky a poradie na jednom mieste.',
      tournaments: 'Turnaje',
      activeTournaments: 'Prebiehajú',
      totalPlayers: 'Hráči spolu',
      emptyTitle: 'Zatiaľ žiadne turnaje',
      emptyDescription: 'Vytvorte prvý turnaj, vložte súpisku hráčov a aplikácia sa postará o párovania, výsledky aj poradie.',
      createTournament: 'Vytvoriť turnaj',
      tournamentProgress: 'Postup turnaja',
      openTournament: 'Otvoriť turnaj',
    },
    create: {
      back: 'Späť na turnaje',
      title: 'Vytvoriť turnaj',
      description: 'Najrýchlejšia cesta: pomenujte turnaj, vložte zoznam hráčov a spustite prvé kolo na ďalšej obrazovke.',
      details: 'Detaily turnaja',
      name: 'Názov turnaja',
      namePlaceholder: 'napr. Piatkový klubový turnaj',
      rounds: 'Počet kôl',
      roundsPlaceholder: 'Vyberte počet kôl',
      recommendation: (players: number, rounds: number) => `Pre ${formatPlayerCount(players, 'sk')} odporúčame približne ${formatSuggestedRoundCount(rounds, 'sk')}.`,
      byePoints: 'Body za voľno',
      byePointsPlaceholder: 'Vyberte body za voľno',
      halfPoint: '0,5 bodu',
      onePoint: '1 bod',
      playersDescription: 'Každý riadok je jeden hráč. Poradie riadkov je nasadenie.',
      randomSeeding: 'Náhodné nasadenie',
      playerList: 'Zoznam hráčov',
      playerPlaceholder: 'Anna Nováková\nBoris Kováč\nCyril Horváth\nDana Šimková',
      playersReady: (count: number) => `${formatPlayerCount(count, 'sk')} pripravených`,
      randomizedHint: 'Nasadenie sa zamieša pri vytvorení.',
      seededHint: 'Prvý riadok bude prvý nasadený.',
      creating: 'Vytváranie...',
      whatNext: 'Čo bude ďalej',
      whatNextDescription: 'Po vytvorení uvidíte poradie, hráčov a ovládanie turnaja na jednej obrazovke. Prvé kolo spustíte jedným tlačidlom.',
      rosterHint: 'Ak ešte neviete kompletnú súpisku, vytvorte turnaj s minimálne dvoma hráčmi a ďalších doplníte cez odkaz na prihlásenie.',
      errors: {
        minPlayers: 'Zadajte aspoň 2 hráčov',
        createFailed: 'Nepodarilo sa vytvoriť turnaj',
      },
    },
    tournament: {
      playerLink: 'Odkaz pre hráčov',
      activePlayers: 'Aktívni hráči',
      completedRounds: 'Dokončené kolá',
      leader: 'Líder',
      noRoundTitle: 'Žiadne kolo ešte nebeží',
      noRoundDescription: 'Skontrolujte súpisku hráčov a v paneli ovládania spustite prvé kolo.',
      nextStepComplete: 'Turnaj je ukončený. Skontrolujte finálne poradie alebo obnovte staršiu revíziu.',
      nextStepPending: (count: number) => `Zapíšte ${formatResultCount(count, 'sk')} v aktuálnom kole.`,
      nextStepNeedsPlayers: 'Pridajte aspoň dvoch aktívnych hráčov, aby sa dalo spustiť prvé kolo.',
      nextStepReady: (round: number) => `Turnaj je pripravený na kolo ${round}.`,
    },
    controls: {
      title: 'Ovládanie turnaja',
      activePlayers: (count: number) => `${count} aktívnych`,
      byePoints: 'Body za voľno',
      completeMessage: 'Turnaj je ukončený!',
      starting: 'Spúšťam kolo...',
      finishRound: (round: number) => `Dokončiť kolo ${round}`,
      startRound: (round: number) => `Spustiť kolo ${round}`,
      needsPlayers: 'Na spustenie sú potrební aspoň 2 aktívni hráči.',
      needsResults: 'Na pokračovanie zapíšte všetky výsledky aktuálneho kola.',
      deleteTournament: 'Vymazať turnaj',
      deleteTitle: 'Vymazať turnaj',
      deleteDescription: (name: string) => `Naozaj chcete vymazať „${name}“? Túto akciu nemožno vrátiť späť.`,
      startFailed: 'Nepodarilo sa spustiť kolo',
    },
    standings: {
      emptyTitle: 'Zatiaľ žiadni hráči',
      emptyDescription: 'Pridajte hráčov a poradie sa začne počítať automaticky.',
      rank: 'Por.',
      player: 'Hráč',
      points: 'Body',
      wins: 'V',
      draws: 'R',
      losses: 'P',
      withdrawn: 'Odstúpil',
    },
    playerManagement: {
      name: 'Meno hráča',
      newPlayer: 'Nový hráč',
      add: 'Pridať',
      noPlayers: 'Nenašli sa žiadni hráči. Prosím, vytvorte turnaj znova.',
      seed: 'Nas.',
      status: 'Stav',
      active: 'Aktívny',
      withdrawn: 'Odstúpil',
      withdrawPlayer: (name: string) => `Odstúpiť hráča ${name}`,
      restorePlayer: (name: string) => `Obnoviť hráča ${name}`,
      withdrawTitle: 'Odstúpiť hráča',
      restoreTitle: 'Obnoviť hráča',
      errors: {
        nameRequired: 'Zadajte meno hráča',
        addFailed: 'Nepodarilo sa pridať hráča',
        updateFailed: 'Nepodarilo sa zmeniť stav hráča',
      },
    },
    join: {
      back: 'Späť na turnaj',
      title: 'Prihlásiť sa do turnaja',
      description: 'Zadajte meno a voliteľné Elo. Organizátor vás potom uvidí v zozname hráčov.',
      name: 'Vaše meno',
      namePlaceholder: 'Zadajte svoje meno',
      rating: 'Elo (voliteľné)',
      ratingPlaceholder: 'napr. 1500',
      ratingHelp: 'Vaše šachové Elo (FIDE, USCF alebo odhad)',
      joining: 'Prihlasovanie...',
      join: 'Prihlásiť sa',
      error: 'Nepodarilo sa prihlásiť do turnaja',
    },
    history: {
      title: 'História',
      empty: 'Zatiaľ bez histórie',
      restoreTitle: 'Obnoviť revíziu',
      restoreDescription: (action: string) => `Turnaj sa obnoví do stavu pri akcii „${action}“. Táto akcia vytvorí nový bod revízie.`,
    },
    rules: {
      badge: 'Sprievodca',
      title: 'Pravidlá turnaja švajčiarskym systémom',
      intro: 'Praktický prehľad toho, ako aplikácia páruje hráčov, počíta výsledky a rozhoduje poradie.',
      whatTitle: 'Čo je turnaj švajčiarskym systémom?',
      whatBody: 'Turnaj švajčiarskym systémom je nevyraďovací formát so stanoveným počtom kôl, ktorý je výrazne nižší než pri turnaji každý s každým. V švajčiarskom turnaji nehrá každý účastník proti každému. Hráči sa v každom kole stretávajú jeden na jedného a párujú sa podľa pravidiel, ktoré zabezpečujú súperov s podobným priebežným skóre, no bez opakovania rovnakého súpera.',
      pairingTitle: 'Pravidlá párovania',
      pairingRules: [
        'Hráči s rovnakým skóre sa párujú spolu, ak je to možné',
        'Žiadny hráč nemôže v turnaji naraziť na rovnakého súpera dvakrát',
        'Farby (biela/čierna) sa prideľujú tak, aby sa vyvažovala história farieb hráča',
        'Ak je nepárny počet hráčov, voľno dostane najnižšie bodujúci hráč, ktorý ho ešte nemal',
        'Ak existuje viac platných párovaní, prednosť majú hráči s vyšším ratingom',
      ],
      scoringTitle: 'Bodovací systém',
      win: 'Výhra',
      draw: 'Remíza',
      loss: 'Prehra',
      tiebreakTitle: 'Pomocné hodnotenia',
      tiebreakIntro: 'Keď majú hráči rovnaké skóre, použijú sa tieto pomocné hodnotenia v tomto poradí:',
      buchholz: 'Buchholzovo skóre',
      buchholzDescription: 'Súčet bodov súperov. Vyššia hodnota je lepšia, pretože znamená silnejších súperov.',
      winsCount: 'Počet výhier',
      winsDescription: 'Viac výhier znamená rozhodnejšiu hru.',
      eloDescription: 'Vyššie hodnotený hráč sa umiestni vyššie, ak sú ostatné kritériá rovnaké.',
      byeTitle: 'Pravidlá voľna (bye)',
      byeBody1: 'Voľno sa udeľuje, keď je v kole nepárny počet aktívnych hráčov. Hráč s voľnom v danom kole nehrá, ale získa body (typicky 1 bod, teda ako za výhru).',
      byeBody2: 'Voľno dostane najnižšie bodujúci hráč, ktorý ho ešte predtým nedostal. Ak už voľno mali všetci hráči, dostane ho najnižšie bodujúci hráč.',
      recommendedTitle: 'Odporúčaný počet kôl',
      recommendedIntro: 'Optimálny počet kôl závisí od počtu hráčov:',
      formula: 'Vzorec: počet kôl = ceiling(log2(počet hráčov)) pre zaručeného jednoznačného víťaza',
    },
  },
  en: {
    app: {
      title: 'Pairspire - Chess Tournament Manager',
      description: 'Simple Swiss-system chess tournament management. Create tournaments, manage pairings, and track standings.',
    },
    common: {
      language: 'Language',
      slovak: 'Slovenčina',
      english: 'English',
      rules: 'Rules',
      newTournament: 'New tournament',
      new: 'New',
      round: 'Round',
      rounds: 'Rounds',
      players: 'Players',
      standings: 'Standings',
      date: 'Date',
      progress: 'Progress',
      active: 'In progress',
      closed: 'Closed',
      setup: 'Setup',
      complete: 'Complete',
      bye: 'Bye',
      unknown: 'Unknown',
      vs: 'vs',
      recorded: 'Recorded',
      cancel: 'Cancel',
      delete: 'Delete',
      restore: 'Restore',
      optional: 'optional',
    },
    home: {
      title: 'Tournaments',
      intro: 'Simple Swiss-system chess tournament management: roster, pairings, results, and standings in one place.',
      tournaments: 'Tournaments',
      activeTournaments: 'In progress',
      totalPlayers: 'Total players',
      emptyTitle: 'No tournaments yet',
      emptyDescription: 'Create your first tournament, add a roster, and the app will handle pairings, results, and standings.',
      createTournament: 'Create tournament',
      tournamentProgress: 'Tournament progress',
      openTournament: 'Open tournament',
    },
    create: {
      back: 'Back to tournaments',
      title: 'Create tournament',
      description: 'The fastest path: name the tournament, paste the player list, and start the first round on the next screen.',
      details: 'Tournament details',
      name: 'Tournament name',
      namePlaceholder: 'e.g. Friday club tournament',
      rounds: 'Number of rounds',
      roundsPlaceholder: 'Select number of rounds',
      recommendation: (players: number, rounds: number) => `For ${formatPlayerCount(players, 'en')}, we recommend about ${formatSuggestedRoundCount(rounds, 'en')}.`,
      byePoints: 'Bye points',
      byePointsPlaceholder: 'Select bye points',
      halfPoint: '0.5 points',
      onePoint: '1 point',
      playersDescription: 'Each line is one player. Line order is the seed order.',
      randomSeeding: 'Random seeding',
      playerList: 'Player list',
      playerPlaceholder: 'Anna Smith\nBoris Brown\nCyril White\nDana Black',
      playersReady: (count: number) => `${formatPlayerCount(count, 'en')} ready`,
      randomizedHint: 'Seeding will be shuffled when the tournament is created.',
      seededHint: 'The first line will be the first seed.',
      creating: 'Creating...',
      whatNext: 'What happens next',
      whatNextDescription: 'After creating it, you will see standings, players, and tournament controls on one screen. Start the first round with one button.',
      rosterHint: 'If you do not know the full roster yet, create the tournament with at least two players and add others through the join link.',
      errors: {
        minPlayers: 'Enter at least 2 players',
        createFailed: 'Could not create tournament',
      },
    },
    tournament: {
      playerLink: 'Player join link',
      activePlayers: 'Active players',
      completedRounds: 'Completed rounds',
      leader: 'Leader',
      noRoundTitle: 'No round is running yet',
      noRoundDescription: 'Check the player roster and start the first round from the controls panel.',
      nextStepComplete: 'The tournament is complete. Review the final standings or restore an older revision.',
      nextStepPending: (count: number) => `Record ${formatResultCount(count, 'en')} in the current round.`,
      nextStepNeedsPlayers: 'Add at least two active players before starting the first round.',
      nextStepReady: (round: number) => `The tournament is ready for round ${round}.`,
    },
    controls: {
      title: 'Tournament controls',
      activePlayers: (count: number) => `${count} active`,
      byePoints: 'Bye points',
      completeMessage: 'The tournament is complete!',
      starting: 'Starting round...',
      finishRound: (round: number) => `Finish round ${round}`,
      startRound: (round: number) => `Start round ${round}`,
      needsPlayers: 'At least 2 active players are required to start.',
      needsResults: 'Record all results in the current round to continue.',
      deleteTournament: 'Delete tournament',
      deleteTitle: 'Delete tournament',
      deleteDescription: (name: string) => `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      startFailed: 'Could not start round',
    },
    standings: {
      emptyTitle: 'No players yet',
      emptyDescription: 'Add players and standings will start calculating automatically.',
      rank: 'Rank',
      player: 'Player',
      points: 'Points',
      wins: 'W',
      draws: 'D',
      losses: 'L',
      withdrawn: 'Withdrawn',
    },
    playerManagement: {
      name: 'Player name',
      newPlayer: 'New player',
      add: 'Add',
      noPlayers: 'No players were found. Please create the tournament again.',
      seed: 'Seed',
      status: 'Status',
      active: 'Active',
      withdrawn: 'Withdrawn',
      withdrawPlayer: (name: string) => `Withdraw ${name}`,
      restorePlayer: (name: string) => `Restore ${name}`,
      withdrawTitle: 'Withdraw player',
      restoreTitle: 'Restore player',
      errors: {
        nameRequired: 'Enter a player name',
        addFailed: 'Could not add player',
        updateFailed: 'Could not change player status',
      },
    },
    join: {
      back: 'Back to tournament',
      title: 'Join tournament',
      description: 'Enter your name and optional Elo. The organizer will then see you in the player list.',
      name: 'Your name',
      namePlaceholder: 'Enter your name',
      rating: 'Elo (optional)',
      ratingPlaceholder: 'e.g. 1500',
      ratingHelp: 'Your chess Elo (FIDE, USCF, or estimate)',
      joining: 'Joining...',
      join: 'Join',
      error: 'Could not join tournament',
    },
    history: {
      title: 'History',
      empty: 'No history yet',
      restoreTitle: 'Restore revision',
      restoreDescription: (action: string) => `The tournament will be restored to the state from "${action}". This action will create a new revision point.`,
    },
    rules: {
      badge: 'Guide',
      title: 'Swiss-system tournament rules',
      intro: 'A practical overview of how the app pairs players, scores results, and decides standings.',
      whatTitle: 'What is a Swiss-system tournament?',
      whatBody: 'A Swiss-system tournament is a non-elimination format with a fixed number of rounds, much lower than a full round-robin. In a Swiss tournament, not every participant plays every other participant. Players meet one-on-one each round and are paired by rules that aim for opponents with similar current scores while avoiding repeated opponents.',
      pairingTitle: 'Pairing rules',
      pairingRules: [
        'Players with the same score are paired together whenever possible',
        'No player can face the same opponent twice in a tournament',
        'Colors (white/black) are assigned to balance each player color history',
        'If there is an odd number of players, the bye goes to the lowest-scoring player who has not had one yet',
        'If multiple valid pairings exist, higher-rated players get priority',
      ],
      scoringTitle: 'Scoring system',
      win: 'Win',
      draw: 'Draw',
      loss: 'Loss',
      tiebreakTitle: 'Tiebreaks',
      tiebreakIntro: 'When players have the same score, these tiebreaks are used in this order:',
      buchholz: 'Buchholz score',
      buchholzDescription: 'The sum of opponents points. A higher value is better because it means stronger opponents.',
      winsCount: 'Number of wins',
      winsDescription: 'More wins means more decisive play.',
      eloDescription: 'The higher-rated player places higher when all other criteria are equal.',
      byeTitle: 'Bye rules',
      byeBody1: 'A bye is awarded when a round has an odd number of active players. A player with a bye does not play that round, but receives points (typically 1 point, the same as a win).',
      byeBody2: 'The bye goes to the lowest-scoring player who has not received one before. If all players have already had a bye, it goes to the lowest-scoring player.',
      recommendedTitle: 'Recommended number of rounds',
      recommendedIntro: 'The optimal number of rounds depends on the number of players:',
      formula: 'Formula: number of rounds = ceiling(log2(number of players)) for a guaranteed clear winner',
    },
  },
} as const

export type Translations = (typeof translations)[Language]
