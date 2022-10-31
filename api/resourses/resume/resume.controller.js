const { query } = require("express");

async function getFinancial2() {
  const efectivoDisponible = await getEfectivoDisponible();



  const patrimonioTotal = await getPatrimonioTotal();
  const gastosPrevistos = await getGastosPrevistos();
  const bienesDeUso = await getBienesDeUso();
  const PunitoriosTotales = await getPunitorios();

  return {
    efectivoDisponible,
    patrimonioTotal,
    gastosPrevistos,
    bienesDeUso,
    PunitoriosTotales,
  }
}

async function getFinancial(start, end) {
  const efectivoDisponible = await getEfectivoDisponible();
  const chequesEnCartera = await getChequesEnCartera();
  const bienesDeUso = await getBienesDeUso();
  const gastosPrevistos = await getGastosPrevistos(start, end);
  const creditosVigentes = await getCreditosVigentes(start, end);
  const creditosEnMora = await getCreditosEnMora(start, end);
  const capitalPrestado = await getCapitalPrestado(start, end);
  const interesesPrestado = await getInteresesPrestado(start, end);
  const ingresosPorCapitalRecuperado = await getIngresosPorCapitalRecuperado(
    start,
    end
  );
  /*   const patrimonioTotalCompleto = await getPatrimonioPorFecha(start, end) */
  const capitalVigente = await getCapitalVigente();
  const ingresosPorInteresesRecuperado =
    await getIngresosPorInteresesRecuperado(start, end);
  const ingresosPorPunitoriosRecuperado =
    await getIngresosPorPunitoriosRecuperado(start, end);
  const ingresosPorSegurosRecuperado = await getIngresosPorSegurosRecuperado(
    start,
    end
  );
  const PunitoriosTotales = await getPunitorios(start, end);
  const creditosOtorgados = await getCreditosOtorgados(start, end);
  const patrimonioTotal = await getPatrimonioTotal();

  //caja
  const ResultadoCaja = await getResultadoCajaPositivo(start, end);
  const ResultadoCajaNeg = await getResultadoCajaNegativo(start, end);

  //futuros
  const futurosIngresoDineroMes = await getFuturosIngresoDineroMes();

  //cuota calculada por mes

  //resultado caja
  const efectivoDiario = await getEfectivoDiarioCaja(start, end);
  const cajaDiaria2 = await getEfectivoDiarioCaja2(start, end);
  const cajaDiaria3 = await getEfectivoCajaMayor3(start, end);
  const cajaDiariaEgreso = await getRetiroEfectivoCajaDiaria();

  //inicio de caja diaria. debe restar a la caja diaria
  const cajaDiariaInicio = await getCajaDiariaInicio();

  //bancosantander 
  const BancoSantander = await getSaldoBancoSantander(start, end);
  const santanderDirecto = await getSantanderDirecto();
  const bancoSantanderEgreso = await getSaldoBancoSantanderEgreso(start, end)
  //resultado caja mayor
  const CajaMayorType1 = await getEfectivoCajaMayor();
  const CajaMayorType2 = await getEfectivoCajaMayorRetiro();
  const CajaMayorType3 = await getEfectivoCajaMayorCuotas();
  const CajaMayorEfectivo = await getCajaMayorEfectivo();
  const cajaMayorRetiroDiario = await getEfectivoCajaRetiroCajaDiaria();
  const CajaMayorType4 = await getEfectivoCajaMayorInversionNueva();
  const CajaMayorInvesionNueva = await getEfectivoTotalInversionista(); //inversion nueva para sumar en el total

  //efectivo ingreso directo a caja mayor
  const ingresoDirectoCajaMayor= await getEfectivoIngresoDirecto();


  const cajaMayorType2Efectivo = await getCajaMayorType2Efectivo();
  //cuenta brubank
  const Brubank = await getCuentaBrubank();
  const brubankDirecto = await getBrubankDirecto();

  /* const brubankEgreso = await getCuentaBrubankEgreso(); */


  /* const EfectivoMayor = await getEfectivoCajaMayor(); */
  //sumadores
  const capitalEInteresesPrestado =
    (capitalPrestado ?? 0) + (interesesPrestado ?? 0);
  const totalIngresosRecuperado =
    (ingresosPorCapitalRecuperado ?? 0) +
    (ingresosPorInteresesRecuperado ?? 0) +
    (ingresosPorPunitoriosRecuperado ?? 0) +
    (ingresosPorSegurosRecuperado ?? 0);
  //cobrado en intereses y punitorios menos los egresos de la caja
  const ganaciaRecuperada =
    (ingresosPorInteresesRecuperado ?? 0) +
    (ingresosPorPunitoriosRecuperado ?? 0) +
    (gastosPrevistos ?? 0);
  const investmentsComplete = await getInvestmentsUserComplete();
  ///////////////////////////////////////////////////////
  /*   const cajaTotalPositivo = await getCajaTotalPositivo();
    const cajaTotalNegativo = await getCajaTotalNEgativo(); */
  ///////////////////////////////////////////////////////

  return {
    //////////////////
    /*     cajaTotalPositivo,
        cajaTotalNegativo, */
    //////////////////
    efectivoDisponible,
    chequesEnCartera,
    bienesDeUso,
    patrimonioTotal,
    gastosPrevistos,
    creditosVigentes,
    creditosEnMora,
    capitalPrestado,
    interesesPrestado,
    capitalEInteresesPrestado,
    ingresosPorCapitalRecuperado,
    ingresosPorInteresesRecuperado,
    ingresosPorPunitoriosRecuperado,
    ingresosPorSegurosRecuperado,
    totalIngresosRecuperado,
    creditosOtorgados,
    ganaciaRecuperada,
    PunitoriosTotales,
    investmentsComplete,
    capitalVigente,
    //futuros
    futurosIngresoDineroMes,
    //patrimonio total 
    /*  patrimonioTotalCompleto */

    //caja
    ResultadoCaja,
    ResultadoCajaNeg,
    ResultadoCajaTotal: +ResultadoCaja + +ResultadoCajaNeg,
    //caja mayor total
    ingresoDirectoCajaMayor,
    CajaMayorType1,
    CajaMayorType2,
    CajaMayorType3,
    //retiro caja mayor type2 solo efectivo
    cajaMayorType2Efectivo,
    /* CajaMayorType4, */
    CajaMayorResult: +CajaMayorType1 + CajaMayorType3 + CajaMayorType2 - cajaDiariaInicio + cajaMayorRetiroDiario + ingresoDirectoCajaMayor + CajaMayorInvesionNueva, /* - +CajaMayorType4, */
    CajaMayorResultEfectivo: CajaMayorType1 + CajaMayorEfectivo + cajaMayorType2Efectivo ,
    //resultado totales de caja
    efectivoDiario,
    cajaDiariaEgreso,
    totalMovimientoEfectivoDiario: efectivoDiario + cajaDiariaEgreso,
    cajaDiaria2,
    cajaDiaria3,
    TotalCajaDiaria: efectivoDiario + cajaDiaria2 + cajaDiaria3 ,

    //santander
    santanderDirecto,

    BancoSantander,
    bancoSantanderEgreso,
    bancoSantanderTotal: +BancoSantander + +bancoSantanderEgreso + santanderDirecto,

    //brubank
    Brubank,
    brubankDirecto,
    /* brubankEgreso,
    brubankTotal : +brubankEgreso + +Brubank, */
    /*  EfectivoMayor,
        totalCajaMayor: +CajaDiaria + +EfectivoMayor, */
    //cuotas monto pagado

  };
}

