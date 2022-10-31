const { query } = require("express");

async function getFuturos(start, end) {
  //Inversiones
  const totalCapitalInversiones = await getTotalCapitalInversiones();
  const totalCapitalInversionesMensual = await getTotalCapitalInversionesMensual(
    start,
    end
  );
  const totalAPagarInversionesMesActual =
    await getTotalAPagarInversionesMesActual();
  const inversionesARetirarConInteresesPagados =
    await getInversionesARetirarConInteresesPagados();
  //Creditos
  const totalCreditosOtorgadosCapital = await getTotalCreditosOtorgadosCapital(
    start,
    end
  );
  const totalCreditosOtorgadosCapitalIntereses =
  await getTotalCreditosOtorgadosCapitalIntereses(start, end);
  const totalCreditosOtorgadosCapitalInteresesGO =
  await getTotalCreditosOtorgadosCapitalInteresesGO(start, end);
  const totalGastosOtorgamiento = await getTotalGastosOtorgamiento(start, end);
  await getTotalCreditosOtorgadosCapitalInteresesGO(start, end);
  const totalDeudaCreditosMora = await getTotalDeudaCreditosMora();
  const totalDeudaCreditosJuicio = await getTotalDeudaCreditosJuicio();
  const totalACobrar = await getTotalACobrar(start, end);
  const totalCobrado = await getTotalCobrado(start, end);
  const totalCreditosCapitalGO = totalGastosOtorgamiento + totalCreditosOtorgadosCapital
  const totalHistoricoCapitalGO = await getTotalHistoricoCapitalGO()
  const saldoRestanteCapitalHistorico = await getSaldoRestanteCapitalHistorico()
  //Caja
  const totalEgresoSinInversiones = await getTotalEgresoSinInversiones(start, end);
  const totalEgresoConInversiones = await getTotalEgresoConInversiones(start, end);
  const totalEgresosFijos = await getEgresosFijos(start, end);

  return {
    totalCapitalInversiones,
    totalCapitalInversionesMensual,
    totalAPagarInversionesMesActual,
    inversionesARetirarConInteresesPagados,
    totalCreditosOtorgadosCapital,
    totalCreditosOtorgadosCapitalIntereses,
    totalCreditosOtorgadosCapitalInteresesGO,
    saldoRestanteCapitalHistorico,
    totalGastosOtorgamiento,
    totalDeudaCreditosMora,
    totalDeudaCreditosJuicio,
    totalACobrar,
    totalCobrado,
    totalCreditosCapitalGO,
    totalHistoricoCapitalGO,
    totalEgresoSinInversiones,
    totalEgresoConInversiones,
    totalEgresosFijos
  };
}
/* -------------------------------------------------------------------------- */
/*                                 Inversiones                                */
/* -------------------------------------------------------------------------- */
// Total Capital de inversiones
async function getTotalCapitalInversiones() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select  percentage, ts, period, sum(amount) as capitalInversiones from cayetano.investments where now() between ts and date_add(ts, interval period month) ;  `;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].capitalInversiones
  } else {
    return 0;
  }
}
// Total inversiones ingresadas del mes
async function getTotalCapitalInversionesMensual(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQueryIngreso = `select  percentage, ts, period,(case when sum(B.amount) is null then 0 else sum(B.amount) end) as inversionesCapital 
  from cayetano.investments A inner join cash_flow B on A.id= B.investment_id 
  where operation_type in( 'inversion_nueva') and created_at between ? and ?;`;
  const dataQueryEgreso = `select  percentage, ts, period,(case when sum(B.amount) is null then 0 else abs(sum(B.amount)) end) as inversionesCapital 
  from cayetano.investments A inner join cash_flow B on A.id= B.investment_id 
  where operation_type in( 'retiro_inversion') and created_at between ? and ?;`;
  const resultIngreso = await query(dataQueryIngreso, [start, end]);
  const resultEgreso = await query(dataQueryEgreso, [start, end]);
  if (dataQueryIngreso) {
    return resultIngreso[0].inversionesCapital - resultEgreso[0].inversionesCapital
  } else {
    return 0;
  }
}
// Total que tengo q pagar de intereses mes actual
async function getTotalAPagarInversionesMesActual() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select  percentage, ts, period, sum(amount * (percentage / 100))as pagoMensual from cayetano.investments where now() between ts and date_add(ts, interval period month) and recapitalizacion_status = 0 ;`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].pagoMensual;
  } else {
    return 0;
  }
}
// Inversiones a retirar con todos los intereses ya pagados (vencidas)
async function getInversionesARetirarConInteresesPagados() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `Select sum(A.amountTotal) as total from (SELECT  cast(date_add(I.ts, interval I.period month) as date) as finalDate , I.ts,I.id as investment_id,
  I.period ,sum(I.amount) as amountTotal,((I.amount * (I.percentage / 100))*I.period) as sumaIntereses,abs(sum(C.amount)) as sumaPagos
 FROM cayetano.investments I inner join cayetano.cash_flow C on I.id = C.investment_id
 where C.operation_type in ("pago_inversion") and cast(date_add(I.ts, interval I.period month) as date) < DATE_SUB(now(),INTERVAL DAYOFMONTH(now())-1 DAY) 
 and I.id not in ( select CSH.investment_id from cayetano.cash_flow CSH where operation_type="retiro_inversion")
  Group by C.investment_id having sumaIntereses = sumaPagos ) A;`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].total;
  } else {
    return 0;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Creditos                                  */
/* -------------------------------------------------------------------------- */
// Otorgados: capital
async function getTotalCreditosOtorgadosCapital(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(credit_amount) as amount  FROM cayetano.credits WHERE otorgamiento BETWEEN ? AND ? and status = 1;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].amount;
  } else {
    return 0;
  }
}
// Otorgados: capital + intereses
async function getTotalCreditosOtorgadosCapitalIntereses(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(credit_amount+intereses) as amount  FROM cayetano.credits WHERE otorgamiento BETWEEN ? AND ? and status = 1;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].amount;
  } else {
    return 0;
  }
}
// Otorgados: capital + intereses + Gastos de otorgamiento
async function getTotalCreditosOtorgadosCapitalInteresesGO(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(capital+intereses) as amount  FROM cayetano.credits WHERE otorgamiento BETWEEN ? AND ? and status = 1;`;
  const result = await query(dataQuery, [start, end]);
  console.log(result);

  if (result) {
    return result[0].amount;
  } else {
    return 0;
  }
}
// Otorgados: GO
async function getTotalGastosOtorgamiento(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(A.capital-A.credit_amount)  amountT  FROM cayetano.credits A WHERE otorgamiento  BETWEEN ? and ? and status = 1;`
  const result = await query(dataQuery, [start, end]);
  console.log(result[0].amountT);
  if (result) {
    return result[0].amountT;
  } else {
    return 0;
  }
}

