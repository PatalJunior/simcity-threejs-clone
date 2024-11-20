export default {
  modules: {
    development: {
      // Número de ciclos de simulação que a estrada deve falhar nos critérios
      // de abandono antes de ter uma chance de ser abandonada
      abandonThreshold: 10,
      // Probabilidade de um edifício ser abandonado após atender aos critérios
      // de abandono por 'delay' ciclos
      abandonChance: 0.25,
      // Número de dias necessários para construir um edifício
      constructionTime: 3,
      // Probabilidade de um edifício subir de nível
      levelUpChance: 0.05,
      // Probabilidade de um edifício ser re-desenvolvido após não atender
      // mais aos critérios de abandono
      redevelopChance: 0.25,
    },
    residents: {
      // Número máximo de residentes em uma casa
      maxResidents: 2,
      // Chance de um residente se mudar para a casa
      residentMoveInChance: 0.5,
    },
    roadAccess: {
      // Distância máxima para buscar uma estrada ao determinar o acesso rodoviário
      searchDistance: 3,
    },
  },
  citizen: {
    // Idade mínima para um cidadão começar a trabalhar
    minWorkingAge: 16,
    // Idade em que os cidadãos se aposentam
    retirementAge: 65,
  },
}