//motno de cuotas pagadas por mes
async function getResumeClients(start, end) {
  try {
    const waiting = await getClientsWaiting(start, end);
    const upToDate = await getClientsUpToDate();
    const withDebt = await getClientsWithDebt();

    return {
      waiting: waiting,
      upToDate: upToDate,
      withDebt: withDebt,
    };
  } catch (error) {
    console.log("ERROR", error);
  }
}

async function getResumeInvestments(start, end) {
  const commitment30Days = await getCommitment30Daysg();
  const pagos30Days = await getPayments30Daysg();
  const highProbability = await getHighProbability();
  const lowProbability = await getLowProbability();
  const toPay = await getToPay(start, end);
  const InvestmentAmountActive = await investmentRecap(start, end);
  const InvestmentOutAmountActive = await investmentOutRecap(start, end);
  const CuotaPagaMensual = await getCuotaPagaMensual(start, end);

  return {
    highProbability: highProbability,
    lowProbability: lowProbability,
    commitment30Days: commitment30Days,
    pagos30Days: pagos30Days,
    toPay,
    InvestmentAmountActive,
    InvestmentOutAmountActive,
    CuotaPagaMensual,
  };
}
async function getCuotaPagaMensual(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) cuotaPagaMes FROM cash_flow WHERE operation_type in ('ingreso_capital_cuotas','ingreso_interes_cuotas','ingreso_seguro_cuotas') AND created_at BETWEEN ? AND ?;`;
  const result = await query(dataQuery, [start, end])
  if (result) {
    return result[0].cuotaPagaMes
  } else {
    return 0;
  }
}

// functiones internas

/* async function getCajaTotalPositivo(){
  let cajaTotalPositivoR = 0;
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const cajaQuery = ``;
  const cajaResult = await query(cajaQuery, [])
  if(cajaResult){
    cajaTotalPositivoR = cajaResult[0].cajatotal
  }
}
 */
async function getInvestmentsUserComplete() {
  let totalInvestmentComplete = 0;
  let totalInvestmentComplete2 = 0;

  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const InvestmentUserCompleteQuery = `SELECT amount InvestmentUserComplete FROM cayetano.users join cayetano.investments on users.id = investments.investorID;`;
  const InvestmentUserCompleteResult = await query(InvestmentUserCompleteQuery, [])
  if (InvestmentUserCompleteResult) {
    totalInvestmentComplete = InvestmentUserCompleteResult[0].InvestmentUserComplete
  }
  const InvestmentUserCompleteQuery2 = `SELECT investorID InvestmentUserComplete FROM cayetano.users join cayetano.investments on users.id = investments.investorID;`;
  const InvestmentUserCompleteResult2 = await query(InvestmentUserCompleteQuery2, [])
  if (InvestmentUserCompleteResult2) {
    totalInvestmentComplete2 = InvestmentUserCompleteResult2[0].InvestmentUserComplete
  }
  return {
    totalInvestmentComplete,
    totalInvestmentComplete2,
  }
}

async function getPatrimonioTotal() {
  /**
   Patrimonio > Todo lo que la empresa tiene activo

  - Movimientos de ingreso a la caja sin contar (egreso_credito_otorgado,ingreso_capital_cuotas,pago_inversion,retiro_inversion,inversion_nueva)
  - Totales de las inversiones viejas
  - Capital de los creditos
   */

  let totalCapitalCreditos = 0;
  let totalMontoInversiones = 0;
  let totalIngresosCaja = 0;
  let inversionNueva = 0;
  let totalIngresoInteresCuotas = 0;
  let gastosVarios = 0;
  let patrimonioMensual = 0;
  let inversionesVigentes = 0;

  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  //calculamos las inversiones totales vigentes en la empresa. 
  const inversionesVigentesQuery = `SELECT     
                                    SUM(amount)
                                    InversoresVigentes 
                                    FROM
                                    investments
                                    WHERE 
                                    DATE_ADD(DATE(ts),INTERVAL (period) MONTH) >= DATE(NOW())
                                    AND DATE_ADD(DATE(ts),INTERVAL (period) MONTH) > DATE(NOW());`;
  const inversionesVigentesResult = await query(inversionesVigentesQuery, []);
  if (inversionesVigentesResult) {
    inversionesVigentes = inversionesVigentesResult[0].InversoresVigentes;
  }



  // Calculamos el capital prestado de todos los creditos que se han hecho a lo largo del tiempo
  const totalCapitalCreditosQuery = `SELECT SUM(capital) capitalCreditos FROM credits WHERE status > 0;`;
  const totalCapitalCreditosResult = await query(totalCapitalCreditosQuery, []);
  if (totalCapitalCreditosResult) {
    totalCapitalCreditos = totalCapitalCreditosResult[0].capitalCreditos;
  }
  // Calculamos todo el valor de inversiones que han ingresado a la empresa a lo largo del tiempo
  const totalMontoInversionesQuery = `SELECT SUM(amount) MontoInversiones FROM investments;`;
  const totalMontoInversionesResult = await query(
    totalMontoInversionesQuery,
    []
  );
  if (totalMontoInversionesResult) {
    totalMontoInversiones = totalMontoInversionesResult[0].MontoInversiones;
  }
  // calculamos el resultado del ingresointeres por cuota
  const totalIngresoInteresCuotaQuery = `SELECT SUM(amount) IngresoInteresCuota FROM cash_flow WHERE deleted_at IS NULL AND operation_type = 'ingreso_interes_cuotas';`
  const totalIngresoInteresCuotaResultado = await query(totalIngresoInteresCuotaQuery, []);
  if (totalIngresoInteresCuotaResultado) {
    totalIngresoInteresCuotas = totalIngresoInteresCuotaResultado[0].IngresoInteresCuota;
  };
  // calculamos los gastos varios sumandolo y no discriminando entre que tipo de gastos son
  const totalGastosVariosQuery = `SELECT SUM(amount) GastosVarios FROM cash_flow WHERE deleted_at IS NULL AND operation_type IS NULL AND amount >= 0`;
  const totalGastosVariosResultado = await query(totalGastosVariosQuery, []);
  if (totalGastosVariosResultado) {
    gastosVarios = totalGastosVariosResultado[0].GastosVarios;
  };
  // calculamos el resultado de la inversionNueva realizada 
  const totalInversionNueva = `SELECT SUM(amount) InversionNueva FROM cash_flow WHERE deleted_at IS NULL AND operation_type = 'inversion_nueva';`;
  const totalInversionNuevaResultado = await query(totalInversionNueva, []);
  if (totalInversionNuevaResultado) {
    inversionNueva = totalInversionNuevaResultado[0].InversionNueva
  }
  // Calculamos todo lo que ha ingresado a la caja que no sea egreso_credito_otorgado,ingreso_capital_cuotas,pago_inversion,retiro_inversion,inversion_nueva
  const totalIngresosCajaQuery = `SELECT SUM(amount) IngresosCaja FROM cash_flow WHERE deleted_at IS NULL AND operation_type NOT IN('ingreso_capital_cuotas', 'pago_inversion','retiro_inversion', 'ingreso_punitorios_cuotas', 'ingreso_seguro_cuotas');`; // incluimos el inversion nueva y los creditos otorgados
  const totalIngresosCajaResult = await query(totalIngresosCajaQuery, []);
  if (totalIngresosCajaResult) {
    totalIngresosCaja = totalIngresosCajaResult[0].IngresosCaja;
  }

  //calculo para Barchart calculando el valor del patrimonio total mensual. 
  const totalPatrimonioMensualQuery = `SELECT SUM(amount) patrimonioTotalMensual FROM cash_flow WHERE deleted_at IS NULL AND operation_type NOT IN('egreso_credito_otorgado','ingreso_capital_cuotas','pago_inversion','retiro_inversion') AND MONTH(created_at) = MONTH(CURRENT_DATE());`;
  const totalPatrimonioMensualResult = await query(totalPatrimonioMensualQuery, []);
  if (totalPatrimonioMensualResult) {
    patrimonioMensual = totalPatrimonioMensualResult[0].patrimonioTotalMensual;
  }
  return {
    inversionesVigentes,
    patrimonioMensual,
    gastosVarios,               //no lo toma en la suma total
    totalIngresoInteresCuotas, //no lo toma en la suma total
    inversionNueva,         //no lo toma en la suma total
    totalCapitalCreditos,   //no lo toma en la suma total
    totalMontoInversiones,
    totalIngresosCaja,
    total: +totalMontoInversiones + +totalIngresosCaja,
  };
}

//Resultado para ver los valores de la + y - de de cashflow filtrados por fecha (resumen de caja)
async function getResultadoCajaPositivo(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) ResultBoxPositive FROM cayetano.cash_flow WHERE created_at BETWEEN ? AND ? AND amount > 0;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].ResultBoxPositive
  } else {
    return 0;
  }
}
async function getResultadoCajaNegativo(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) ResultBoxNegative FROM cayetano.cash_flow WHERE created_at BETWEEN ? AND ? AND amount < 0;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].ResultBoxNegative
  } else {
    return 0;
  }
}

async function getCreditosOtorgados(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT COUNT(id) creditosOtorgados FROM credits WHERE otorgamiento BETWEEN ? AND ? AND status > 0`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].creditosOtorgados;
  } else {
    return 0;
  }
}

