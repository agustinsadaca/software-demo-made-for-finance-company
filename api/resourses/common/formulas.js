var formula = require('@formulajs/formulajs')
module.exports = {
  calcularCuotaMensual: function (capital, comision, cuotas) {
    var cuotaMensual =
    (capital + capital * ((comision * cuotas) / 100)) / cuotas;
    return +cuotaMensual.toFixed(2);
  },
  generarCuotas: function (cuotas, valorUnitarioCuota, saldo, rateValue) {
    let cuotasArray = [];
    
    for (let index = 0; index < cuotas; index++) {
      let interes = +saldo * +rateValue;
      let capital = +valorUnitarioCuota - +interes;
      saldo = +saldo - +capital;
      cuotasArray.push({
        interes: +interes.toFixed(2),
        capital: +capital.toFixed(2),
        saldo: +saldo.toFixed(2),
      });
    }
    console.log(cuotasArray);
    return cuotasArray;
  },
  rate: function (periods, payment, present, future, type, guess) {
    /**
     * Using example
     * periods = 18
     * payment = 19425
     * present = 143299.18
     */
    
    /*guess = guess === undefined ? 0.01 : guess;
    future = future === undefined ? 0 : future;
    type = type === undefined ? 0 : type;*/
    guess = (((-present / periods) + payment) / present).toFixed(3)
    payment = Number(payment.toFixed(2))
    try {      
      var formattedFormula = formula.RATE(periods,-payment,present,0,0,guess);
    } catch (error) {
      console.log(error);
    }
    // future = 0;
    // type = 0;
    // guess = 0.1;

    // //we convert present from positive to negative
    // present = present - present * 2;

    // // Set maximum epsilon for end of iteration
    // var epsMax = 1e-10;

    // // Set maximum number of iterations
    // var iterMax = 10;

    // // Implement Newton's method
    // var y,
    //   y0,
    //   y1,
    //   x0,
    //   x1 = 0,
    //   f = 0,
    //   i = 0;
    // var rate = guess;
    // if (Math.abs(rate) < epsMax) {
    //   y =
    //     present * (1 + periods * rate) +
    //     payment * (1 + rate * type) * periods +
    //     future;
    // } else {
    //   f = Math.exp(periods * Math.log(1 + rate));
    //   y = present * f + payment * (1 / rate + type) * (f - 1) + future;
    // }
    // y0 = present + payment * periods + future;
    // y1 = present * f + payment * (1 / rate + type) * (f - 1) + future;
    // i = x0 = 0;
    // x1 = rate;
    // while (Math.abs(y0 - y1) > epsMax && i < iterMax) {
    //   rate = (y1 * x0 - y0 * x1) / (y1 - y0);
    //   x0 = x1;
    //   x1 = rate;
    //   if (Math.abs(rate) < epsMax) {
    //     y =
    //       present * (1 + periods * rate) +
    //       payment * (1 + rate * type) * periods +
    //       future;
    //   } else {
    //     f = Math.exp(periods * Math.log(1 + rate));
    //     y = present * f + payment * (1 / rate + type) * (f - 1) + future;
    //   }
    //   y0 = y1;
    //   y1 = y;
    //   ++i;
    // }
    // console.log('rate',rate);
    return formattedFormula;
  },
  calcularTna: function (rate) {
    return (+rate * 365) / 30;
  },
  calcularPunitorios: function (restanteCuota, diasDeAtraso) {
    let interes_diario = 125 / 365;
    const punitoriosValue =
      ((+restanteCuota * +interes_diario) / 100) * +diasDeAtraso;
    return punitoriosValue;
  },
};
