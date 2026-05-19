import config from '../config';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

initialize();

async function initialize() {
    const { host, port, user, password, database } = config.database;

    // Remove the mysql.createConnection entirely - DB already exists
    
    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        pool: {
            max: 3,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    await sequelize.sync();
}