async function getCapitalPrestado(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(capital) capitalPrestado FROM credits WHERE otorgamiento BETWEEN ? AND ? AND status > 0`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].capitalPrestado;
  } else {
    return 0;
  }
}

// CAPITAL
async function getIngresosPorCapitalRecuperado(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) ingresosPorCapitalRecuperado FROM cash_flow WHERE deleted_at IS NULL AND operation_type = "ingreso_capital_cuotas" AND created_at BETWEEN ? AND ?;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].ingresosPorCapitalRecuperado;
  } else {
    return 0;
  }
}

// INTERES
async function getIngresosPorInteresesRecuperado(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) ingresosPorInteresesRecuperado FROM cash_flow WHERE deleted_at IS NULL AND operation_type = "ingreso_interes_cuotas"  AND created_at BETWEEN ? AND ?;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].ingresosPorInteresesRecuperado;
  } else {
    return 0;
  }
}

//PUNITORIOS
async function getIngresosPorPunitoriosRecuperado(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) ingresosPorPunitoriosRecuperado FROM cash_flow WHERE deleted_at IS NULL AND operation_type = "ingreso_punitorios_cuotas"  AND created_at BETWEEN ? AND ?;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].ingresosPorPunitoriosRecuperado;
  } else {
    return 0;
  }
}

//SEGURO
async function getIngresosPorSegurosRecuperado(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) ingresosPorSegurosRecuperado FROM cash_flow WHERE deleted_at IS NULL AND operation_type = "ingreso_seguro_cuotas" AND created_at BETWEEN ? AND ?;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].ingresosPorSegurosRecuperado;
  } else {
    return 0;
  }
}

async function getInteresesPrestado(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(intereses) interesesPrestado FROM cayetano.credits WHERE otorgamiento BETWEEN ? AND ? AND status > 0`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].interesesPrestado;
  } else {
    return 0;
  }
}