// Monto deuda creditos en mora
async function getTotalDeudaCreditosMora() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `select sum(A.deuda) as deudas from (SELECT  id, clientID, amount, cuotas, status,period,state, 
        ((SUM(seguro) + (CASE WHEN SUM(punitorios) IS NULL THEN 0 ELSE SUM(punitorios) END) + SUM(cuota)) - SUM(pagado)) as deuda
        FROM (SELECT T1.status, T1.id, T1.clientID, T2.amount, T2.cuotas, T4.period,T1.state,
          CASE WHEN T4.period <= DATE(NOW()) THEN T4.amount ELSE 0 END cuota,
          CASE WHEN T4.period <= DATE(NOW()) THEN T4.payed ELSE 0 END pagado,
          CASE WHEN T4.period <= DATE(NOW()) THEN T4.safe ELSE 0 END seguro,
          CASE WHEN T4.period <= DATE(NOW()) THEN T8.amount ELSE 0 END punitorios
          FROM cayetano.credits T1
          INNER JOIN cayetano.budget T2 ON T1.budget = T2.id
          INNER JOIN cayetano.cars T3 ON T1.carID = T3.id
          INNER JOIN cayetano.users T5 ON T1.clientID = T5.id
          LEFT JOIN cayetano.credits_items T4 ON T1.id = T4.credit_id
          LEFT JOIN cayetano.punitorios T8 ON T1.id = T8.credit_id AND T4.period = T8.period
        ) A WHERE A.status = 1 AND A.state IN ('4', '0','5','6','2') IS NOT TRUE GROUP BY id HAVING deuda > 0 ORDER BY status ASC) A`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].deudas;
  } else {
    return 0;
  }
}
// Monto deuda creditos en juicio
async function getTotalDeudaCreditosJuicio() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT sum(A.amount+A.safe+A.punitorios-A.payed) deuda,B.status,B.state, A.credit_id FROM cayetano.credits_items A inner join cayetano.credits B on A.credit_id=B.id where B.state = 4 and B.status= 1`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].deuda;
  } else {
    return 0;
  }
}
// Total a cobrar
async function getTotalACobrar(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT credit_id,SUM(A.amount + A.safe + A.punitorios)- SUM(A.payed) as deudaTotal FROM cayetano.credits_items A INNER JOIN cayetano.credits B ON A.credit_id = B.id 
    WHERE B.state IN ('2','4','5','6') IS NOT TRUE AND A.payed < (A.amount + A.safe + A.punitorios) AND period BETWEEN ? AND ? ;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].deudaTotal;
  } else {
    return 0;
  }
}
// Total cobrado
async function getTotalCobrado(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT sum(amount) AS total FROM cayetano.cash_flow WHERE operation_type IN ('ingreso_seguro_cuotas','ingreso_interes_cuotas','ingreso_capital_cuotas','ingreso_punitorios_cuotas') AND created_at
    BETWEEN ? AND ?;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].total;
  } else {
    return 0;
  }
}

// total historico capital + G.Otorgamiento
async function getTotalHistoricoCapitalGO() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(A.capital) amount FROM cayetano.credits A WHERE status = 1;`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].amount;
  } else {
    return 0;
  }
}
// total historico capital + G.Otorgamiento - pagado
async function getSaldoRestanteCapitalHistorico() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT COALESCE(sum(B.capital),0) as amount  FROM cayetano.credits A inner join cayetano.credits_items B on B.credit_id = A.id  WHERE status = 1;`;
  const result = await query(dataQuery, []);
  const dataQuery2 = `SELECT COALESCE(sum(B.amount),0) as amount  FROM cayetano.credits A inner join cayetano.cash_flow B on A.id = B.credit_id WHERE operation_type="ingreso_capital_cuotas" and status = 1;`;
  const result2 = await query(dataQuery2, []);
  if (result) {
    return result[0].amount - result2[0].amount;
  } else {
    return 0;
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Caja                                    */
/* -------------------------------------------------------------------------- */
// Egreso sin pago de inversion
async function getTotalEgresoSinInversiones(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT abs(sum(amount)) as egreso FROM cayetano.cash_flow WHERE type = 2 AND created_at BETWEEN ? and ? and caja_id = 1 and deleted_at is null and operation_type in ('pago_inversion') is not true;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].egreso;
  } else {
    return 0;
  }
}
// Egreso con pago de inversion
async function getTotalEgresoConInversiones(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT abs(sum(amount)) as egreso FROM cayetano.cash_flow WHERE type = 2 AND created_at BETWEEN ? and ? and caja_id = 1 and deleted_at is null;`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].egreso;
  } else {
    return 0;
  }
}
// Egreso fijos
async function getEgresosFijos(start, end) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT COALESCE(abs(sum(amount)),0) as amount FROM cayetano.cash_flow where type = 2 and created_at between ? and ? and deleted_at is null 
  and operation_type in ("Comision_mantenimiento","IIBB_creditos","imp_creditos_debitos","IVA","gastos_impuestos","impuesto_luz","impuesto_agua","impuesto_gas","alquiler_oficina","amortizacion_capital",
  "gastos_cochera","gastos_cafeteria","gastos_agua","gastos_limpieza","gastos_monitoreo_alarma","gasto_telefonia","gastos_celular","gastos_generales","impuesto_inmobiliario",
  "insumos_libreria","insumos_oficina","publicidad_propaganda","sueldo_aguinaldo", "sueldos","egreso_servers","egreso_web","gastos_tasa_impuestos");`;
  const result = await query(dataQuery, [start, end]);
  if (result) {
    return result[0].amount;
  } else {
    return 0;
  }
}

//ingreso de dinero por mes
// async function getIngresoDeDineroPorMes() {
//     const util = require("util"); //consulta que muestra la suma de las inversiones de los inversores vigentes.
//     const query = util.promisify(mysqli.query).bind(mysqli);
//     const ingresoDineroQuery = `SELECT SUM(amount) InversoresVigentes FROM investments WHERE DATE_ADD(DATE(ts),INTERVAL (period) MONTH) >= DATE(NOW()) AND DATE_ADD(DATE(ts),INTERVAL (period) MONTH) > DATE(NOW());`;
//     const ingresoDineroResult = await query(ingresoDineroQuery)
//     if(ingresoDineroResult) {
//         return ingresoDineroResult[0].InversoresVigentes
//     } else {
//         return 0;
//     }
// }

//muestra el ingreso de dinero por socios (no inversiones)
// async function getDineroMensual(start, end){
//     const util = require("util");
//     const query = util.promisify(mysqli.query).bind(mysqli);
//     const dataQuery = `SELECT SUM(amount) DineroCapitalSocios FROM cash_flow WHERE description = ('Capital - Socios Valdez') AND created_at BETWEEN ? AND ?;`;
//     const result = await query(dataQuery, [start, end])
//     if(result){
//         return result[0].DineroCapitalSocios
//     }else{
//         return 0;
//     }
// }

//muestra el credito saliente mas el gasto de otorgamiento mensual
// async function getCreditoMensual(start, end){
//     const util = require("util");
//     const query = util.promisify(mysqli.query).bind(mysqli);
//     const dataQuery = `SELECT SUM(capital) CreditoMensualMonto FROM credits WHERE otorgamiento BETWEEN ? AND ?;`;
//     const result = await query(dataQuery, [start, end])
//     if(result){
//         return result[0].CreditoMensualMonto
//     }else{
//         return 0;
//     }
// }

//muestra el monto de la cuota de los creditos mas punitorios mas intereses mas gastos de otorgamiento por mes.
// async function getCuotaCreditoMensual(start, end){
//     const util = require("util");
//     const query = util.promisify(mysqli.query).bind(mysqli);
//     const dataQuery = `SELECT SUM(amount ) CreditoMensualCuota FROM cayetano.credits_items where period BETWEEN ? AND ?;`;
//     const result = await query(dataQuery, [start, end])
//     if(result){
//         return result[0].CreditoMensualCuota
//     }else{
//         return 0;
//     }
// }

//muestra el interes generado mes a mes por las inversiones totales.
// async function getInteresPorInversion(start, end){
//     const util = require("util");
//     const query = util.promisify(mysqli.query).bind(mysqli);
//     const dataQuery = `SELECT SUM(amount) InteresPorInversion FROM investments_payments WHERE ts BETWEEN ? AND ?;`;
//     const result = await query(dataQuery, [start, end])
//     if(result){
//         return result[0].InteresPorInversion
//     }else{
//         return 0;
//     }
// }

//muestra los gastos extraordinarios mensuales
// async function getGastoExtraordinario(start, end){
//     const util = require("util");
//     const query = util.promisify(mysqli.query).bind(mysqli);
//     const dataQuery = `SELECT SUM(amount) GastoExtrao FROM cash_flow WHERE description LIKE 'Gasto Ext%' AND created_at BETWEEN ? AND ?;`;
//     const result = await query(dataQuery, [start, end])
//     if(result){
//         return result[0].GastoExtrao
//     }else{
//         return 0;
//     }
// }

module.exports = {
  getFuturos,
};
