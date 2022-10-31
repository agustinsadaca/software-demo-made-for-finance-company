function create(address, number, department, type, clientID, budget, callback) {
    mysqli.query(
        "INSERT IGNORE INTO address ( address,number,department,type,clientID,budget) VALUES (?,?,?,?,?,?)",
        [address, number, department, type, clientID, budget],
        (err, rows) => {
            mysqli.query(
                "SELECT * FROM address WHERE clientID = ? AND budget = ? ORDER BY id DESC",
                [clientID, budget],
                (err, rows) => {
                    if (rows.length > 0) {
                        return callback(null, rows[0]);
                    } else {
                        return callback(err, null);
                    }
                }
            );
        }
    );
};

module.exports = {
    create
}