async function getChequesEnCartera() {
  return 0;
}

async function getBienesDeUso() {
  return 0;
}

//Futuros
async function getFuturosIngresoDineroMes() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) InversoresVigentes FROM investments WHERE DATE_ADD(DATE(ts),INTERVAL (period) MONTH) >= DATE(NOW()) AND DATE_ADD(DATE(ts),INTERVAL (period) MONTH) > DATE(NOW());`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].InversoresVigentes
  }
}
//Futuros 

async function getEfectivoDisponible() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) efectivoDisponible FROM cash_flow WHERE deleted_at IS NULL;`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].efectivoDisponible;
  } else {
    return 0;
  }
}

//brubank
async function getCuentaBrubank() {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) brubank from cayetano.cash_flow where account_id = '5' and created_at between '2022-08-23' and now() and type not in ('8');`
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].brubank;
  } else {
    return 0
  }
}

//caja . muestra el saldo a favor de las diferentes cuentas...
/* async function getEfectivoDiarioCaja() {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli)
  const dataQuery = `select (select sum(amount) from cayetano.cash_flow where left(created_at,10) = left(now(),10) and type not in ('3', '2')) - (select sum(amount) from cayetano.cash_flow where type = '3' and left(created_at,10) = left(now(),10)) cajadiaria;`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].cajadiaria
  } else {
    return 0
  }
} */
//efectivo caja diaria 
async function getEfectivoDiarioCaja() {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli)
  const dataQuery = `select sum(amount) cajadiaria from cayetano.cash_flow where type in ('1','4') and account_id = '1' and left(created_at,10) = left(now(),10) and operation_type in ("ingreso_capital_cuotas","ingreso_interes_cuotas","ingreso_seguro_cuotas","ingreso_punitorios_cuotas") is not true;`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].cajadiaria
  } else {
    return 0
  }
}
//egreso de efectivo de caja chica. pagos cajero
async function getRetiroEfectivoCajaDiaria() {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli)
  const dataQuery = `select sum(amount) cajadiaria from cayetano.cash_flow where type= '5' and account_id = '1' and left(created_at,10) = left(now(),10);`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].cajadiaria
  } else {
    return 0
  }
}

//cajadiaria con banco brubank
async function getEfectivoDiarioCaja2() {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli)
  const dataQuery = `select sum(amount) cajaDiariaConAccount from cayetano.cash_flow where type = '1' and account_id = '5' and left(created_at,10) = left(now(),10) and operation_type in ("ingreso_capital_cuotas","ingreso_interes_cuotas","ingreso_seguro_cuotas","ingreso_punitorios_cuotas") is not true;`;
  const result = await query(dataQuery, [])
  if (result) {
    return result[0].cajaDiariaConAccount
  }
}
async function getEfectivoCajaMayor3() {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) cajaDiariaConNull from cayetano.cash_flow where type='1' and account_id = '8' and left(created_at,10) = left(now(),10) and operation_type in ("ingreso_capital_cuotas","ingreso_interes_cuotas","ingreso_seguro_cuotas","ingreso_punitorios_cuotas") is not true;`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].cajaDiariaConNull
  } else {
    return 0
  }
}

