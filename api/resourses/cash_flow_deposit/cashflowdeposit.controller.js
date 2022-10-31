async function getTotal(start = "", end = ""){
    const util = require("util");
    const query = util.promisify(mysqli.query).bind(mysqli);
    let result;
    const sql = `select banksantander bancoSantander from cash_flow_deposit`
    if(start, end){
        result = await query(sql,[start, end])
    }else{
        result = await query(sql, [])
    }
    return result[0];
}
module.exports = {
    getTotal
}