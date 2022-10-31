function create(carbrand, carmodel, caryear, domain, details, clientid, callback) {
    mysqli.query(
        "INSERT IGNORE INTO cars ( brand,model,year,domain,details,clientID) VALUES (?,?,?,?,?,?)",
        [carbrand, carmodel, caryear, domain, details, clientid],
        (err, rows) => {
            mysqli.query(
                "SELECT * FROM cars WHERE clientID = ? ORDER BY id DESC",
                [clientid],
                (err, rows) => {
                    if (rows.length > 0) {
                        return callback(err, rows[0]);
                    } else {
                        return callback(err, []);
                    }
                }
            );
        }
    );
};

module.exports = {
    create
};