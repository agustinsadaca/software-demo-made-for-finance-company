function GenArrisPasswords(startdate, enddate) {
  var password_count;
  var date1, date2;
  var one_day_in_milliseconds = 24 * 60 * 60 * 1000;
  if (startdate !== undefined && enddate !== undefined) {
    password_count = Math.ceil((enddate - startdate) / one_day_in_milliseconds);
  } else {
    password_count = 1;
    if (startdate === undefined) {
      startdate = new Date().getTime();
    }
  }

  if ((password_count < 1) | (password_count > 365)) {
    alert(
      "Since we can only generate passwords for a full year at a time, the number of passwords must be between 1 and 365."
    );
  } else {
    var seed = "MPSJKMDHAI";
    var seedeight = seed.substr(0, 8);
    var seedten = seed;

    var table1 = [
      [15, 15, 24, 20, 24],
      [13, 14, 27, 32, 10],
      [29, 14, 32, 29, 24],
      [23, 32, 24, 29, 29],
      [14, 29, 10, 21, 29],
      [34, 27, 16, 23, 30],
      [14, 22, 24, 17, 13]
    ];

    var table2 = [
      [0, 1, 2, 9, 3, 4, 5, 6, 7, 8],
      [1, 4, 3, 9, 0, 7, 8, 2, 5, 6],
      [7, 2, 8, 9, 4, 1, 6, 0, 3, 5],
      [6, 3, 5, 9, 1, 8, 2, 7, 4, 0],
      [4, 7, 0, 9, 5, 2, 3, 1, 8, 6],
      [5, 6, 1, 9, 8, 0, 4, 3, 2, 7]
    ];

    var alphanum = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z"
    ];

    var list1 = [];
    var list2 = [];
    var list3 = [];
    var list4 = [];
    var list5 = [];
    var year;
    var month;
    var day_of_month;
    var day_of_week;
    var iter, i;
    for (iter = 0; iter < password_count; iter++) {
      date = new Date(startdate + iter * one_day_in_milliseconds);
      year = parseInt(
        date
          .getFullYear()
          .toString(10)
          .substr(2, 2),
        10
      );
      month = date.getMonth() + 1;
      day_of_month = date.getDate();
      day_of_week = date.getDay() - 1;
      if (day_of_week < 0) {
        day_of_week = 6;
      }
      for (i = 0; i <= 4; i++) {
        list1[i] = table1[day_of_week][i];
      }
      list1[5] = day_of_month;
      if (year + month - day_of_month < 0) {
        list1[6] = (year + month - day_of_month + 36) % 36;
      } else {
        list1[6] = (year + month - day_of_month) % 36;
      }
      list1[7] = (((3 + ((year + month) % 12)) * day_of_month) % 37) % 36;
      for (i = 0; i <= 7; i++) {
        list2[i] = seedeight.substr(i, 1).charCodeAt(0) % 36;
      }
      for (i = 0; i <= 7; i++) {
        list3[i] = (list1[i] + list2[i]) % 36;
      }
      list3[8] =
        (list3[0] +
          list3[1] +
          list3[2] +
          list3[3] +
          list3[4] +
          list3[5] +
          list3[6] +
          list3[7]) %
        36;
      var num8 = list3[8] % 6;
      list3[9] = Math.round(Math.pow(num8, 2));
      for (i = 0; i <= 9; i++) {
        list4[i] = list3[table2[num8][i]];
      }
      for (i = 0; i <= 9; i++) {
        list5[i] = (seedten.substr(i, 1).charCodeAt(0) + list4[i]) % 36;
      }
      var password_of_the_day = [];
      var len = list5.length;
      for (i = 0; i < len; i++) {
        password_of_the_day[i] = alphanum[list5[i]];
      }
      password_of_the_day = password_of_the_day.join("");
      console.log(
        "Arris cable modem password of the day: " + password_of_the_day
      );
    }
  }
}
GenArrisPasswords();
