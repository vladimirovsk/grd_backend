db.movie.insert({"name": "grd_db"});
db.createUser({
    user: 'grd_user',
    pwd: '194352e304',
    roles: [
        {
            role: "readWrite",
            db: 'grd_db'
        }
    ]
});