/*select (select sum(amount) from cayetano.cash_flow where left(created_at,10) = left(now(),10) and type not in ('3', '2')) + (select sum(amount) from cayetano.cash_flow where left(created_at,10) = left(now(),10) and type = '2' )+(
    select sum(amount) from cayetano.cash_flow where account_id in ('8','5') and left(created_at,10) = left(now(),10))
   as cajadiaria;*/
async function getSaldoBancoSantander(start, end) {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) cajaBancoSantander FROM cayetano.cash_flow WHERE account_id='8' AND created_at BETWEEN '2022-08-23' AND now() AND type not in ('7', '2');`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].cajaBancoSantander
  } else {
    return 0
  }
}
async function getSaldoBancoSantanderEgreso(start, end) {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) cajaBancoSantander FROM cayetano.cash_flow WHERE account_id='8' AND created_at BETWEEN '2022-08-23' AND now() and type='2';`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].cajaBancoSantander
  } else {
    return 0
  }
}

//ingresos directo de las cajas grandes . sin pasar por la caja diaria- 
//santander
async function getSantanderDirecto() { //suma type 3
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) santanderDirectoEntrada from cash_flow where type='7' and account_id='8';`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].santanderDirectoEntrada
  } else {
    return 0
  }
}
//brubank
async function getBrubankDirecto() { //suma type 3
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) brubankDirectoEntrada from cayetano.cash_flow where type = '8';`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].brubankDirectoEntrada
  } else {
    return 0
  }
}


