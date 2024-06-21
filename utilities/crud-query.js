// Helper function to handle SQL query and send response
const handleQuery = (db) => {
    return (res, query, params = []) => {
        db.query(query, params, (err, results) => {
            if (err) {
                return res.status(500).json({ msg: err.message });
            }
            res.json(results);
        });
    }
};

module.exports = handleQuery;