//composicion Caja mayor
async function getEfectivoCajaMayor() { //suma type 3
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) cajaMayor from cayetano.cash_flow where type = '3';`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].cajaMayor
  } else {
    return 0
  }
}
async function getEfectivoTotalInversionista() { //suma type 3
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) Efectivoinversionnueva from cayetano.cash_flow where operation_type = 'inversion_nueva' and created_at between '2022-08-23' and now();`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].Efectivoinversionnueva
  } else {
    return 0
  }
}

async function getEfectivoIngresoDirecto() { //suma type 3
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) cajaMayorDirecto from cayetano.cash_flow where account_id='9' and DATE(created_at) between '2022-08-23' and now();`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].cajaMayorDirecto
  } else {
    return 0
  }
}

async function getEfectivoCajaMayorRetiro() { //resta type 2 egreso de pagos
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) retiroCajaMayor  from cayetano.cash_flow where type= ('2') and DATE(created_at) between '2022-08-23' and now();`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].retiroCajaMayor
  } else {
    return 0
  }
}
async function getEfectivoCajaRetiroCajaDiaria() { //resta type 2 egreso de pagos
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) retiroCajaMayor  from cayetano.cash_flow where type= ('5') and DATE(created_at) between '2022-08-23' and date_sub(current_date(),interval 1 day);`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].retiroCajaMayor
  } else {
    return 0
  }
}
async function getEfectivoCajaMayorCuotas() {  //suma cuota de creditos y demas type 1
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) ingresoCajaMayorCuotas from cayetano.cash_flow where type='1' and cast(created_at AS DATE) and DATE(created_at) between '2022-08-23' and date_sub(current_date(),interval 1 day) and account_id in ('8','1','5');`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].ingresoCajaMayorCuotas
  } else {
    return 0
  }
}

//caja mayor descuento solo en efectivo
async function getCajaMayorType2Efectivo() {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) retiroSoloEfectivo from cayetano.cash_flow where type= ('2') and DATE(created_at) between '2022-08-23' and now() and (account_id = '1' or operation_type = 'pago_inversion');`;
  const result = await query(dataQuery, []);
  if(result) {
    return result[0].retiroSoloEfectivo
  }else {
    return 0
  }
}

//Caja mayor solo en efectivo 
async function getCajaMayorEfectivo() {  //suma del efectivo de la caja mayor
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) ingresoCajaMayorCuotas from cayetano.cash_flow where type='1' and cast(created_at AS DATE) and DATE(created_at) between '2022-08-23' and date_sub(current_date(),interval 1 day) and account_id = '1'  and 
  operation_type like('pago_cuota_total') is not true;`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].ingresoCajaMayorCuotas
  } else {
    return 0
  }
}
async function getCajaDiariaInicio() {  //suma del efectivo de la caja mayor
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) ingresoACajaDiaria from cayetano.cash_flow where type = '4' and created_at between '2022-08-23' and now();`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].ingresoACajaDiaria
  } else {
    return 0
  }
}

//inversiones nuevas
async function getEfectivoCajaMayorInversionNueva() {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(amount) InversionNuevaCajaMayor from cash_flow where operation_type = 'inversion_nueva' and created_at between '2022-08-23' and date_sub(current_date(), interval 2 day)`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].InversionNuevaCajaMayor
  }
}

//punitorios
async function getPunitorios(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(punitorios) Punitorio FROM credits_items WHERE period BETWEEN ? AND ?;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].Punitorio;
  } else {
    return 0;
  }
}
async function getCapitalVigente() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(distinct s.capital) capitalVigentes FROM credits s INNER JOIN credits_items d ON s.id = d.credit_id ;`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].capitalVigentes;
  } else {
    return 0;
  }
}

async function getCreditosVigentes(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount+safe+punitorios) deuda FROM credits_items WHERE (amount+safe+punitorios) > payed AND period BETWEEN ? AND ?;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].deuda;
  } else {
    return 0;
  }
}

async function getCreditosEnMora(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount+safe+punitorios) deuda FROM credits_items WHERE period < NOW() AND (amount+safe+punitorios) > payed AND period BETWEEN ? AND ?;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].deuda;
  } else {
    return 0;
  }
}



async function getGastosPrevistos(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) gastosPrevistos FROM cash_flow WHERE deleted_at IS NULL AND type = 2 AND created_at BETWEEN ? AND ?`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].gastosPrevistos;
  } else {
    return 0;
  }
}

async function getClientsWithDebt() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT COUNT(*) withDebt FROM (SELECT id FROM credits_items WHERE (amount+punitorios+safe) > payed AND period < NOW() GROUP BY credit_id) AS A;`;
  const result = await query(sql, []);
  if (result) {
    return result[0].withDebt;
  } else {
    return 0;
  }
}

async function getClientsUpToDate() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT COUNT(*) upToDate FROM (SELECT id FROM credits_items WHERE (amount+punitorios+safe) <= payed AND period < NOW() GROUP BY credit_id) AS A;`;
  const result = await query(sql, []);
  if (result) {
    return result[0].upToDate;
  } else {
    return 0;
  }
}

async function getClientsWaiting(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT COUNT(*) waiting FROM users u
                LEFT JOIN credits c on c.clientID = u.id
                WHERE u.type = 4 AND c.id is null and c.otorgamiento BETWEEN ? AND ? AND c.status = 1`;
  const result = await query(sql, [start, end]);
  return result[0].waiting;
}

async function getCommitment30DaysPerInvestments(
  investmentQueryResult,
  interesSimple = false
) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);

  let capitalADevolver = 0;
  let interesesApagar = 0;

  if (investmentQueryResult && investmentQueryResult.length > 0) {
    for (let index = 0; index < investmentQueryResult.length; index++) {
      const investment = investmentQueryResult[index];

      const investment_id = investment.id;
      let capitalBase = investment.amount;

      // console.log(       `------------------- INVESTMENT ID ${investment_id} ----------------`);

      // Chequeamos si no ha recapitalizado el capital mensualmente y en el caso de que tenga recapitalizacion no se le paga el interes mensual

      let interesRecapitalizado = 0;

      if (investment.recapitalizacion_status == 1) {
        interesRecapitalizado = 1;
      }

      const sql3 = `SELECT previous_amount capitalInicial FROM cayetano.recapitalizaciones WHERE investment_id = ? ORDER BY id ASC LIMIT 1;`;
      const result3 = await query(sql3, [investment_id]);
      if (result3 && result3.length > 0) {
        interesRecapitalizado = 1;
        // console.log("TIENE RECAPITALIZACIONES");

        // console.log("capital para sumar LINE 283", result3[0].capitalInicial);
        // console.log("intereses para sumar LINE 285",      investment.amount - result3[0].capitalInicial);

        // solo lo calculamos al interes en el caso de que no tenga recapitalizaciones
        if (!interesSimple) {
          capitalADevolver += result3[0].capitalInicial;
          interesesApagar += investment.amount - result3[0].capitalInicial;
        }
      }

      let pagosRealizados = 0;

      //chequeamos si tiene pagos realizados y no esta recapitalizando
      if (interesRecapitalizado == 0) {
        const sqlPayments = `SELECT SUM(amount) pagosRealizados FROM cayetano.investments_payments WHERE investmentID = ?;`;
        const resultPayments = await query(sqlPayments, [investment_id]);
        if (resultPayments && resultPayments.length > 0) {
          pagosRealizados = resultPayments[0].pagosRealizados;
        }
      }

      // Si recapitalizo el capital no tenemos que calcular intereses sobre este capital
      if (interesRecapitalizado == 0 && !interesSimple) {
        // En el caso de que haya hecho retiros de la inversion se le resta al capital de la inversion los retiros
        const sql2 = `SELECT SUM(amount) retirosInversion FROM cash_flow WHERE operation_type = 'retiro_inversion' AND investment_id = ?;`;
        const result2 = await query(sql2, [investment_id]);
        if (result2) {
          capitalBase += result2[0].retirosInversion;

          // console.log("capital para sumar LINE 301", capitalBase);

          capitalADevolver += capitalBase;
        }

        // console.log("cuotas", investment.period);
        // console.log("porcentaje", investment.percentage);

        if (pagosRealizados > 0) {
          if (
            pagosRealizados <
            capitalBase * (investment.percentage / 100) * investment.period
          ) {
            const interesDeEstaInversion =
              capitalBase * (investment.percentage / 100);
            interesesApagar += interesDeEstaInversion;
          }
        } else {
          const interesDeEstaInversion =
            capitalBase *
            Math.pow(1 + investment.percentage / 100, investment.period) -
            capitalBase;
          interesesApagar += interesDeEstaInversion;
        }
      }

      if (interesSimple) {
        if (interesRecapitalizado == 0) {
          capitalADevolver += capitalBase;
          if (pagosRealizados > 0) {
            if (
              pagosRealizados <
              capitalBase * (investment.percentage / 100) * investment.period
            ) {
              interesesApagar += capitalBase * (investment.percentage / 100);
            }
          } else {
            interesesApagar += capitalBase * (investment.percentage / 100);
          }
        }
      }
    }

    // console.log(`capitalADevolver totales ${capitalADevolver}`);
    // console.log(`interesesApagar totales ${interesesApagar}`);
  }

  return {
    capital: capitalADevolver,
    intereses: interesesApagar,
    total: capitalADevolver + interesesApagar,
  };
}

async function getCommitment30Daysg(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT 
  *
FROM
  cayetano.investments
WHERE DATE(NOW()) BETWEEN DATE_ADD(DATE(ts),INTERVAL (period - 1) MONTH) AND DATE_ADD(DATE(ts),INTERVAL (period) MONTH)`;
  const result = await query(sql, [start, end, end]);

  return getCommitment30DaysPerInvestments(result);
}

async function getPayments30Daysg(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli); //query que extrae para tomar los datos del capital base de inversores.
  const sql = `SELECT     
                *
              FROM
                cayetano.investments
              WHERE
                DATE_ADD(DATE(ts),INTERVAL (period) MONTH) >= DATE(NOW())
              AND DATE_ADD(DATE(ts),INTERVAL (period) MONTH) > DATE(NOW())`; //query para calcular el capital base a 30 dias
  const result = await query(sql, []);
  //obtenemos los resultados usando la funcion de calculo de interees y le pasamos true para que filtre por interes simple
  return getCommitment30DaysPerInvestments(result, true);
}

async function investmentRecap(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli); //query para calcular el monto de los inversores que recapitalizan y estan activos actualmente
  const sql = `SELECT     
  SUM(amount)
  investmentRecapActive
  FROM
           investments
  WHERE
  DATE_ADD(DATE(ts),INTERVAL (period) MONTH) >= DATE(NOW())
  AND DATE_ADD(DATE(ts),INTERVAL (period) MONTH) > DATE(NOW()) AND recapitalizacion_status = '1' AND recapitalizar = '1';`
  const result = await query(sql, [])
  return result[0].investmentRecapActive;
}

async function investmentOutRecap(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli); //query para calcular el monto de los inversores que recapitalizan y estan activos actualmente
  const sql = `SELECT     
  SUM(amount)
  investmentOutRecapActive
  FROM
           investments
  WHERE
  DATE_ADD(DATE(ts),INTERVAL (period) MONTH) >= DATE(NOW())
  AND DATE_ADD(DATE(ts),INTERVAL (period) MONTH) > DATE(NOW()) AND recapitalizacion_status = '0' AND recapitalizar = '0';`
  const result = await query(sql, [])
  return result[0].investmentOutRecapActive;
}


async function getHighProbability() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT COUNT(*) highProbability
                FROM users u
                WHERE u.probability ='high' AND u.type=5`;
  const result = await query(sql);
  return result[0].highProbability;
}
async function getLowProbability() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT COUNT(*) lowProbability
                FROM users u
                WHERE u.probability ='low' AND u.type=5`;
  const result = await query(sql);
  return result[0].lowProbability;
}
async function getToPay(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT SUM(amount) toPay from investments_payments WHERE ts BETWEEN ? AND ?`;
  const result = await query(sql, [start, end]);
  return result[0].toPay;
}

module.exports = {
  getFinancial2,
  getFinancial,
  getResumeClients,
  getResumeInvestments,
  getCommitment30DaysPerInvestments,
  /*   create */
};